import Link from "next/link"
import type { Task } from "@/types/task"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { CalendarIcon, AlertCircle, CheckCircle2 } from "lucide-react"

interface TaskListProps {
    tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
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

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "done":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case "in progress":
                return <AlertCircle className="h-4 w-4 text-amber-500" />
            default:
                return null
        }
    }

    return (
        <div className="space-y-2">
            {tasks.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors cursor-pointer">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(task.status)}
                                <span className="font-medium">{task.title}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                <span>{formatDate(task.due_date)}</span>
                            </div>
                        </div>
                        <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                    </div>
                </Link>
            ))}
        </div>
    )
}
