
import type { Task, TaskFormData, Attachment } from "@/types/task"
import { useAuth } from "react-oidc-context";

// API base URL - replace with your actual API Gateway URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;



// Fetch all tasks for the current user
export async function fetchTasks(accessToken: any): Promise<Task[]> {

    try {

        const response = await fetch(`${API_URL}/tasks`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            credentials: "include", // Include cookies in the request
        })

        if (!response.ok) {
            throw new Error(`Error fetching tasks: ${response.statusText}`)
        }

        const data = await response.json()

        return data || []
    } catch (error) {
        console.error("Error fetching tasks:", error)
        throw error
    }
}

// Fetch a single task by ID
export async function fetchTask(taskId: string, accessToken: any): Promise<Task> {

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            credentials: "include", // Include cookies in the request
        })

        if (!response.ok) {
            throw new Error(`Error fetching task: ${response.statusText}`)
        }

        const data = await response.json()
        return data.task
    } catch (error) {
        console.error(`Error fetching task ${taskId}:`, error)
        throw error
    }
}

// Create a new task
export async function createTask(taskData: TaskFormData, accessToken: any): Promise<Task> {

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            credentials: "include", // Include cookies in the request
            body: JSON.stringify(taskData),
        })

        if (!response.ok) {
            throw new Error(`Error creating task: ${response.statusText}`)
        }

        const data = await response.json()
        return data.task
    } catch (error) {
        console.error("Error creating task:", error)
        throw error
    }
}

// Update an existing task
export async function updateTask(taskId: string, taskData: Partial<TaskFormData>, accessToken: any): Promise<Task> {

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${accessToken}`
            },
            credentials: "include", // Include cookies in the request
            body: JSON.stringify(taskData),
        })

        if (!response.ok) {
            throw new Error(`Error updating task: ${response.statusText}`)
        }

        const data = await response.json()
        return data.task
    } catch (error) {
        console.error(`Error updating task ${taskId}:`, error)
        throw error
    }
}

// Update task status
export async function updateTaskStatus(taskId: string, status: string, accessToken: any): Promise<Task> {

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${accessToken}`
            },
            credentials: "include", // Include cookies in the request
            body: JSON.stringify({ status }),
        })

        if (!response.ok) {
            throw new Error(`Error updating task status: ${response.statusText}`)
        }

        const data = await response.json()
        return data.task
    } catch (error) {
        console.error(`Error updating task status ${taskId}:`, error)
        throw error
    }
}

// Delete a task
export async function deleteTask(taskId: string, accessToken: any): Promise<void> {

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        if (!response.ok) {
            throw new Error(`Error deleting task: ${response.statusText}`)
        }
    } catch (error) {
        console.error(`Error deleting task ${taskId}:`, error)
        throw error
    }
}

// Upload a file attachment to a task
export async function uploadAttachment(taskId: string, file: File, accessToken: any): Promise<Attachment> {

    try {
        // First, get a pre-signed URL for the S3 upload
        const urlResponse = await fetch(`${API_URL}/tasks/${taskId}/attachments/upload-url`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${accessToken}`
            },
            credentials: "include", // Include cookies in the request
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
            }),
        })

        if (!urlResponse.ok) {
            throw new Error(`Error getting upload URL: ${urlResponse.statusText}`)
        }

        const { uploadUrl, attachmentId } = await urlResponse.json()

        // Upload the file directly to S3 using the pre-signed URL
        const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type,
                'Authorization': `Bearer ${accessToken}`
            },
        })

        if (!uploadResponse.ok) {
            throw new Error(`Error uploading file: ${uploadResponse.statusText}`)
        }

        // Confirm the attachment in the database
        const confirmResponse = await fetch(`${API_URL}/tasks/${taskId}/attachments/${attachmentId}/confirm`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            credentials: "include", // Include cookies in the request
        })

        if (!confirmResponse.ok) {
            throw new Error(`Error confirming attachment: ${confirmResponse.statusText}`)
        }

        const data = await confirmResponse.json()
        return data.attachment
    } catch (error) {
        console.error(`Error uploading attachment for task ${taskId}:`, error)
        throw error
    }
}

// Delete an attachment
export async function deleteAttachment(taskId: string, attachmentId: string, accessToken: any): Promise<void> {

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}/attachments/${attachmentId}`, {
            method: "DELETE",
            credentials: "include", // Include cookies in the request
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        if (!response.ok) {
            throw new Error(`Error deleting attachment: ${response.statusText}`)
        }
    } catch (error) {
        console.error(`Error deleting attachment ${attachmentId}:`, error)
        throw error
    }
}
