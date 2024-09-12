import bcrypt from "bcryptjs";
import NextAuth, { NextAuthConfig } from "next-auth";
import credentials from "next-auth/providers/credentials";
import { getUserByEmail } from "./server-utils";
import { authSchema } from "./validations";
import { sleep } from "./utils";

const config = {
  pages: {
    signIn: "/login",
  },
  providers: [
    credentials({
      async authorize(credentials) {
        // runs on login

        const validatedFormDataObject = authSchema.safeParse(credentials);
        if (!validatedFormDataObject.success) {
          return null;
        }

        const { email, password } = validatedFormDataObject.data;
        const user = await getUserByEmail(email);
        if (!user) {
          console.log("No user found!");
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          password,
          user.hashedPassword
        );
        if (!passwordsMatch) {
          console.log("Invalid credentials!");
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    authorized: ({ request, auth }) => {
      // runs on every request with middleware
      const isTryingToAccessApp = request.nextUrl.pathname.includes("/app");
      const isLoggedIn = Boolean(auth?.user);

      if (!isLoggedIn && isTryingToAccessApp) {
        return false;
      }

      if (isLoggedIn && isTryingToAccessApp && auth?.user.hasAccess) {
        return true;
      }
      if (isLoggedIn && isTryingToAccessApp && !auth?.user.hasAccess) {
        return Response.redirect(new URL("/payment", request.nextUrl));
      }

      if (
        isLoggedIn &&
        (request.nextUrl.pathname.includes("/login") ||
          request.nextUrl.pathname.includes("/signup")) &&
        auth?.user.hasAccess
      ) {
        return Response.redirect(new URL("/app/dashboard", request.nextUrl));
      }

      if (isLoggedIn && !isTryingToAccessApp && !auth?.user.hasAccess) {
        if (
          request.nextUrl.pathname.includes("/login") ||
          request.nextUrl.pathname.includes("/signup")
        ) {
          return Response.redirect(new URL("/payment", request.nextUrl));
        }
        return true;
      }

      if (!isLoggedIn && !isTryingToAccessApp) {
        return true;
      }
      console.log("here");
      return false;
    },
    jwt: async ({ token, user, trigger }) => {
      // we want to extend the token to include userId (not passed automatically)
      if (user) {
        token.userId = user.id;
        token.email = user.email!;
        token.hasAccess = user.hasAccess;
      }

      if (trigger === "update") {
        await sleep(1000);
        const userFromDB = await getUserByEmail(token.email);
        if (userFromDB) {
          token.hasAccess = userFromDB.hasAccess;
        }
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.userId;
      session.user.hasAccess = token.hasAccess;
      return session;
    },
  },
} satisfies NextAuthConfig;

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(config);
