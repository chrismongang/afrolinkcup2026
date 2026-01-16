import { cookies } from "next/headers"

export async function isNewsPortalAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const access = cookieStore.get("news-portal-access")
  return access?.value === "granted"
}

export async function requireNewsPortalAuth() {
  const authenticated = await isNewsPortalAuthenticated()
  if (!authenticated) {
    throw new Error("Unauthorized")
  }
}
