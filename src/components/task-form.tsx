"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "react-oidc-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, X, Paperclip, FileIcon } from "lucide-react"
import { createTask, updateTask } from "@/lib/api"
import type { Task } from "@/types/task"

interface TaskFormProps {
    task?: Task
    isEditing?: boolean
}

export function TaskForm({ task, isEditing = false }: TaskFormProps) {
    const router = useRouter()
    const { user } = useAuth()
    const [title, setTitle] = useState(task?.title || "")
    const [description, setDescription] = useState(task?.description || "")
    const [priority, setPriority] = useState(task?.priority || "medium")
    const [dueDate, setDueDate] = useState(task?.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "")
    const [status, setStatus] = useState(task?.status || "pending")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [fileData, setFileData] = useState<{ name: string; content: string; type: string } | null>(null)
    const [hasExistingFile, setHasExistingFile] = useState(!!task?.file_name)
    const [keepExistingFile, setKeepExistingFile] = useState(!!task?.file_name)
    const [fileUploadError, setFileUploadError] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Convert selected file to base64
    useEffect(() => {
        const processFile = async () => {
            if (!file) {
                setFileData(null)
                return
            }

            try {
                const base64Content = await readFileAsBase64(file)
                setFileData({
                    name: file.name,
                    content: base64Content.split(",")[1], // Remove the data URL prefix
                    type: file.type,
                })
            } catch (error) {
                console.error("Error processing file:", error)
                setFileUploadError("Error processing file. Please try again.")
                setFile(null)
            }
        }

        processFile()
    }, [file])

    const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = () => reject(new Error("Failed to read file"))
            reader.readAsDataURL(file)
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        if (!user) {
            setError("You must be logged in to create a task")
            setIsLoading(false)
            return
        }

        const accessToken = user.access_token

        try {
            // Create the task data object
            const taskData: any = {
                title,
                description,
                priority,
                due_date: dueDate,
                status,
            }

            // Add file data if we have a new file
            if (fileData) {
                taskData.file = fileData
            } else if (isEditing && !keepExistingFile) {
                // If editing and we want to remove the existing file
                taskData.file = null
            }

            let savedTask: Task

            if (isEditing && task) {
                savedTask = await updateTask(task.task_id, taskData, accessToken)
            } else {
                savedTask = await createTask(taskData, accessToken)
            }

            // Ensure we have a valid task ID before redirecting
            if (savedTask && savedTask.task_id) {
                router.push(`/tasks/${savedTask.task_id}`)
            } else {
                throw new Error("Failed to get task ID from response")
            }
        } catch (err: any) {
            console.error("Error saving task:", err)
            setError(err.message || "Failed to save task")
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileUploadError("")
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]

            // Check file size (limit to 10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setFileUploadError("File exceeds the 10MB size limit")
                return
            }

            setFile(selectedFile)
            setKeepExistingFile(false) // We're replacing the existing file

            // Clear the input value so the same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const removeFile = () => {
        setFile(null)
        setFileData(null)
        if (isEditing && hasExistingFile) {
            setKeepExistingFile(false)
        }
    }

    const keepFile = () => {
        setKeepExistingFile(true)
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isEditing ? "Edit Task" : "Create New Task"}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={priority} onValueChange={(value) => setPriority(value as "low" | "medium" | "high")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="due-date">Due Date</Label>
                            <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                        </div>
                    </div>
                    {isEditing && (
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={(value) => setStatus(value as "pending" | "in progress" | "done")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in progress">In Progress</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>Attachment</Label>
                        <div className="border rounded-md p-4">
                            {/* Existing file */}
                            {isEditing && hasExistingFile && keepExistingFile && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium mb-2">Current Attachment</h4>
                                    <div className="flex items-center bg-muted rounded-md p-2">
                                        <FileIcon className="h-4 w-4 mr-2" />
                                        <span className="text-sm truncate max-w-[200px]">{task?.file_name}</span>
                                        <Button type="button" variant="ghost" size="sm" className="ml-2 h-6 w-6 p-0" onClick={removeFile}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* New file */}
                            {file && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium mb-2">New Attachment</h4>
                                    <div className="flex items-center bg-muted rounded-md p-2">
                                        <Paperclip className="h-4 w-4 mr-2" />
                                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                        <Button type="button" variant="ghost" size="sm" className="ml-2 h-6 w-6 p-0" onClick={removeFile}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* No file selected */}
                            {!file && (!isEditing || !hasExistingFile || !keepExistingFile) && (
                                <div className="mb-4">
                                    <p className="text-center text-muted-foreground mb-4">
                                        {isEditing && hasExistingFile
                                            ? "You've removed the current attachment. Upload a new one or cancel to keep the existing one."
                                            : "No attachment selected"}
                                    </p>
                                    {isEditing && hasExistingFile && !keepExistingFile && (
                                        <Button type="button" variant="outline" className="w-full mb-2" onClick={keepFile}>
                                            Keep existing attachment
                                        </Button>
                                    )}
                                </div>
                            )}

                            {fileUploadError && <p className="text-sm text-destructive mb-2">{fileUploadError}</p>}
                            <div className="flex items-center gap-2">
                                <Input ref={fileInputRef} type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload File
                                </Button>
                                <p className="text-sm text-muted-foreground">Max 10MB</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isLoading ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
