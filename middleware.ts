import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    const authCookie = request.cookies.get("auth_session")
    const path = request.nextUrl.pathname

    // Public paths that don't require authentication
    const publicPaths = ["/", "/callback"]

    // Check if the path is public
    const isPublicPath = publicPaths.some((publicPath) => path === publicPath)

    // If the path is not public and there's no auth cookie, redirect to home
    if (!isPublicPath && !authCookie) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
