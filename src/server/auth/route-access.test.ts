import { getProtectedRouteRedirect } from "./route-access";

describe("protected route access", () => {
  it("redirects unauthenticated app routes to login", () => {
    expect(getProtectedRouteRedirect({ pathname: "/app", isAuthenticated: false })).toBe(
      "/login",
    );
    expect(getProtectedRouteRedirect({ pathname: "/app/flashcards", isAuthenticated: false })).toBe(
      "/login",
    );
  });

  it("allows authenticated app routes and public routes", () => {
    expect(getProtectedRouteRedirect({ pathname: "/app", isAuthenticated: true })).toBeNull();
    expect(getProtectedRouteRedirect({ pathname: "/login", isAuthenticated: false })).toBeNull();
  });

  it("redirects authenticated users from the public home page to the app", () => {
    expect(getProtectedRouteRedirect({ pathname: "/", isAuthenticated: true })).toBe("/app");
    expect(getProtectedRouteRedirect({ pathname: "/", isAuthenticated: false })).toBeNull();
  });
});
