"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/task-list"
import { TaskSummary } from "@/components/task-summary"
import { PlusCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { fetchTasks } from "@/lib/api"
import type { Task } from "@/types/task"
import { useAuth } from "react-oidc-context"

export function DashboardContent() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const { user } = useAuth()

    const loadTasks = useCallback(async () => {
        try {
            if (user) {
                setIsLoading(true)
                const accessToken = user.access_token
                const fetchedTasks = await fetchTasks(accessToken)
                setTasks(fetchedTasks)
            }
        } catch (error) {
            console.error("Error loading tasks:", error)
        } finally {
            setIsLoading(false)
        }
    }, [user])

    useEffect(() => {
        loadTasks()
    }, [loadTasks])

    const highPriorityTasks = tasks.filter((task) => task.priority === "high")
    const upcomingTasks = tasks
        .filter((task) => {
            const dueDate = new Date(task.due_date)
            const today = new Date()
            const threeDaysFromNow = new Date()
            threeDaysFromNow.setDate(today.getDate() + 3)
            return (
                (dueDate >= today && dueDate <= threeDaysFromNow) ||
                (dueDate.getDay() == today.getDay() &&
                    dueDate.getMonth() == today.getMonth() &&
                    dueDate.getFullYear() == today.getFullYear())
            )
        })
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <Link href="/tasks/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Task
                    </Button>
                </Link>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="high-priority">High Priority</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <TaskSummary title="Total Tasks" value={tasks.length} />
                        <TaskSummary title="High Priority" value={tasks.filter((task) => task.priority === "high").length} />
                        <TaskSummary title="done" value={tasks.filter((task) => task.status === "done").length} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Recent Tasks</CardTitle>
                                <CardDescription>Your recently added tasks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : tasks.length > 0 ? (
                                    <TaskList tasks={tasks.slice(0, 5)} onTasksChanged={loadTasks} />
                                ) : (
                                    <p className="text-center py-8 text-muted-foreground">No tasks found. Create your first task!</p>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Upcoming Deadlines</CardTitle>
                                <CardDescription>Tasks due in the next 3 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : upcomingTasks.length > 0 ? (
                                    <TaskList tasks={upcomingTasks} onTasksChanged={loadTasks} />
                                ) : (
                                    <p className="text-center py-8 text-muted-foreground">No upcoming deadlines in the next 3 days.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="high-priority" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>High Priority Tasks</CardTitle>
                            <CardDescription>Tasks that need immediate attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : highPriorityTasks.length > 0 ? (
                                <TaskList tasks={highPriorityTasks} onTasksChanged={loadTasks} />
                            ) : (
                                <p className="text-center py-8 text-muted-foreground">No high priority tasks found.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="upcoming" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Tasks</CardTitle>
                            <CardDescription>Tasks due in the next 3 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : upcomingTasks.length > 0 ? (
                                <TaskList tasks={upcomingTasks} onTasksChanged={loadTasks} />
                            ) : (
                                <p className="text-center py-8 text-muted-foreground">No upcoming tasks in the next 3 days.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
