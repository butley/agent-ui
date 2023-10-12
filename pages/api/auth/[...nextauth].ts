import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {PortalUser, UserEntity} from "@/types/agent/models";
import {createUser, getUserByEmail} from "@/components/agent/api";

async function createUserIfNotExists(portalUser: PortalUser): Promise<UserEntity | undefined> {
    try {
        const response = await getUserByEmail(portalUser.email!!);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            const newUser: UserEntity = {
                email: portalUser.email,
                firstName: portalUser.firstName,
                lastName: portalUser.lastName,
                provider: 'GOOGLE',
                status: 'ACTIVE',
            };
            const createdUser = await createUser(newUser);
            return createdUser.data;
        } else {
            throw error;
        }
    }
}

export default NextAuth({

    // Configure one or more authentication providers
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {label: "Email", type: "text"},
                password: {label: "Password", type: "password"}
            },
            async authorize(credentials) {
                const user = {id: 1, name: 'Your User', email: credentials.email} // Stub user object
                const credentialDetails = {
                    email: credentials.email,
                    password: credentials.password,
                };

                try {
                    const response = await getUserByEmail(credentials.email);
                    return response.data;
                } catch (error) {

                }
                // Here, make a fetch to your backend endpoint to validate the email/password
                const res = await fetch("your-backend-endpoint", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });

                if (res.ok) {
                    return Promise.resolve(user)
                } else {
                    return Promise.resolve(null)
                }
            }
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        // GithubProvider({
        //   clientId: process.env.GITHUB_ID as string,
        //   clientSecret: process.env.GITHUB_SECRET as string,
        // }),
        // ...add more providers here
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            var id = undefined
            try {
                const response = await getUserByEmail(profile?.email!!);
                id = response.data.id
            } catch (error) {

            }

            user.portalUser  = {
                id: id,
                clientId: account?.providerAccountId,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                clientName: account?.provider,
                email: profile?.email,
                firstName: profile?.given_name,
                lastName: profile?.family_name,
                emailVerified: profile?.email_verified,
                idToken: account?.id_token,
                picture: user.image,
            };
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.user = user;
            }
            return token;
        },
        async session({ session, token }) {
            session.user = { ...session.user, ...token.user.portalUser };
            return session;
        },
        redirect() {
            return '/agent/home'
        },
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET
});
