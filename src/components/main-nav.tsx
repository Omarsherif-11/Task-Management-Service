"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from 'react-oidc-context';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"

export function MainNav() {

    const { user } = useAuth()
    const router = useRouter()
    const auth = useAuth();

    const handleSignOut = () => {
        //auth.removeUser()
        auth.signoutRedirect().then(() => {
            router.push('/')
        }).catch((error) => {
            console.error(error)
            router.push('/')
        })
    }

    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const routes = [
        {
            href: "/dashboard",
            label: "Dashboard",
            active: pathname === "/dashboard",
        },
        {
            href: "/tasks",
            label: "Tasks",
            active: pathname === "/tasks",
        },
        {
            href: "/profile",
            label: "Profile",
            active: pathname === "/profile",
        },
    ]

    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4 container mx-auto">
                <Link href="/dashboard" className="font-bold text-xl text-primary mr-6">
                    Task Manager
                </Link>
                <div className="hidden md:flex items-center space-x-4 flex-1">
                    <nav className="flex items-center space-x-4">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    route.active ? "text-primary" : "text-muted-foreground",
                                )}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="hidden md:flex ml-auto">
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <User className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.profile.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSignOut()}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                <Button variant="ghost" className="md:hidden ml-auto" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>
            {isMenuOpen && (
                <div className="md:hidden p-4 pt-0 space-y-4 border-b">
                    <nav className="flex flex-col space-y-4">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    route.active ? "text-primary" : "text-muted-foreground",
                                )}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {route.label}
                            </Link>
                        ))}
                        <Button variant="outline" onClick={() => handleSignOut()} className="justify-start">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </Button>
                    </nav>
                </div>
            )}
        </div>
    )
}
