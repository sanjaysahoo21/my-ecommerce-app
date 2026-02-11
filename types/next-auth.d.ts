import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    /**
     * Extends the built-in session types to include user id
     */
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
    }
}
