export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      game_events: {
        Row: {
          event_data: Json
          event_type: string
          game_id: string
          id: string
          is_undone: boolean
          occurred_at: string
          phase: string | null
          player_id: string | null
          round_number: number | null
          undone_at: string | null
        }
        Insert: {
          event_data?: Json
          event_type: string
          game_id: string
          id?: string
          is_undone?: boolean
          occurred_at?: string
          phase?: string | null
          player_id?: string | null
          round_number?: number | null
          undone_at?: string | null
        }
        Update: {
          event_data?: Json
          event_type?: string
          game_id?: string
          id?: string
          is_undone?: boolean
          occurred_at?: string
          phase?: string | null
          player_id?: string | null
          round_number?: number | null
          undone_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_events_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      game_state: {
        Row: {
          current_phase: string
          current_round: number
          current_turn_player_id: string | null
          game_id: string
          last_activity_at: string
          mecatol_claimed: boolean
          mecatol_claimed_round: number | null
          phase_started_at: string | null
          speaker_player_id: string | null
          updated_at: string
          is_paused: boolean
          paused_at: string | null
          paused_by_user_id: string | null
        }
        Insert: {
          current_phase?: string
          current_round?: number
          current_turn_player_id?: string | null
          game_id: string
          last_activity_at?: string
          mecatol_claimed?: boolean
          mecatol_claimed_round?: number | null
          phase_started_at?: string | null
          speaker_player_id?: string | null
          updated_at?: string
          is_paused?: boolean
          paused_at?: string | null
          paused_by_user_id?: string | null
        }
        Update: {
          current_phase?: string
          current_round?: number
          current_turn_player_id?: string | null
          game_id?: string
          last_activity_at?: string
          mecatol_claimed?: boolean
          mecatol_claimed_round?: number | null
          phase_started_at?: string | null
          speaker_player_id?: string | null
          updated_at?: string
          is_paused?: boolean
          paused_at?: string | null
          paused_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_state_current_turn_player_id_fkey"
            columns: ["current_turn_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_state_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: true
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_state_speaker_player_id_fkey"
            columns: ["speaker_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      game_users: {
        Row: {
          game_id: string
          id: string
          is_active: boolean
          joined_at: string
          user_id: string
        }
        Insert: {
          game_id: string
          id?: string
          is_active?: boolean
          joined_at?: string
          user_id: string
        }
        Update: {
          game_id?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_users_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          deleted_at: string | null
          ended_at: string | null
          id: string
          room_code: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          ended_at?: string | null
          id?: string
          room_code: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          ended_at?: string | null
          id?: string
          room_code?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      objectives: {
        Row: {
          created_at: string
          game_id: string
          id: string
          objective_description: string | null
          objective_id: string | null
          objective_name: string
          objective_type: string
          revealed_round: number
          scored_by_players: string[] | null
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          objective_description?: string | null
          objective_id?: string | null
          objective_name: string
          objective_type: string
          revealed_round: number
          scored_by_players?: string[] | null
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          objective_description?: string | null
          objective_id?: string | null
          objective_name?: string
          objective_type?: string
          revealed_round?: number
          scored_by_players?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "objectives_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      player_action_state: {
        Row: {
          game_id: string
          has_passed: boolean
          id: string
          passed_at: string | null
          player_id: string
          round_number: number
          strategy_card_used: boolean
          tactical_actions_count: number
        }
        Insert: {
          game_id: string
          has_passed?: boolean
          id?: string
          passed_at?: string | null
          player_id: string
          round_number: number
          strategy_card_used?: boolean
          tactical_actions_count?: number
        }
        Update: {
          game_id?: string
          has_passed?: boolean
          id?: string
          passed_at?: string | null
          player_id?: string
          round_number?: number
          strategy_card_used?: boolean
          tactical_actions_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_action_state_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_action_state_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_round_times: {
        Row: {
          created_at: string
          game_id: string
          id: string
          player_id: string
          round_number: number
          time_seconds: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          player_id: string
          round_number: number
          time_seconds?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          player_id?: string
          round_number?: number
          time_seconds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_round_times_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_round_times_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          color: string
          created_at: string
          display_name: string | null
          faction_id: string
          game_id: string
          id: string
          joined_at: string | null
          position: number
          updated_at: string
          user_id: string | null
          victory_points: number
        }
        Insert: {
          color: string
          created_at?: string
          display_name?: string | null
          faction_id: string
          game_id: string
          id?: string
          joined_at?: string | null
          position: number
          updated_at?: string
          user_id?: string | null
          victory_points?: number
        }
        Update: {
          color?: string
          created_at?: string
          display_name?: string | null
          faction_id?: string
          game_id?: string
          id?: string
          joined_at?: string | null
          position?: number
          updated_at?: string
          user_id?: string | null
          victory_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      speaker_history: {
        Row: {
          became_speaker_at: string
          became_speaker_round: number
          became_speaker_via: string
          game_id: string
          id: string
          player_id: string
        }
        Insert: {
          became_speaker_at?: string
          became_speaker_round: number
          became_speaker_via: string
          game_id: string
          id?: string
          player_id: string
        }
        Update: {
          became_speaker_at?: string
          became_speaker_round?: number
          became_speaker_via?: string
          game_id?: string
          id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "speaker_history_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "speaker_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_selections: {
        Row: {
          game_id: string
          id: string
          player_id: string
          primary_action_used: boolean
          round_number: number
          selected_at: string
          selection_order: number
          strategy_card_id: number
          trade_good_bonus: number
        }
        Insert: {
          game_id: string
          id?: string
          player_id: string
          primary_action_used?: boolean
          round_number: number
          selected_at?: string
          selection_order: number
          strategy_card_id: number
          trade_good_bonus?: number
        }
        Update: {
          game_id?: string
          id?: string
          player_id?: string
          primary_action_used?: boolean
          round_number?: number
          selected_at?: string
          selection_order?: number
          strategy_card_id?: number
          trade_good_bonus?: number
        }
        Relationships: [
          {
            foreignKeyName: "strategy_selections_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategy_selections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      technology_unlocks: {
        Row: {
          game_id: string
          id: string
          is_exhausted: boolean
          player_id: string
          technology_id: string
          technology_type: string
          unlocked_at: string
          unlocked_round: number
        }
        Insert: {
          game_id: string
          id?: string
          is_exhausted?: boolean
          player_id: string
          technology_id: string
          technology_type: string
          unlocked_at?: string
          unlocked_round: number
        }
        Update: {
          game_id?: string
          id?: string
          is_exhausted?: boolean
          player_id?: string
          technology_id?: string
          technology_type?: string
          unlocked_at?: string
          unlocked_round?: number
        }
        Relationships: [
          {
            foreignKeyName: "technology_unlocks_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technology_unlocks_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      timer_tracking: {
        Row: {
          game_id: string
          id: string
          is_current_turn: boolean
          player_id: string
          total_time_seconds: number
          turn_started_at: string | null
          updated_at: string
        }
        Insert: {
          game_id: string
          id?: string
          is_current_turn?: boolean
          player_id: string
          total_time_seconds?: number
          turn_started_at?: string | null
          updated_at?: string
        }
        Update: {
          game_id?: string
          id?: string
          is_current_turn?: boolean
          player_id?: string
          total_time_seconds?: number
          turn_started_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timer_tracking_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timer_tracking_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_room_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_game_creator: {
        Args: {
          game_uuid: string
        }
        Returns: boolean
      }
      is_user_in_game: {
        Args: {
          game_uuid: string
        }
        Returns: boolean
      }
      is_user_in_game_v2: {
        Args: {
          game_uuid: string
        }
        Returns: boolean
      }
      join_game_by_room_code: {
        Args: {
          room_code_input: string
        }
        Returns: string
      }
      user_created_game: {
        Args: {
          game_uuid: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
