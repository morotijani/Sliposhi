import { AuthClient } from "@dfinity/auth-client" // for authentication
// URL of the webapp for the internet identity
// The URL is used for authentication

const IDENTITY_PROVIDER = `http://localhost:4943/?canisterId=bd3sg-teaaa-aaaaa-qaaba-cai#authorize`; // canister id might be different, rely on the output of the deploy command to get the correct canister ID 
const MAX_TTL = 7 * 24 * 60 * 60 * 1000 * 1000 * 1000; // Maximum time to live for authentication in nanoseconds

// Create an instance of the AuthClient
export async function getAuthClient() {
    return await AuthClient.create();
}

// Initiate user login process
export async function login() {
    const authClient = window.auth.client;
    // check if user is already authenticated
    const isAuthenticated = await authClient.isAuthenticated();
    // if not authenticated, us authClient to trigger the login process
    if (!isAuthenticated) {
        await authClient?.login({
            identityProvider: IDENTITY_PROVIDER,
            onSuccess: async () => {
                window.auth.isAuthenticated = await authClient.isAuthenticated();
                window.location.reload();
            },
            maxTimeToLive: MAX_TTL,
        });
    }
}

// Log user out of the application securely using the DFINITY AuthClient and Internet identity
export async function logout() {
    const authClient = window.auth.client;
    authClient.logout();
    window.location.reload();
}
