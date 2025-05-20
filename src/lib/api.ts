import type { Task } from "@/types/task"

// API base URL - replace with your actual API Gateway URL
const API_URL = process.env.NEXT_PUBLIC_API_URL

// Fetch all tasks for the current user
export async function fetchTasks(accessToken: any): Promise<Task[]> {
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
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
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include", // Include cookies in the request
        })

        if (!response.ok) {
            throw new Error(`Error fetching task: ${response.statusText}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error(`Error fetching task ${taskId}:`, error)
        throw error
    }
}

// Create a new task
export async function createTask(taskData: any, accessToken: any): Promise<Task> {
    try {

        const response = await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            credentials: "include", // Include cookies in the request
            body: JSON.stringify(taskData),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("Server error response:", errorText)
            throw new Error(`Error creating task: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data || !data.task || !data.task.task_id) {
            console.error("Invalid response format - missing task_id:", data)
            throw new Error("Invalid response from server")
        }

        return data.task
    } catch (error) {
        console.error("Error creating task:", error)
        throw error
    }
}

// Update an existing task
export async function updateTask(taskId: string, taskData: any, accessToken: any): Promise<Task> {
    try {

        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include", // Include cookies in the request
            body: JSON.stringify(taskData),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("Server error response:", errorText)
            throw new Error(`Error updating task: ${response.statusText}`)
        }

        const data = await response.json()

        // For updates, we need to fetch the task again to get the updated data
        return await fetchTask(taskId, accessToken)
    } catch (error) {
        console.error(`Error updating task ${taskId}:`, error)
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
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("Server error response:", errorText)
            throw new Error(`Error deleting task: ${response.statusText}`)
        }
    } catch (error) {
        console.error(`Error deleting task ${taskId}:`, error)
        throw error
    }
}
