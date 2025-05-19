"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "react-oidc-context";
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function LandingPage() {
    const auth = useAuth();

    const signOutRedirect = () => {
        const clientId = process.env.COGNITO_CLIENT_ID;
        const logoutUri = "localhost:3000/";
        const cognitoDomain = process.env.DOMAIN;
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

    return (
        <div className="flex min-h-screen flex-col">
            <header className="bg-white border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-primary">Task Manager</h1>
                    <div className="space-x-4">
                        <Button variant="outline" onClick={() => auth.signinRedirect()}>Log In</Button>
                        <Button>Sign Up</Button>
                    </div>
                </div>
            </header>
            <main className="flex-1">
                <section className="py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-4xl font-bold mb-6">Manage Your Tasks Efficiently</h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            A powerful task management system built on AWS that helps you organize, prioritize, and track your tasks
                            with ease.
                        </p>
                        <Link href="/signup">
                            <Button size="lg" className="px-8">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </section>
                <section className="py-16 bg-muted">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-card p-6 rounded-lg shadow-sm">
                                <h3 className="text-xl font-semibold mb-3">Task Management</h3>
                                <p className="text-muted-foreground">
                                    Create, update, and organize your tasks with customizable priorities and due dates.
                                </p>
                            </div>
                            <div className="bg-card p-6 rounded-lg shadow-sm">
                                <h3 className="text-xl font-semibold mb-3">File Attachments</h3>
                                <p className="text-muted-foreground">
                                    Attach important files to your tasks for easy reference and collaboration.
                                </p>
                            </div>
                            <div className="bg-card p-6 rounded-lg shadow-sm">
                                <h3 className="text-xl font-semibold mb-3">Notifications</h3>
                                <p className="text-muted-foreground">
                                    Stay updated with notifications for task updates and approaching deadlines.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="bg-secondary py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-muted-foreground">© 2025 Task Management System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
