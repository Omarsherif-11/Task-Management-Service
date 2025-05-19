export interface Task {
    id: string
    userId: string
    userEmail: string
    title: string
    description: string
    priority: "low" | "medium" | "high"
    status: "pending" | "in progress" | "done"
    due_date: string
    createdAt: string
    updatedAt: string
    attachments?: Attachment[]
}

export interface Attachment {
    id: string
    taskId: string
    fileName: string
    fileUrl: string
    fileType: string
    uploadedAt: string
}

export interface TaskFormData {
    title: string
    status: string
    description: string
    priority: "low" | "medium" | "high"
    due_date: string
    email: string
}
