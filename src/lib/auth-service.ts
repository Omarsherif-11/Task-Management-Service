
import { signUp, confirmSignUp, signIn, signOut, getCurrentUser } from 'aws-amplify/auth';
import { amplifyConfig } from '../../aws-exports';
import { Amplify } from 'aws-amplify';
Amplify.configure(amplifyConfig as any)


export const oidcConfig = {
    authority: process.env.NEXT_PUBLIC_DOMAIN,
    client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID, // Your Cognito client ID
    redirect_uri: 'http://localhost:3000/callback', // Your redirect URI
    scope: 'openid phone email', // Add necessary scopes
    response_type: 'code',
};

// Register a user with email + password
export async function register(email: string, password: string) {
    return await signUp({
        username: email,
        password,
        options: {
            userAttributes: { email },
        },
    });
}

// Confirm user with verification code
export async function confirmUser(email: string, code: string) {
    return await confirmSignUp({ username: email, confirmationCode: code });
}

// Log in
export async function login(email: string, password: string) {
    return await signIn({ username: email, password });
}

// Log out
export async function logout() {
    return await signOut();
}

export async function getUser() {
    try {
        return await getCurrentUser();
    } catch {
        return null;
    }
}
