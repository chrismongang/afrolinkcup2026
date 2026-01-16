import { cookies } from "next/headers"

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const access = cookieStore.get("admin-access")
  return access?.value === "granted"
}

export async function requireAdminAuth() {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    throw new Error("Unauthorized")
  }
}
