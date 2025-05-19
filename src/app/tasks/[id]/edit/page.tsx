"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { fetchTask, updateTask } from "@/lib/api"
import type { Task, TaskFormData } from "@/types/task"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "react-oidc-context"

export default function EditTaskPage({ params }: { params: { id: string } }) {
    const { isAuthenticated, user } = useAuth();
    const accessToken = isAuthenticated ? user?.access_token : "" as any;
    const [task, setTask] = useState<Task | null>(null)
    const [formData, setFormData] = useState<TaskFormData>({
        title: "",
        status: "pending",
        description: "",
        priority: "medium",
        due_date: new Date().toISOString().split("T")[0],
        email: user?.profile.email || "",
    })
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const loadTask = async () => {
            try {
                const fetchedTask = await fetchTask(params.id, accessToken)
                setTask(fetchedTask)
                setFormData({
                    title: fetchedTask.title,
                    status: fetchedTask.status,
                    description: fetchedTask.description,
                    priority: fetchedTask.priority,
                    due_date: new Date(fetchedTask.due_date).toISOString().split("T")[0],
                    email: user?.profile.email || "",
                })
            } catch (error) {
                console.error("Error loading task:", error)
                setError("Failed to load task details")
            } finally {
                setIsLoading(false)
            }
        }

        loadTask()
    }, [params.id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSaving(true)

        try {
            await updateTask(params.id, formData, accessToken)
            router.push(`/tasks/${params.id}`)
        } catch (err: any) {
            console.error("Error updating task:", err)
            setError(err.message || "Failed to update task")
        } finally {
            setIsSaving(false)
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

    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center">
                    <Link href={`/tasks/${params.id}`} className="mr-4">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Task</h2>
                </div>

                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Task Details</CardTitle>
                        <CardDescription>Update the details for your task</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="title">Task Title</Label>
                                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                                        <SelectTrigger id="priority">
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
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={formData.status} onValueChange={(value) => handleSelectChange("Status", value)}>
                                        <SelectTrigger id="Status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in progress">In progress</SelectItem>
                                            <SelectItem value="done">Done</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input
                                        id="dueDate"
                                        name="dueDate"
                                        type="date"
                                        value={formData.due_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Link href={`/tasks/${params.id}`}>
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
