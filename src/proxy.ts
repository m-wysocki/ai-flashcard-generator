import { auth } from "@/auth";
import { getProtectedRouteRedirect } from "@/server/auth/route-access";
import { NextResponse } from "next/server";

export default auth((request) => {
  const redirectPath = getProtectedRouteRedirect({
    pathname: request.nextUrl.pathname,
    isAuthenticated: Boolean(request.auth?.user),
  });

  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/app/:path*"],
};
