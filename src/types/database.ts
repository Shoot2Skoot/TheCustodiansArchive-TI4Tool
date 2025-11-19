import type { GameStatus, GamePhase, PlayerColor, ObjectiveType, TechnologyType, EventType, SpeakerSource } from './enums';
import type { GameConfig } from './game';

// Database schema with snake_case (matches actual Supabase schema)
export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string;
          room_code: string;
          status: GameStatus;
          config: GameConfig;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          started_at: string | null;
          ended_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          room_code: string;
          status?: GameStatus;
          config: GameConfig;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          started_at?: string | null;
          ended_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          room_code?: string;
          status?: GameStatus;
          config?: GameConfig;
          updated_at?: string;
          started_at?: string | null;
          ended_at?: string | null;
          deleted_at?: string | null;
        };
      };
      players: {
        Row: {
          id: string;
          game_id: string;
          user_id: string | null;
          position: number;
          color: PlayerColor;
          faction_id: string;
          victory_points: number;
          display_name: string | null;
          created_at: string;
          updated_at: string;
          joined_at: string | null;
        };
        Insert: {
          id?: string;
          game_id: string;
          user_id?: string | null;
          position: number;
          color: PlayerColor;
          faction_id: string;
          victory_points?: number;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
          joined_at?: string | null;
        };
        Update: {
          user_id?: string | null;
          position?: number;
          color?: PlayerColor;
          faction_id?: string;
          victory_points?: number;
          display_name?: string | null;
          updated_at?: string;
          joined_at?: string | null;
        };
      };
      game_state: {
        Row: {
          game_id: string;
          current_round: number;
          current_phase: GamePhase;
          current_turn_player_id: string | null;
          speaker_player_id: string | null;
          mecatol_claimed: boolean;
          mecatol_claimed_round: number | null;
          last_activity_at: string;
          phase_started_at: string | null;
          updated_at: string;
        };
        Insert: {
          game_id: string;
          current_round?: number;
          current_phase?: GamePhase;
          current_turn_player_id?: string | null;
          speaker_player_id?: string | null;
          mecatol_claimed?: boolean;
          mecatol_claimed_round?: number | null;
          last_activity_at?: string;
          phase_started_at?: string | null;
          updated_at?: string;
        };
        Update: {
          current_round?: number;
          current_phase?: GamePhase;
          current_turn_player_id?: string | null;
          speaker_player_id?: string | null;
          mecatol_claimed?: boolean;
          mecatol_claimed_round?: number | null;
          last_activity_at?: string;
          phase_started_at?: string | null;
          updated_at?: string;
        };
      };
      strategy_selections: {
        Row: {
          id: string;
          game_id: string;
          round_number: number;
          player_id: string;
          strategy_card_id: number;
          selection_order: number;
          trade_good_bonus: number;
          primary_action_used: boolean;
          selected_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          round_number: number;
          player_id: string;
          strategy_card_id: number;
          selection_order: number;
          trade_good_bonus?: number;
          primary_action_used?: boolean;
          selected_at?: string;
        };
        Update: {
          trade_good_bonus?: number;
          primary_action_used?: boolean;
        };
      };
      player_action_state: {
        Row: {
          id: string;
          game_id: string;
          player_id: string;
          round_number: number;
          tactical_actions_count: number;
          strategy_card_used: boolean;
          has_passed: boolean;
          passed_at: string | null;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_id: string;
          round_number: number;
          tactical_actions_count?: number;
          strategy_card_used?: boolean;
          has_passed?: boolean;
          passed_at?: string | null;
        };
        Update: {
          tactical_actions_count?: number;
          strategy_card_used?: boolean;
          has_passed?: boolean;
          passed_at?: string | null;
        };
      };
      objectives: {
        Row: {
          id: string;
          game_id: string;
          objective_type: ObjectiveType;
          objective_id: string | null;
          objective_name: string;
          objective_description: string | null;
          revealed_round: number;
          scored_by_players: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          objective_type: ObjectiveType;
          objective_id?: string | null;
          objective_name: string;
          objective_description?: string | null;
          revealed_round: number;
          scored_by_players?: string[];
          created_at?: string;
        };
        Update: {
          objective_name?: string;
          objective_description?: string | null;
          scored_by_players?: string[];
        };
      };
      technology_unlocks: {
        Row: {
          id: string;
          game_id: string;
          player_id: string;
          technology_id: string;
          technology_type: TechnologyType;
          unlocked_round: number;
          is_exhausted: boolean;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_id: string;
          technology_id: string;
          technology_type: TechnologyType;
          unlocked_round: number;
          is_exhausted?: boolean;
          unlocked_at?: string;
        };
        Update: {
          is_exhausted?: boolean;
        };
      };
      game_events: {
        Row: {
          id: string;
          game_id: string;
          event_type: EventType;
          event_data: Record<string, any>;
          round_number: number | null;
          phase: GamePhase | null;
          player_id: string | null;
          occurred_at: string;
          is_undone: boolean;
          undone_at: string | null;
        };
        Insert: {
          id?: string;
          game_id: string;
          event_type: EventType;
          event_data?: Record<string, any>;
          round_number?: number | null;
          phase?: GamePhase | null;
          player_id?: string | null;
          occurred_at?: string;
          is_undone?: boolean;
          undone_at?: string | null;
        };
        Update: {
          is_undone?: boolean;
          undone_at?: string | null;
        };
      };
      speaker_history: {
        Row: {
          id: string;
          game_id: string;
          player_id: string;
          became_speaker_round: number;
          became_speaker_via: SpeakerSource;
          became_speaker_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_id: string;
          became_speaker_round: number;
          became_speaker_via: SpeakerSource;
          became_speaker_at?: string;
        };
        Update: Record<string, never>;
      };
      timer_tracking: {
        Row: {
          id: string;
          game_id: string;
          player_id: string;
          total_time_seconds: number;
          turn_started_at: string | null;
          is_current_turn: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_id: string;
          total_time_seconds?: number;
          turn_started_at?: string | null;
          is_current_turn?: boolean;
          updated_at?: string;
        };
        Update: {
          total_time_seconds?: number;
          turn_started_at?: string | null;
          is_current_turn?: boolean;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
