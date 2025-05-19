'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function CallbackPage() {
    const auth = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log("Callback page loaded");
        console.log("Auth state:", auth);

        if (!auth.isLoading && auth.isAuthenticated) {
            console.log("User authenticated, redirecting to dashboard");
            router.push('/dashboard');
        } else if (!auth.isLoading && auth.error) {
            console.error("Authentication error:", auth.error);
            router.push('/login?error=' + encodeURIComponent(auth.error.message));
        }
    }, [auth, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Processing login...</h1>
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
            </div>
        </div>
    );
}