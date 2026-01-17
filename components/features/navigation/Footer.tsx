"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <Link
              href="https://www.linkedin.com/in/chris-mongang/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline font-medium"
            >
              Chris M.
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
