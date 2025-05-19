import Link from "next/link"
import type { Task } from "@/types/task"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { CalendarIcon, Paperclip } from "lucide-react"

interface TaskCardProps {
    task: Task
}

export function TaskCard({ task }: TaskCardProps) {
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

    return (
        <Link href={`/tasks/${task.id}`}>
            <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
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
                        {task.attachments && task.attachments.length > 0 && (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Paperclip className="h-3 w-3 mr-1" />
                                <span>{task.attachments.length}</span>
                            </div>
                        )}
                        <Badge className={getStatusColor(task.status)}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </Badge>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}
