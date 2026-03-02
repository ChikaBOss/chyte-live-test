import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectToDB } from "./mongodb";

import Chef from "@/models/Chef";
import Vendor from "@/models/Vendor";
import Pharmacy from "@/models/Pharmacy";
import TopVendor from "@/models/TopVendor";
import Admin from "@/models/Admin";
import Rider from "@/models/Rider"; // ✅ import Rider

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectToDB();

        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;
        const requestedRole = credentials.role;

        console.log("🔐 Login attempt:", { email, requestedRole });

        // ✅ IF ROLE IS SPECIFIED, CHECK ONLY THAT COLLECTION
        if (requestedRole) {
          const roleMap = {
            chef: Chef,
            vendor: Vendor,
            pharmacy: Pharmacy,
            topvendor: TopVendor,
            admin: Admin,
            rider: Rider, // ✅ ADD RIDER
          };

          const Model = roleMap[requestedRole as keyof typeof roleMap];
          if (!Model) {
            console.log("❌ Invalid role requested:", requestedRole);
            return null;
          }

          const user = await Model.findOne({ email });
          if (!user) {
            console.log(`❌ No ${requestedRole} found with email:`, email);
            return null;
          }

          if (requestedRole !== 'admin' && user.approved === false) {
            throw new Error("Account not approved");
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            console.log("❌ Password mismatch for:", email);
            return null;
          }

          console.log(`✅ Logging in as ${requestedRole}:`, user._id);

          // Handle name extraction (Rider uses `name`, others use ownerName/businessName)
          let name = user.name || user.ownerName || user.businessName || user.email;
          // For riders, they have a `name` field directly
          if (requestedRole === 'rider') {
            name = user.name;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: name,
            role: requestedRole,
            businessName: user.businessName || "",
          };
        }

        // ✅ FALLBACK: CHECK ALL ROLES (including rider)
        console.log("⚠️ No role specified, checking all collections");
        const userChecks = [
          { model: Chef, role: "chef" },
          { model: Vendor, role: "vendor" },
          { model: Pharmacy, role: "pharmacy" },
          { model: TopVendor, role: "topvendor" },
          { model: Admin, role: "admin" },
          { model: Rider, role: "rider" }, // ✅ ADD RIDER
        ];

        for (const { model, role } of userChecks) {
          const user = await model.findOne({ email });
          if (!user) continue;

          if (role !== 'admin' && user.approved === false) {
            throw new Error("Account not approved");
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) return null;

          console.log(`✅ Found user in ${role} collection:`, user._id);

          // Handle name extraction
          let name = user.name || user.ownerName || user.businessName || user.email;
          if (role === 'rider') {
            name = user.name;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: name,
            role,
            businessName: user.businessName || "",
          };
        }

        console.log("❌ No user found in any collection for:", email);
        return null;
      },
    }),
  ],

  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.businessName = user.businessName;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as string,
        businessName: token.businessName as string,
      };
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};