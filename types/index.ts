import { Database } from "./database.types"

// Helper types für erweiterte Queries
export type Team = Database["public"]["Tables"]["teams"]["Row"]
export type Player = Database["public"]["Tables"]["players"]["Row"]
export type Match = Database["public"]["Tables"]["matches"]["Row"] & {
  match_slug?: string | null
}
export type MatchEvent = Database["public"]["Tables"]["match_events"]["Row"]
export type Tip = Database["public"]["Tables"]["tips"]["Row"]
export type MVPVote = Database["public"]["Tables"]["mvp_votes"]["Row"]
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"]

// Erweiterte Typen mit Relations
export type MatchWithTeams = Match & {
  team_home: Team | null
  team_away: Team | null
}

export type MatchWithDetails = MatchWithTeams & {
  events?: MatchEvent[]
  mvp_player?: Player | null
}

export type PlayerWithTeam = Player & {
  team: Team
}

export type TipWithMatch = Tip & {
  match: MatchWithTeams
}

export type MatchEventWithPlayer = MatchEvent & {
  player?: Player | null
  team: Team
}

// Match Status Types
export type MatchStatus = Match["status"]
export type MatchStage = Match["stage"]

// Event Types
export type MatchEventType = MatchEvent["type"]
