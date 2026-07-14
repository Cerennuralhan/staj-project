import type { Rol } from "@/lib/auth/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rol: Rol;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    rol: Rol;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: Rol;
  }
}
