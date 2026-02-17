import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Chef from "@/models/Chef";
import Vendor from "@/models/Vendor";
import Pharmacy from "@/models/Pharmacy";
import TopVendor from "@/models/TopVendor";

export async function GET() {
  await connectToDB();
  
  const chefs = await Chef.find({}, "email _id").limit(5);
  const vendors = await Vendor.find({}, "email _id").limit(5);
  const pharmacies = await Pharmacy.find({}, "email _id").limit(5);
  const topVendors = await TopVendor.find({}, "email _id").limit(5);
  
  return NextResponse.json({
    chefs: chefs.map(c => ({ id: c._id, email: c.email, role: "chef" })),
    vendors: vendors.map(v => ({ id: v._id, email: v.email, role: "vendor" })),
    pharmacies: pharmacies.map(p => ({ id: p._id, email: p.email, role: "pharmacy" })),
    topVendors: topVendors.map(t => ({ id: t._id, email: t.email, role: "topvendor" })),
    
    // Test users from your screenshots
    testUsers: [
      { id: "696b7595d13d0ca193c05f75", role: "chef", note: "Has ₦7,000" },
      { id: "696e5260b9657096798e4f84", role: "vendor", note: "Has ₦5,000" }
    ]
  });
}