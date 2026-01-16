export default function NewsPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Authentication is handled by middleware
  return <>{children}</>
}
