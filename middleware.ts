import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // First run the existing session update logic
  let response = await updateSession(request)

  // Get the pathname from the request
  const { pathname } = request.nextUrl

  // If it's a Next.js internal request, just return the response
  if (pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico')) {
    return response
  }

  // For admin routes, we need additional checks
  if (pathname.startsWith('/admin/')) {
    // The existing middleware already handles authentication
    // But we can add additional admin-specific logic here if needed
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
