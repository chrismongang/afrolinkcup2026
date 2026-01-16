/**
 * Formatierungs-Utilities für Datum, Zeit und andere Anzeigen
 */

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "gerade eben"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `vor ${diffInMinutes} ${diffInMinutes === 1 ? "Minute" : "Minuten"}`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `vor ${diffInHours} ${diffInHours === 1 ? "Stunde" : "Stunden"}`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `vor ${diffInDays} ${diffInDays === 1 ? "Tag" : "Tagen"}`
  }

  return formatDate(d)
}

export function formatMatchScore(
  home: number,
  away: number,
  homePenalties?: number | null,
  awayPenalties?: number | null
): string {
  if (homePenalties !== null && homePenalties !== undefined && awayPenalties !== null && awayPenalties !== undefined) {
    return `${home}:${away} (${homePenalties}:${awayPenalties} i.E.)`
  }
  return `${home}:${away}`
}

/**
 * Berechnet die aktuelle Spielminute basierend auf actual_start_time (oder start_time) und Status
 * Startet bei Minute 1 und zählt kontinuierlich hoch (1, 2, 3, 4, ...)
 * @param startTime - Geplante Startzeit des Spiels (fallback)
 * @param status - Aktueller Status des Spiels
 * @param actualStartTime - Tatsächliche Startzeit (wenn im Admin gestartet wurde)
 * @returns Aktuelle Spielminute oder null wenn nicht live
 */
export function calculateLiveMinute(
  startTime: Date | string | null | undefined,
  status: string,
  actualStartTime?: Date | string | null | undefined
): number | null {
  const liveStatuses = ["LIVE", "LIVE_FIRST_HALF", "LIVE_SECOND_HALF", "EXTRA_TIME", "PENALTIES"]
  
  if (!liveStatuses.includes(status)) {
    return null
  }

  // Verwende actual_start_time wenn vorhanden, sonst start_time
  const start = actualStartTime 
    ? (typeof actualStartTime === "string" ? new Date(actualStartTime) : actualStartTime)
    : (startTime ? (typeof startTime === "string" ? new Date(startTime) : startTime) : null)

  if (!start) {
    return null
  }

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - start.getTime()) / 1000)
  
  if (diffInSeconds < 0) {
    return null // Spiel hat noch nicht begonnen
  }

  // Berechne vergangene Minuten seit Spielstart
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  
  // Starte bei Minute 1 und zähle kontinuierlich hoch
  return Math.max(1, diffInMinutes + 1)
}

