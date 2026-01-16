"use client"

import { usePathname } from "next/navigation"
import { Header } from "./Header"

export function ConditionalHeader() {
  const pathname = usePathname()
  
  // Header nicht auf Arena-Seiten anzeigen
  if (pathname?.startsWith("/arena")) {
    return null
  }
  
  return <Header />
}
