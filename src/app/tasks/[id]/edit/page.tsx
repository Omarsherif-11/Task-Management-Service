"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "react-oidc-context"
import { MainNav } from "@/components/main-nav"
import { TaskForm } from "@/components/task-form"
import { fetchTask } from "@/lib/api"
import { Loader2 } from "lucide-react"
import type { Task } from "@/types/task"

export default function EditTaskPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isLoading: authLoading, isAuthenticated } = useAuth()
    const [task, setTask] = useState<Task | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const taskId = params.id as string


    if (isAuthenticated || !authLoading) {
        return null
    }

    useEffect(() => {

        const loadTask = async () => {
            try {
                if (user) {
                    const accessToken = user.access_token
                    const fetchedTask = await fetchTask(taskId, accessToken)
                    setTask(fetchedTask)
                }
            } catch (err: any) {
                console.error("Error loading task:", err)
                setError(err.message || "Failed to load task")
            } finally {
                setIsLoading(false)
            }
        }

        if (user) {
            loadTask()
        }
    }, [taskId, user, authLoading, router])

    if (authLoading || isLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <MainNav />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    if (error || !task) {
        return (
            <div className="flex min-h-screen flex-col">
                <MainNav />
                <div className="flex-1 p-8 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold mb-4">Error</h2>
                    <p className="text-muted-foreground">{error || "Task not found"}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />
            <div className="flex-1 container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-6">Edit Task</h1>
                <TaskForm task={task} isEditing={true} />
            </div>
        </div>
    )
}
