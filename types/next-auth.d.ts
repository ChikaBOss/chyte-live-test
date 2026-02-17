// types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    businessName: string;
  }

  interface Session {
    user: User & {
      id: string;
      role: string;
      businessName: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    businessName: string;
  }
}