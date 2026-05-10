import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import connectDb from "../../../db/config";
import User from "../../../db/models/user";
import clientPromise from "../../../lib/mongodb";

function makeid(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[auth] authorize: missing email or password");
          return null;
        }

        try {
          await connectDb();

          const user = await User.findOne({ email: credentials.email }).select(
            "+password"
          );

          console.log(
            "[auth] authorize: user found =",
            !!user,
            "| has password =",
            !!user?.password
          );

          if (!user?.password) return null;

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log("[auth] authorize: bcrypt isValid =", isValid);

          if (!isValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            username: user.username,
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  theme: {
    colorScheme: "dark",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "client";
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token, user }) {
      // JWT strategy: user object not available — read from token
      // Database strategy (OAuth): user object is available
      if (token) {
        session.user.id = token.id || user?.id;
        session.user.role = token.role || user?.role || "client";
        session.user.username = token.username || user?.username;
      } else if (user) {
        session.user.id = user.id;
        session.user.role = user.role || "client";
        session.user.username = user.username;
      }
      session.user.facilities = user?.facilities || [];
      session.user.workoutHistory = user?.workoutHistory || [];
      return session;
    },
    async signIn({ user, account }) {
      // Only run DB logic for OAuth providers (credentials handled in authorize)
      if (account?.type === "credentials") return true;

      const existingUser = await User.findOne({ email: user?.email });

      if (existingUser) {
        if (!existingUser.username) {
          existingUser.username = makeid(12) + "!@$";
          await existingUser.save();
        }
      } else {
        user.role = "client";
        user.facilities = [];
        user.workoutHistory = [];
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "PLACE-HERE-ANY-STRING",
  pages: {
    signIn: "/auth",
  },
};

export default NextAuth(authOptions);
