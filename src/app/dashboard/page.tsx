'use client'
import { useAuth } from 'react-oidc-context';
import { MainNav } from "@/components/main-nav"
import { DashboardContent } from "@/components/dashboard-content"

export default function DashboardPage() {
    // Ensure user is authenticated
    const auth = useAuth()
    // Get current user
    const user = auth.user;

    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />
            <DashboardContent />
        </div>
    )
}
