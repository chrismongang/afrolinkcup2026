export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      arena_display: {
        Row: {
          id: string
          match_id: string | null
          mode: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          match_id?: string | null
          mode?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          match_id?: string | null
          mode?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arena_display_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_events: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          match_id: string
          minute: number
          player_id: string | null
          team_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          match_id: string
          minute: number
          player_id?: string | null
          team_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          match_id?: string
          minute?: number
          player_id?: string | null
          team_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          group: string | null
          id: string
          mvp_player_id: string | null
          mvp_voting_end: string | null
          mvp_voting_start: string | null
          score_away: number
          score_away_penalties: number | null
          score_home: number
          score_home_penalties: number | null
          stage: string
          start_time: string
          status: string
          team_away_id: string
          team_home_id: string
        }
        Insert: {
          created_at?: string | null
          group?: string | null
          id?: string
          mvp_player_id?: string | null
          mvp_voting_end?: string | null
          mvp_voting_start?: string | null
          score_away?: number
          score_away_penalties?: number | null
          score_home?: number
          score_home_penalties?: number | null
          stage: string
          start_time: string
          status?: string
          team_away_id: string
          team_home_id: string
        }
        Update: {
          created_at?: string | null
          group?: string | null
          id?: string
          mvp_player_id?: string | null
          mvp_voting_end?: string | null
          mvp_voting_start?: string | null
          score_away?: number
          score_away_penalties?: number | null
          score_home?: number
          score_home_penalties?: number | null
          stage?: string
          start_time?: string
          status?: string
          team_away_id?: string
          team_home_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_mvp_player_id_fkey"
            columns: ["mvp_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_away_id_fkey"
            columns: ["team_away_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_home_id_fkey"
            columns: ["team_home_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      mvp_votes: {
        Row: {
          anonymous_session_id: string | null
          created_at: string | null
          id: string
          match_id: string
          player_id: string
          user_profile_id: string | null
        }
        Insert: {
          anonymous_session_id?: string | null
          created_at?: string | null
          id?: string
          match_id: string
          player_id: string
          user_profile_id?: string | null
        }
        Update: {
          anonymous_session_id?: string | null
          created_at?: string | null
          id?: string
          match_id?: string
          player_id?: string
          user_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mvp_votes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mvp_votes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mvp_votes_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          age: number | null
          created_at: string | null
          id: string
          jersey_number: number | null
          name: string
          photo_url: string | null
          position: string | null
          role: string
          team_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          id?: string
          jersey_number?: number | null
          name: string
          photo_url?: string | null
          position?: string | null
          role?: string
          team_id: string
        }
        Update: {
          age?: number | null
          created_at?: string | null
          id?: string
          jersey_number?: number | null
          name?: string
          photo_url?: string | null
          position?: string | null
          role?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          colors: Json | null
          created_at: string | null
          flag_emoji: string
          group: string
          id: string
          mascot_key: string | null
          name: string
          short_name: string
          team_slug: string
        }
        Insert: {
          colors?: Json | null
          created_at?: string | null
          flag_emoji: string
          group: string
          id?: string
          mascot_key?: string | null
          name: string
          short_name: string
          team_slug: string
        }
        Update: {
          colors?: Json | null
          created_at?: string | null
          flag_emoji?: string
          group?: string
          id?: string
          mascot_key?: string | null
          name?: string
          short_name?: string
          team_slug?: string
        }
        Relationships: []
      }
      tips: {
        Row: {
          anonymous_session_id: string | null
          created_at: string | null
          id: string
          match_id: string
          points: number | null
          predicted_away_score: number | null
          predicted_home_score: number | null
          predicted_winner: string | null
          updated_at: string | null
          user_profile_id: string | null
        }
        Insert: {
          anonymous_session_id?: string | null
          created_at?: string | null
          id?: string
          match_id: string
          points?: number | null
          predicted_away_score?: number | null
          predicted_home_score?: number | null
          predicted_winner?: string | null
          updated_at?: string | null
          user_profile_id?: string | null
        }
        Update: {
          anonymous_session_id?: string | null
          created_at?: string | null
          id?: string
          match_id?: string
          points?: number | null
          predicted_away_score?: number | null
          predicted_home_score?: number | null
          predicted_winner?: string | null
          updated_at?: string | null
          user_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tips_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          anonymous_session_id: string | null
          avatar_key: string | null
          avatar_type: string
          avatar_url: string | null
          created_at: string | null
          favorite_team_id: string | null
          id: string
          total_points: number
          user_id: string
          username: string
        }
        Insert: {
          anonymous_session_id?: string | null
          avatar_key?: string | null
          avatar_type?: string
          avatar_url?: string | null
          created_at?: string | null
          favorite_team_id?: string | null
          id?: string
          total_points?: number
          user_id: string
          username: string
        }
        Update: {
          anonymous_session_id?: string | null
          avatar_key?: string | null
          avatar_type?: string
          avatar_url?: string | null
          created_at?: string | null
          favorite_team_id?: string | null
          id?: string
          total_points?: number
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_favorite_team_id_fkey"
            columns: ["favorite_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_tip_points: {
        Args: {
          actual_away: number
          actual_home: number
          predicted_away: number
          predicted_home: number
        }
        Returns: number
      }
      is_admin: { Args: { user_uuid?: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
