"use client"

import { useState } from "react"
import type { Task } from "@/types/task"
import { TaskCard } from "@/components/task-card"

interface TaskListProps {
    tasks: Task[]
    onTasksChanged?: () => void
}

export function TaskList({ tasks, onTasksChanged }: TaskListProps) {
    const [localTasks, setLocalTasks] = useState<Task[]>(tasks)

    // This function will be called when a task is updated or deleted
    const handleTaskUpdated = () => {
        if (onTasksChanged) {
            onTasksChanged()
        }
    }

    return (
        <div className="space-y-4">
            {localTasks.map((task) => (
                <TaskCard key={task.task_id} task={task} onTaskUpdated={handleTaskUpdated} />
            ))}
        </div>
    )
}
