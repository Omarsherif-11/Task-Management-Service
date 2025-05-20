"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "react-oidc-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MainNav } from "@/components/main-nav"
import { fetchTask, deleteTask, updateTask } from "@/lib/api"
import { formatDate, formatDateTime } from "@/lib/utils"
import { Loader2, Calendar, Clock, Paperclip, Edit, Trash, ArrowLeft, FileIcon, Download } from "lucide-react"
import type { Task } from "@/types/task"

export default function TaskDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const [task, setTask] = useState<Task | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const taskId = params.id as string

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
    }, [taskId, user])

    const handleDeleteTask = async () => {
        if (!user || !task) return

        setIsDeleting(true)
        try {
            const accessToken = user.access_token
            await deleteTask(task.task_id, accessToken)
            router.push("/dashboard")
        } catch (err: any) {
            console.error("Error deleting task:", err)
            setError(err.message || "Failed to delete task")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDeleteFile = async () => {
        if (!user || !task) return

        setIsDeleting(true)
        try {
            const accessToken = user.access_token

            // Update the task with file set to null to remove it
            await updateTask(
                task.task_id,
                {
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    due_date: task.due_date,
                    status: task.status,
                    file: null, // This tells the backend to remove the file
                },
                accessToken,
            )

            // Reload the task
            const updatedTask = await fetchTask(task.task_id, accessToken)
            setTask(updatedTask)
        } catch (err: any) {
            console.error("Error deleting file:", err)
            setError(err.message || "Failed to delete file")
        } finally {
            setIsDeleting(false)
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case "high":
                return "bg-destructive text-destructive-foreground"
            case "medium":
                return "bg-amber-500 text-white"
            case "low":
                return "bg-green-500 text-white"
            default:
                return "bg-secondary text-secondary-foreground"
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "done":
                return "bg-green-500 text-white"
            case "in progress":
                return "bg-amber-500 text-white"
            case "pending":
                return "bg-secondary text-secondary-foreground"
            default:
                return "bg-secondary text-secondary-foreground"
        }
    }

    if (isLoading) {
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
                    <p className="text-muted-foreground mb-6">{error || "Task not found"}</p>
                    <Button onClick={() => router.push("/dashboard")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />
            <div className="flex-1 container mx-auto p-4 md:p-8">
                <div className="flex items-center mb-6">
                    <Button variant="outline" onClick={() => router.back()} className="mr-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold flex-1">{task.title}</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push(`/tasks/${task.task_id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the task and all its attachments.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteTask} disabled={isDeleting}>
                                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-medium mb-2">Description</h3>
                                    <p className="text-muted-foreground whitespace-pre-line">
                                        {task.description || "No description provided."}
                                    </p>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium mb-2">Priority</h3>
                                        <Badge className={getPriorityColor(task.priority)}>
                                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-2">Status</h3>
                                        <Badge className={getStatusColor(task.status)}>
                                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <h3 className="font-medium">Due Date</h3>
                                            <p className="text-muted-foreground">{formatDate(task.due_date)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <h3 className="font-medium">Created</h3>
                                            <p className="text-muted-foreground">{formatDateTime(task.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Paperclip className="h-4 w-4 mr-2" />
                                    Attachment
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {task.file_name && task.file_url ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-2 border rounded-md">
                                            <div className="flex items-center">
                                                <FileIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span className="text-sm truncate max-w-[150px]">{task.file_name}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => window.open(task.signed_file_url || task.file_url, "_blank")}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete attachment?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete the attachment.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={handleDeleteFile} disabled={isDeleting}>
                                                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                                {isDeleting ? "Deleting..." : "Delete"}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center py-4 text-muted-foreground">No attachment</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
