"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "react-oidc-context"
import type { Task } from "@/types/task"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import { updateTask, deleteTask } from "@/lib/api"
import { CalendarIcon, Paperclip, MoreVertical, Edit, Trash, CheckCircle, Clock } from "lucide-react"

interface TaskCardProps {
    task: Task
    onTaskUpdated?: () => void
}

export function TaskCard({ task, onTaskUpdated }: TaskCardProps) {
    const router = useRouter()
    const { user } = useAuth()
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

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

    const handleDelete = async () => {
        if (!user) return

        setIsDeleting(true)
        try {
            const accessToken = user.access_token
            await deleteTask(task.task_id, accessToken)
            if (onTaskUpdated) {
                onTaskUpdated()
            }
        } catch (error) {
            console.error("Error deleting task:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!user) return

        setIsUpdating(true)
        try {
            const accessToken = user.access_token
            // Use the general updateTask function since there's no specific status update endpoint
            await updateTask(
                task.task_id,
                {
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    due_date: task.due_date,
                    status: newStatus,
                },
                accessToken,
            )
            if (onTaskUpdated) {
                onTaskUpdated()
            }
        } catch (error) {
            console.error("Error updating task status:", error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleCardClick = (e: React.MouseEvent) => {
        // Only navigate if the click wasn't on a button or dropdown
        if (!(e.target as HTMLElement).closest("button") && !(e.target as HTMLElement).closest('[role="menu"]')) {
            router.push(`/tasks/${task.task_id}`)
        }
    }

    return (
        <Card className="h-full cursor-pointer hover:shadow-md transition-shadow relative">
            <div onClick={handleCardClick}>
                <CardHeader className="pb-2 pr-12">
                    {" "}
                    {/* Added right padding to avoid overlap */}
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pb-2">
                    <p className="text-muted-foreground line-clamp-2">{task.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>{formatDate(task.due_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {task.file_name && (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Paperclip className="h-3 w-3 mr-1" />
                                <span>1</span>
                            </div>
                        )}
                        <Badge className={getStatusColor(task.status)}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </Badge>
                    </div>
                </CardFooter>
            </div>

            {/* Action buttons - positioned absolutely to not interfere with card click */}
            <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/tasks/${task.task_id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </DropdownMenuItem>

                        {task.status !== "done" && (
                            <DropdownMenuItem onClick={() => handleStatusChange("done")}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Done
                            </DropdownMenuItem>
                        )}

                        {task.status !== "in progress" && (
                            <DropdownMenuItem onClick={() => handleStatusChange("in progress")}>
                                <Clock className="h-4 w-4 mr-2" />
                                Mark as In Progress
                            </DropdownMenuItem>
                        )}

                        {task.status !== "pending" && (
                            <DropdownMenuItem onClick={() => handleStatusChange("pending")}>
                                <Clock className="h-4 w-4 mr-2" />
                                Mark as Pending
                            </DropdownMenuItem>
                        )}

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the task and all its attachments.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Card>
    )
}
