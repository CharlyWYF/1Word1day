import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-do-not-use-in-production"
);
const COOKIE_NAME = "auth_token";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        // Authenticated, render children
        return <>{children}</>;
      } catch {
        // Token invalid, redirect to login
      }
    }
  } catch (e) {
    console.error("Admin layout auth check failed:", e);
  }

  redirect("/login");
}
