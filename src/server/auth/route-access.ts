export function getProtectedRouteRedirect(input: {
  pathname: string;
  isAuthenticated: boolean;
}) {
  const isAppRoute = input.pathname === "/app" || input.pathname.startsWith("/app/");

  if (isAppRoute && !input.isAuthenticated) {
    return "/login";
  }

  return null;
}
