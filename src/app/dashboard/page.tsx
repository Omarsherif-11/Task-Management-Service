'use client'

import { MainNav } from "@/components/main-nav"
import { DashboardContent } from "@/components/dashboard-content"
import { useAuth } from "react-oidc-context"

export default function DashboardPage() {

    const { isLoading, isAuthenticated } = useAuth()

    if (isLoading || !isAuthenticated) {
        return null
    }

    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />
            <DashboardContent />
        </div>
    )
}
