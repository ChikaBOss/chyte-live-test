import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export default function requireAuth(
  req: NextRequest,
  allowedRoles: string[] = [] // <= NEW FEATURE
) {
  try {
    const token = req.cookies.get("chyte_token")?.value;

    if (!token) {
      return {
        error: NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ),
      };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };

    // Role checking
    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      return {
        error: NextResponse.json(
          { error: "Forbidden: insufficient role" },
          { status: 403 }
        ),
      };
    }

    return { user: decoded }; // valid user
  } catch (error) {
    return {
      error: NextResponse.json(
        { error: "Invalid Token" },
        { status: 401 }
      ),
    };
  }
}