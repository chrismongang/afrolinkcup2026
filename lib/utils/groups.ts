import type { Team, Match } from "@/types"

export type GroupTableEntry = {
  team: Team
  position: number
  played: number // Sp
  points: number // P
  wins: number // S
  draws: number // U
  losses: number // N
  goalsFor: number // T
  goalsAgainst: number // GT
  goalDifference: number // TD
}

type MatchWithTeams = Match & {
  team_home: Team
  team_away: Team
}

/**
 * Berechnet die Gruppen-Tabelle basierend auf den Teams und Matches einer Gruppe
 */
export function calculateGroupTable(
  teams: Team[],
  matches: MatchWithTeams[]
): GroupTableEntry[] {
  // Initialisiere Tabelle für jedes Team
  const table: Map<string, GroupTableEntry> = new Map()

  teams.forEach((team) => {
    table.set(team.id, {
      team,
      position: 0,
      played: 0,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    })
  })

  // Verarbeite nur beendete Spiele
  const finishedMatches = matches.filter((match) => match.status === "FINISHED")

  finishedMatches.forEach((match) => {
    const homeEntry = table.get(match.team_home.id)
    const awayEntry = table.get(match.team_away.id)

    if (!homeEntry || !awayEntry) return

    const homeScore = match.score_home
    const awayScore = match.score_away

    // Spiele aktualisieren
    homeEntry.played++
    awayEntry.played++

    // Tore aktualisieren
    homeEntry.goalsFor += homeScore
    homeEntry.goalsAgainst += awayScore
    awayEntry.goalsFor += awayScore
    awayEntry.goalsAgainst += homeScore

    // Tordifferenz aktualisieren
    homeEntry.goalDifference = homeEntry.goalsFor - homeEntry.goalsAgainst
    awayEntry.goalDifference = awayEntry.goalsFor - awayEntry.goalsAgainst

    // Punkte und Ergebnisse aktualisieren
    if (homeScore > awayScore) {
      // Heim-Sieg
      homeEntry.points += 3
      homeEntry.wins++
      awayEntry.losses++
    } else if (homeScore < awayScore) {
      // Auswärts-Sieg
      awayEntry.points += 3
      awayEntry.wins++
      homeEntry.losses++
    } else {
      // Unentschieden
      homeEntry.points += 1
      awayEntry.points += 1
      homeEntry.draws++
      awayEntry.draws++
    }
  })

  // Sortiere nach: Punkte (absteigend), Tordifferenz (absteigend), Tore (absteigend)
  const sortedTable = Array.from(table.values()).sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points
    }
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference
    }
    return b.goalsFor - a.goalsFor
  })

  // Setze Positionen
  sortedTable.forEach((entry, index) => {
    entry.position = index + 1
  })

  return sortedTable
}
