import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes that require authentication
  const protectedPaths = ["/bookings", "/profile"];

  const isProtectedPath = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );
  const isBookingPath = req.nextUrl.pathname.startsWith("/bookings/new");
  const isAuthPath = req.nextUrl.pathname.startsWith("/auth/");

  // Skip auth check for auth-related paths
  if (isAuthPath) {
    return res;
  }

  // Check auth status for protected routes
  if ((isProtectedPath || isBookingPath) && !session) {
    // Store the current URL to redirect back after login
    const redirectUrl = new URL("/auth/signin", req.url);
    redirectUrl.searchParams.set(
      "redirect",
      req.nextUrl.pathname + req.nextUrl.search
    );
    // return NextResponse.redirect(redirectUrl);
  }

  // If authenticated but missing profile, redirect to complete profile
  if (session && (isProtectedPath || isBookingPath)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", session.user.id)
      .single();

    if (!profile?.full_name) {
      const redirectUrl = new URL("/auth/complete-profile", req.url);
      redirectUrl.searchParams.set(
        "redirect",
        req.nextUrl.pathname + req.nextUrl.search
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

// Ensure the middleware is run for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
