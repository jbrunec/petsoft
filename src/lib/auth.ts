import bcrypt from "bcryptjs";
import NextAuth, { NextAuthConfig } from "next-auth";
import credentials from "next-auth/providers/credentials";
import { getUserByEmail } from "./server-utils";
import { authSchema } from "./validations";

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

      if (isLoggedIn && isTryingToAccessApp) {
        return true;
      }

      if (isLoggedIn && !isTryingToAccessApp) {
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

      return false;
    },
    jwt: ({ token, user }) => {
      // we want to extend the token to include userId (not passed automatically)
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.userId;
      }
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
