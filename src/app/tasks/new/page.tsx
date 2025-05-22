"use client"

import { MainNav } from "@/components/main-nav"
import { TaskForm } from "@/components/task-form"
import { useAuth } from "react-oidc-context"

export default function NewTaskPage() {

    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading || !isAuthenticated) {
        return null
    }

    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />
            <div className="flex-1 container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-6">Create New Task</h1>
                <TaskForm />
            </div>
        </div>
    )
}
