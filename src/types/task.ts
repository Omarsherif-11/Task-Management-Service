export interface Task {
    task_id: string
    userId: string
    title: string
    description: string
    priority: "low" | "medium" | "high"
    status: "pending" | "in progress" | "done"
    due_date: string
    created_at: string
    updated_at: string
    file_name?: string
    file_url?: string
    signed_file_url?: string
}

export interface TaskFormData {
    title: string
    description: string
    priority: "low" | "medium" | "high"
    due_date: string
    status?: "pending" | "in progress" | "done"
    file?: {
        name: string
        content: string
        type: string
    } | null
}
