import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Prüfe ob Umgebungsvariablen vorhanden sind
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase Umgebungsvariablen fehlen')
    // Weiterleiten ohne Blockierung, damit die App nicht komplett blockiert
    return NextResponse.next()
  }

  // Session für alle Routen aktualisieren
  let response: NextResponse
  try {
    response = await updateSession(request)
  } catch (error) {
    // Wenn updateSession fehlschlägt, nicht blockieren
    console.error('Fehler beim Aktualisieren der Session:', error)
    response = NextResponse.next()
  }
  
  const pathname = request.nextUrl.pathname
  
  // News-Portal-Routen: Einfache Passwort-Prüfung
  if (pathname.startsWith('/news-portal') && 
      pathname !== '/news-portal/access' && 
      !pathname.startsWith('/news-portal/access') && 
      !pathname.startsWith('/api/news-portal')) {
    try {
      const access = request.cookies.get("news-portal-access")
      if (!access || access.value !== "granted") {
        const url = request.nextUrl.clone()
        url.pathname = '/news-portal/access'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Error checking news portal access:', error)
      // On error, redirect to access page
      const url = request.nextUrl.clone()
      url.pathname = '/news-portal/access'
      return NextResponse.redirect(url)
    }
  }

  // Admin-Routen: Einfache Passwort-Prüfung
  if (pathname.startsWith('/admin') && 
      pathname !== '/admin/access' && 
      !pathname.startsWith('/admin/access') && 
      !pathname.startsWith('/api/admin')) {
    try {
      const access = request.cookies.get("admin-access")
      if (!access || access.value !== "granted") {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/access'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Error checking admin access:', error)
      // On error, redirect to access page
      const url = request.nextUrl.clone()
      url.pathname = '/admin/access'
      return NextResponse.redirect(url)
    }
  }
  
  // Alle anderen Routen sind öffentlich zugänglich
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

