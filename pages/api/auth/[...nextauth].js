import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
// import AppleProvider from "next-auth/providers/apple"
// import EmailProvider from "next-auth/providers/email"
import User from "../../../db/models/user";
import clientPromise from "../../../lib/mongodb";

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    /* EmailProvider({
         server: process.env.EMAIL_SERVER,
         from: process.env.EMAIL_FROM,
       }),
    // Temporarily removing the Apple provider from the demo site as the
    // callback URL for it needs updating due to Vercel changing domains
    Providers.Apple({
      clientId: process.env.APPLE_ID,
      clientSecret: {
        appleId: process.env.APPLE_ID,
        teamId: process.env.APPLE_TEAM_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY,
        keyId: process.env.APPLE_KEY_ID,
      },
    }),
    */
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async jwt({ token }) {
      token.userRole = token.role || "client"; // Default role
      return token;
    },
    async session({ session, token, user }) {
      session.user.username = user.username;
      session.user.role = user.role;
      session.user.favorites = user.favorites;
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      let userEmail = user?.email;
      let existingUser = await User.findOne({ email: userEmail });

      if (existingUser) {
        // Handle role-specific logic here
        // if (user.role === "trainer") {
        //   // Add logic for trainers here
        // } else if (user.role === "client") {
        //   // Add logic for clients here
        // }

        if (!existingUser?.username) {
          let newId = makeid(12).toString() + "!@$";
          existingUser.username = newId;
          await existingUser.save();
        }
      } else if (!existingUser) {
        user.role = "client";

        return true;
      }

      return user;
    },
  },
  secret: "PLACE-HERE-ANY-STRING",
  pages: {
    signIn: "/auth",
  },
};

export default NextAuth(authOptions);
