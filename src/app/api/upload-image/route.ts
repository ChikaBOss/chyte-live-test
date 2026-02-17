// src/app/api/upload-image/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

type Body = {
  image?: string;   // data:... base64
  base64?: string;  // alternative key
};

function ensureUploadsDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function POST(req: Request) {
  try {
    // Read body once as text and parse (avoid req.json() being called elsewhere)
    const raw = await req.text();
    let body: Body = {};
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch (e) {
        // not JSON -> treat as empty
        body = {};
      }
    }

    const dataUrl = body.image ?? body.base64 ?? null;

    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
      console.log("upload-image: invalid or missing dataUrl");
      return NextResponse.json({ success: false, error: "Invalid or missing data URL" }, { status: 400 });
    }

    // parse data URL: data:[<mediatype>][;base64],<data>
    const matches = dataUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
    if (!matches) {
      console.log("upload-image: dataUrl does not match expected pattern");
      return NextResponse.json({ success: false, error: "Invalid image data URL" }, { status: 400 });
    }

    const mime = matches[1]; // e.g. image/png
    const base64Data = matches[2];
    const ext = mime.split("/")[1].split("+")[0] || "png";

    // decode base64
    const buffer = Buffer.from(base64Data, "base64");

    // Save to public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    ensureUploadsDir(uploadsDir);

    const filename = `${Date.now()}-${uuidv4()}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    console.log("upload-image: saved", filepath);

    return NextResponse.json({ success: true, url }, { status: 201 });
  } catch (err: any) {
    console.error("upload-image error:", err);
    return NextResponse.json({ success: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}