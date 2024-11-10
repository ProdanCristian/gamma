import { AuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

declare module "next-auth" {
  interface User {
    firstName?: string;
    lastName?: string;
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }
  interface Session {
    user: {
      id: string;
      provider: string;
      firstName?: string;
      lastName?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    provider: string;
    firstName?: string;
    lastName?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          firstName: profile.given_name || "",
          lastName: profile.family_name || "",
          name: profile.name,
          image: profile.picture,
        };
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "email,public_profile",
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/facebook`,
        },
      },
      profile(profile) {
        const firstName = profile.first_name || "";
        const lastName = profile.last_name || "";

        return {
          id: profile.id,
          email: profile.email,
          firstName: firstName,
          lastName: lastName,
          name: `${firstName} ${lastName}`.trim(),
          image: profile.picture?.data?.url,
        };
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const { rows } = await db.query(
            'SELECT * FROM "nc_pka4___Utilizatori" WHERE "Email" = $1',
            [credentials.email]
          );

          const user = rows[0];

          if (!user?.Password) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.Password
          );

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.Email,
            firstName: user.Nume,
            lastName: user.Prenume,
            name: `${user.Nume} ${user.Prenume}`.trim(),
            provider: "credentials",
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        const { rows } = await db.query(
          'SELECT * FROM "nc_pka4___Utilizatori" WHERE "Email" = $1',
          [user.email]
        );

        if (account?.provider === "credentials") {
          return rows.length > 0;
        }

        if (
          account?.provider === "facebook" ||
          account?.provider === "google"
        ) {
          const firstName = user.firstName || "";
          const lastName = user.lastName || "";

          if (rows.length === 0) {
            const providerIdField =
              account.provider === "google" ? "Google_id" : "Facebook_id";
            const result = await db.query(
              `INSERT INTO "nc_pka4___Utilizatori" 
               ("Nume", "Prenume", "Email", "${providerIdField}", "Provider", "Is_verified", "created_at") 
               VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
               RETURNING *`,
              [
                firstName,
                lastName,
                user.email,
                account.providerAccountId,
                account.provider,
                true,
              ]
            );
            user.id = result.rows[0].id.toString();
          } else {
            const providerIdField =
              account.provider === "google" ? "Google_id" : "Facebook_id";
            const result = await db.query(
              `UPDATE "nc_pka4___Utilizatori" 
               SET "${providerIdField}" = $1,
                   "Provider" = $2
               WHERE "Email" = $3 
               RETURNING *`,
              [account.providerAccountId, account.provider, user.email]
            );
            user.id = result.rows[0].id.toString();
            user.firstName = result.rows[0].Nume;
            user.lastName = result.rows[0].Prenume;
          }
        }
        return true;
      } catch (error) {
        return false;
      }
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.name = `${user.firstName} ${user.lastName}`.trim();
      }

      if (account) {
        token.provider = account.provider;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.provider = token.provider;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.name = `${token.firstName} ${token.lastName}`.trim();
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).hostname === new URL(baseUrl).hostname) {
        return url;
      }
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
