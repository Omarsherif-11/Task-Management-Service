"use client"

import { useEffect, useState } from "react"
import { useAuth } from 'react-oidc-context'
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { fetchTasks } from "@/lib/api"
import type { Task } from "@/types/task"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskCard } from "@/components/task-card"

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [priorityFilter, setPriorityFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    const { user } = useAuth();

    useEffect(() => {
        const loadTasks = async () => {
            try {
                if (user) {
                    const accessToken = user.access_token;
                    if (accessToken) {
                        const fetchedTasks = await fetchTasks(accessToken)
                        setTasks(fetchedTasks)
                        setFilteredTasks(fetchedTasks)
                    }
                }
            } catch (error) {
                console.error("Error loading tasks:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadTasks()
    }, [user])

    useEffect(() => {
        let result = tasks

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (task) => task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query),
            )
        }

        // Apply priority filter
        if (priorityFilter !== "all") {
            result = result.filter((task) => task.priority === priorityFilter)
        }

        // Apply status filter
        if (statusFilter !== "all") {
            result = result.filter((task) => task.status === statusFilter)
        }

        setFilteredTasks(result)
    }, [searchQuery, priorityFilter, statusFilter, tasks])

    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
                    <Link href="/tasks/new">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Task
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredTasks.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTasks.map((task) => (
                            <TaskCard key={task.task_id} task={task} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-lg text-muted-foreground mb-4">No tasks found</p>
                        <Link href="/tasks/new">
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create your first task
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
