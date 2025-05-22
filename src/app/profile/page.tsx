"use client"

import { useAuth } from "react-oidc-context"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePage() {
    const auth = useAuth()
    const router = useRouter()

    if (auth.isLoading || !auth.isAuthenticated) {
        return null
    }

    const handleSignOut = () => {
        //auth.removeUser()
        auth.signoutPopup()
        router.push('/')
    }

    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <h2 className="text-3xl font-bold tracking-tight">Profile</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                            <CardDescription>Your account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <div className="p-2 border rounded-md bg-muted">{auth.user?.profile.email}</div>
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <div className="p-2 border rounded-md bg-muted">{auth.user?.profile.phone_number || "Not provided"}</div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="destructive" onClick={handleSignOut}>
                                Sign Out
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                            <CardDescription>Manage your account settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            {success && (
                                <Alert className="bg-green-50 text-green-800 border-green-200">
                                    <AlertDescription>{success}</AlertDescription>
                                </Alert>
                            )}
                            <p className="text-muted-foreground">
                                To change your password or update your profile information, please visit the AWS Cognito user portal.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={() =>
                                    window.open(
                                        `https://${process.env.NEXT_PUBLIC_DOMAIN}.auth.${process.env.NEXT_PUBLIC_AWS_REGION}.amazoncognito.com/forgotPassword?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}`,
                                        "_blank"
                                    )
                                }

                            >
                                Reset Password
                            </Button>
                        </CardFooter>
                    </Card> */}
                </div>
            </div>
        </div>
    )
}
