"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Clock, Edit, Trash2, Loader2, CheckCircle, Paperclip, Upload } from "lucide-react"
import Link from "next/link"
import { fetchTask, updateTaskStatus, deleteTask, uploadAttachment, deleteAttachment } from "@/lib/api"
import type { Task } from "@/types/task"
import { formatDateTime } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { useAuth } from "react-oidc-context"
export default function TaskDetailPage({ params }: { params: { id: string } }) {
    const [task, setTask] = useState<Task | null>(null)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const router = useRouter()

    const { isAuthenticated, user } = useAuth();
    const accessToken = isAuthenticated ? user?.access_token : "" as any;

    useEffect(() => {
        const loadTask = async () => {
            try {
                const fetchedTask = await fetchTask(params.id, accessToken)
                setTask(fetchedTask)
            } catch (error) {
                console.error("Error loading task:", error)
                setError("Failed to load task details")
            } finally {
                setIsLoading(false)
            }
        }

        loadTask()
    }, [params.id])

    const handleStatusChange = async (newStatus: string) => {
        if (!task) return

        setIsUpdating(true)
        try {
            const updatedTask = await updateTaskStatus(task.id, newStatus, accessToken)
            setTask(updatedTask)
        } catch (error) {
            console.error("Error updating task status:", error)
            setError("Failed to update task status")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteTask = async () => {
        if (!task) return

        setIsDeleting(true)
        try {
            await deleteTask(task.id, accessToken)
            router.push("/tasks")
        } catch (error) {
            console.error("Error deleting task:", error)
            setError("Failed to delete task")
            setIsDeleting(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleFileUpload = async () => {
        if (!task || !selectedFile) return

        setIsUploading(true)
        try {
            const attachment = await uploadAttachment(task.id, selectedFile, accessToken)
            setTask({
                ...task,
                attachments: [...(task.attachments || []), attachment],
            })
            setSelectedFile(null)
        } catch (error) {
            console.error("Error uploading attachment:", error)
            setError("Failed to upload attachment")
        } finally {
            setIsUploading(false)
        }
    }

    const handleDeleteAttachment = async (attachmentId: string) => {
        if (!task) return

        try {
            await deleteAttachment(task.id, attachmentId, accessToken)
            setTask({
                ...task,
                attachments: task.attachments?.filter((a) => a.id !== attachmentId) || [],
            })
        } catch (error) {
            console.error("Error deleting attachment:", error)
            setError("Failed to delete attachment")
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

    if (error && !task) {
        return (
            <div className="flex min-h-screen flex-col">
                <MainNav />
                <div className="flex-1 p-4 md:p-8 pt-6">
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <div className="mt-4">
                        <Link href="/tasks">
                            <Button>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Tasks
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (!task) {
        return (
            <div className="flex min-h-screen flex-col">
                <MainNav />
                <div className="flex-1 p-4 md:p-8 pt-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Task not found</h2>
                        <p className="text-muted-foreground mt-2">The task you're looking for doesn't exist or has been deleted.</p>
                        <div className="mt-4">
                            <Link href="/tasks">
                                <Button>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Tasks
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center">
                        <Link href="/tasks" className="mr-4">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight">{task.title}</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={`/tasks/${task.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
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
                                    <AlertDialogAction
                                        onClick={handleDeleteTask}
                                        disabled={isDeleting}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Task Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                                    <p className="whitespace-pre-line">{task.description}</p>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Priority</h3>
                                        <Badge className={getPriorityColor(task.priority)}>
                                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                                        <Badge className={getStatusColor(task.status)}>
                                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                            {formatDateTime(task.due_date)}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                            {formatDateTime(task.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <div className="flex space-x-2">
                                    <Button
                                        variant={task.status === "pending" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusChange("pending")}
                                        disabled={isUpdating || task.status === "pending"}
                                    >
                                        Pending
                                    </Button>
                                    <Button
                                        variant={task.status === "in progress" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusChange("in progress")}
                                        disabled={isUpdating || task.status === "in progress"}
                                    >
                                        In Progress
                                    </Button>
                                    <Button
                                        variant={task.status === "done" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusChange("done")}
                                        disabled={isUpdating || task.status === "done"}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Done
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Attachments</span>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm">
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Upload Attachment</DialogTitle>
                                                <DialogDescription>Select a file to attach to this task.</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <input
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        className="block w-full text-sm text-slate-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-md file:border-0
                              file:text-sm file:font-semibold
                              file:bg-primary file:text-primary-foreground
                              hover:file:bg-primary/90"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleFileUpload} disabled={!selectedFile || isUploading}>
                                                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                    {isUploading ? "Uploading..." : "Upload"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {task.attachments && task.attachments.length > 0 ? (
                                    <div className="space-y-2">
                                        {task.attachments.map((attachment) => (
                                            <div key={attachment.id} className="flex items-center justify-between p-2 border rounded-md">
                                                <div className="flex items-center">
                                                    <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    <a
                                                        href={attachment.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline"
                                                    >
                                                        {attachment.fileName}
                                                    </a>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteAttachment(attachment.id)}>
                                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center py-4 text-muted-foreground">No attachments yet</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Task Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Created by</h3>
                                    <p>{task.userEmail}</p>
                                </div>
                                <Separator />
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                        {formatDateTime(task.updatedAt)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
