import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

const handler = NextAuth({
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!,
    }),
  ],
  callbacks: {
		async jwt({ token, user, account, profile, isNewUser }) {
			if (user) {
				token.id = user.id
			}
			if (account) {
				token.accessToken = account.access_token
			}
			return token
		},
		async session({ session, token, user }) {
			// @ts-expect-error
			session.token = token.accessToken
			return session
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };