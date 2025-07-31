export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          channel_type: Database["public"]["Enums"]["chat_channel_type"]
          created_at: string | null
          dm_target_player_id_1: string | null
          dm_target_player_id_2: string | null
          game_id: string
          message_id: string
          message_text: string
          sender_player_id: string | null
          sender_player_name: string | null
        }
        Insert: {
          channel_type: Database["public"]["Enums"]["chat_channel_type"]
          created_at?: string | null
          dm_target_player_id_1?: string | null
          dm_target_player_id_2?: string | null
          game_id: string
          message_id?: string
          message_text: string
          sender_player_id?: string | null
          sender_player_name?: string | null
        }
        Update: {
          channel_type?: Database["public"]["Enums"]["chat_channel_type"]
          created_at?: string | null
          dm_target_player_id_1?: string | null
          dm_target_player_id_2?: string | null
          game_id?: string
          message_id?: string
          message_text?: string
          sender_player_id?: string | null
          sender_player_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_dm_target_player_id_1_fkey"
            columns: ["dm_target_player_id_1"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "chat_messages_dm_target_player_id_2_fkey"
            columns: ["dm_target_player_id_2"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "chat_messages_sender_player_id_fkey"
            columns: ["sender_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      game_events: {
        Row: {
          actor_player_id: string | null
          created_at: string | null
          day_number: number | null
          details: Json | null
          event_id: string
          event_phase: Database["public"]["Enums"]["game_phase"] | null
          event_type: string
          game_code: string
          role_involved_name: string | null
          target_player_id: string | null
        }
        Insert: {
          actor_player_id?: string | null
          created_at?: string | null
          day_number?: number | null
          details?: Json | null
          event_id?: string
          event_phase?: Database["public"]["Enums"]["game_phase"] | null
          event_type: string
          game_code: string
          role_involved_name?: string | null
          target_player_id?: string | null
        }
        Update: {
          actor_player_id?: string | null
          created_at?: string | null
          day_number?: number | null
          details?: Json | null
          event_id?: string
          event_phase?: Database["public"]["Enums"]["game_phase"] | null
          event_type?: string
          game_code?: string
          role_involved_name?: string | null
          target_player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_events_actor_player_id_fkey"
            columns: ["actor_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "game_events_game_code_fkey"
            columns: ["game_code"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["game_code"]
          },
          {
            foreignKeyName: "game_events_role_involved_name_fkey"
            columns: ["role_involved_name"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_name"]
          },
          {
            foreignKeyName: "game_events_target_player_id_fkey"
            columns: ["target_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      game_votes: {
        Row: {
          created_at: string | null
          day_number: number
          election_target_role_name:
            | Database["public"]["Enums"]["election_role_name"]
            | null
          game_code: string
          is_chairman_double_vote: boolean | null
          vote_id: string
          voted_player_id: string
          voter_player_id: string
          voting_phase: Database["public"]["Enums"]["game_phase"]
        }
        Insert: {
          created_at?: string | null
          day_number: number
          election_target_role_name?:
            | Database["public"]["Enums"]["election_role_name"]
            | null
          game_code: string
          is_chairman_double_vote?: boolean | null
          vote_id?: string
          voted_player_id: string
          voter_player_id: string
          voting_phase: Database["public"]["Enums"]["game_phase"]
        }
        Update: {
          created_at?: string | null
          day_number?: number
          election_target_role_name?:
            | Database["public"]["Enums"]["election_role_name"]
            | null
          game_code?: string
          is_chairman_double_vote?: boolean | null
          vote_id?: string
          voted_player_id?: string
          voter_player_id?: string
          voting_phase?: Database["public"]["Enums"]["game_phase"]
        }
        Relationships: [
          {
            foreignKeyName: "game_votes_game_code_fkey"
            columns: ["game_code"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["game_code"]
          },
          {
            foreignKeyName: "game_votes_voted_player_id_fkey"
            columns: ["voted_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "game_votes_voter_player_id_fkey"
            columns: ["voter_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string | null
          current_day: number
          current_phase: Database["public"]["Enums"]["game_phase"]
          current_player_count: number
          game_code: string
          group_points_pool: number
          host_player_id: string | null
          houses_of_worship_vice: number
          houses_of_worship_virtue: number
          include_outreach_phase: boolean
          last_phase_change_at: string | null
          max_players: number
          max_points_per_day_m: number
          secretary_player_id: string | null
          treasurer_player_id: string | null
          tutorial: boolean
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_day?: number
          current_phase?: Database["public"]["Enums"]["game_phase"]
          current_player_count?: number
          game_code: string
          group_points_pool?: number
          host_player_id?: string | null
          houses_of_worship_vice?: number
          houses_of_worship_virtue?: number
          include_outreach_phase?: boolean
          last_phase_change_at?: string | null
          max_players?: number
          max_points_per_day_m?: number
          secretary_player_id?: string | null
          treasurer_player_id?: string | null
          tutorial?: boolean
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_day?: number
          current_phase?: Database["public"]["Enums"]["game_phase"]
          current_player_count?: number
          game_code?: string
          group_points_pool?: number
          host_player_id?: string | null
          houses_of_worship_vice?: number
          houses_of_worship_virtue?: number
          include_outreach_phase?: boolean
          last_phase_change_at?: string | null
          max_players?: number
          max_points_per_day_m?: number
          secretary_player_id?: string | null
          treasurer_player_id?: string | null
          tutorial?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_games_treasurer_player"
            columns: ["treasurer_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "games_host_player_id_fkey1"
            columns: ["host_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "games_secretary_player_id_fkey"
            columns: ["secretary_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      player_actions: {
        Row: {
          acting_player_id: string
          acting_role_name: string
          action_details: Json | null
          action_id: string
          action_successful: boolean | null
          action_type: Database["public"]["Enums"]["ability_effect_type"]
          created_at: string | null
          day_number: number
          game_code: string
          points_spent: number
          secondary_target_id: string | null
          target_player_id: string | null
          target_tier: Database["public"]["Enums"]["role_tier"] | null
        }
        Insert: {
          acting_player_id: string
          acting_role_name: string
          action_details?: Json | null
          action_id?: string
          action_successful?: boolean | null
          action_type: Database["public"]["Enums"]["ability_effect_type"]
          created_at?: string | null
          day_number: number
          game_code: string
          points_spent: number
          secondary_target_id?: string | null
          target_player_id?: string | null
          target_tier?: Database["public"]["Enums"]["role_tier"] | null
        }
        Update: {
          acting_player_id?: string
          acting_role_name?: string
          action_details?: Json | null
          action_id?: string
          action_successful?: boolean | null
          action_type?: Database["public"]["Enums"]["ability_effect_type"]
          created_at?: string | null
          day_number?: number
          game_code?: string
          points_spent?: number
          secondary_target_id?: string | null
          target_player_id?: string | null
          target_tier?: Database["public"]["Enums"]["role_tier"] | null
        }
        Relationships: [
          {
            foreignKeyName: "player_actions_acting_player_id_fkey"
            columns: ["acting_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_actions_acting_role_name_fkey"
            columns: ["acting_role_name"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_name"]
          },
          {
            foreignKeyName: "player_actions_game_code_fkey"
            columns: ["game_code"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["game_code"]
          },
          {
            foreignKeyName: "player_actions_secondary_target_id_fkey"
            columns: ["secondary_target_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_actions_target_player_id_fkey"
            columns: ["target_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      player_active_effects: {
        Row: {
          active_effect_id: string
          created_at: string | null
          day_applied: number
          duration_days: number
          effect_type: Database["public"]["Enums"]["ability_effect_type"]
          effect_value: string | null
          expires_at_day: number
          game_code: string
          source_player_id: string | null
          source_role_name: string | null
          target_player_id: string
        }
        Insert: {
          active_effect_id?: string
          created_at?: string | null
          day_applied: number
          duration_days?: number
          effect_type: Database["public"]["Enums"]["ability_effect_type"]
          effect_value?: string | null
          expires_at_day: number
          game_code: string
          source_player_id?: string | null
          source_role_name?: string | null
          target_player_id: string
        }
        Update: {
          active_effect_id?: string
          created_at?: string | null
          day_applied?: number
          duration_days?: number
          effect_type?: Database["public"]["Enums"]["ability_effect_type"]
          effect_value?: string | null
          expires_at_day?: number
          game_code?: string
          source_player_id?: string | null
          source_role_name?: string | null
          target_player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_active_effects_game_code_fkey"
            columns: ["game_code"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["game_code"]
          },
          {
            foreignKeyName: "player_active_effects_source_player_id_fkey"
            columns: ["source_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_active_effects_source_role_name_fkey"
            columns: ["source_role_name"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_name"]
          },
          {
            foreignKeyName: "player_active_effects_target_player_id_fkey"
            columns: ["target_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      player_protections: {
        Row: {
          created_at: string | null
          day_number: number
          expires_at_day: number
          game_code: string
          protected_player_id: string
          protection_id: string
          protection_type: string
          protector_player_id: string
        }
        Insert: {
          created_at?: string | null
          day_number: number
          expires_at_day: number
          game_code: string
          protected_player_id: string
          protection_id?: string
          protection_type?: string
          protector_player_id: string
        }
        Update: {
          created_at?: string | null
          day_number?: number
          expires_at_day?: number
          game_code?: string
          protected_player_id?: string
          protection_id?: string
          protection_type?: string
          protector_player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_protections_game_code_fkey"
            columns: ["game_code"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["game_code"]
          },
          {
            foreignKeyName: "player_protections_protected_player_id_fkey"
            columns: ["protected_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_protections_protector_player_id_fkey"
            columns: ["protector_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      players: {
        Row: {
          acted_today: boolean | null
          conversion_history: Json | null
          current_role_name: string | null
          current_y_value: number | null
          effective_identity_player_id: string | null
          game_code: string | null
          joined_at: string | null
          last_mini_game_rank: number | null
          original_role_name: string | null
          personal_points: number
          player_id: string
          player_name: string
          role_inherited_from: string | null
          status: Database["public"]["Enums"]["player_status"]
          user_id: string
        }
        Insert: {
          acted_today?: boolean | null
          conversion_history?: Json | null
          current_role_name?: string | null
          current_y_value?: number | null
          effective_identity_player_id?: string | null
          game_code?: string | null
          joined_at?: string | null
          last_mini_game_rank?: number | null
          original_role_name?: string | null
          personal_points?: number
          player_id?: string
          player_name: string
          role_inherited_from?: string | null
          status?: Database["public"]["Enums"]["player_status"]
          user_id: string
        }
        Update: {
          acted_today?: boolean | null
          conversion_history?: Json | null
          current_role_name?: string | null
          current_y_value?: number | null
          effective_identity_player_id?: string | null
          game_code?: string | null
          joined_at?: string | null
          last_mini_game_rank?: number | null
          original_role_name?: string | null
          personal_points?: number
          player_id?: string
          player_name?: string
          role_inherited_from?: string | null
          status?: Database["public"]["Enums"]["player_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_current_role_name_fkey"
            columns: ["current_role_name"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_name"]
          },
          {
            foreignKeyName: "players_effective_identity_player_id_fkey"
            columns: ["effective_identity_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "players_game_code_fkey"
            columns: ["game_code"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["game_code"]
          },
          {
            foreignKeyName: "players_original_role_name_fkey"
            columns: ["original_role_name"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_name"]
          },
          {
            foreignKeyName: "players_role_inherited_from_fkey"
            columns: ["role_inherited_from"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      reflection_phase_guesses: {
        Row: {
          created_at: string | null
          day_number: number
          game_code: string
          guess_id: string
          guessed_player_id: string
          guessed_role_name: string
          guessing_player_id: string
          is_correct: boolean | null
        }
        Insert: {
          created_at?: string | null
          day_number: number
          game_code: string
          guess_id?: string
          guessed_player_id: string
          guessed_role_name: string
          guessing_player_id: string
          is_correct?: boolean | null
        }
        Update: {
          created_at?: string | null
          day_number?: number
          game_code?: string
          guess_id?: string
          guessed_player_id?: string
          guessed_role_name?: string
          guessing_player_id?: string
          is_correct?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reflection_phase_guesses_game_code_fkey"
            columns: ["game_code"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["game_code"]
          },
          {
            foreignKeyName: "reflection_phase_guesses_guessed_player_id_fkey"
            columns: ["guessed_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "reflection_phase_guesses_guessed_role_name_fkey"
            columns: ["guessed_role_name"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_name"]
          },
          {
            foreignKeyName: "reflection_phase_guesses_guessing_player_id_fkey"
            columns: ["guessing_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      role_conversions: {
        Row: {
          conversion_id: string
          converter_player_id: string
          converter_role_id: string
          created_at: string | null
          day_number: number
          game_code: string
          new_faction: Database["public"]["Enums"]["role_faction"]
          new_role_name: string
          original_faction: Database["public"]["Enums"]["role_faction"]
          original_role_name: string
          points_spent: number
          target_player_id: string
        }
        Insert: {
          conversion_id?: string
          converter_player_id: string
          converter_role_id: string
          created_at?: string | null
          day_number: number
          game_code: string
          new_faction: Database["public"]["Enums"]["role_faction"]
          new_role_name: string
          original_faction: Database["public"]["Enums"]["role_faction"]
          original_role_name: string
          points_spent: number
          target_player_id: string
        }
        Update: {
          conversion_id?: string
          converter_player_id?: string
          converter_role_id?: string
          created_at?: string | null
          day_number?: number
          game_code?: string
          new_faction?: Database["public"]["Enums"]["role_faction"]
          new_role_name?: string
          original_faction?: Database["public"]["Enums"]["role_faction"]
          original_role_name?: string
          points_spent?: number
          target_player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_conversions_converter_player_id_fkey"
            columns: ["converter_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "role_conversions_game_code_fkey"
            columns: ["game_code"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["game_code"]
          },
          {
            foreignKeyName: "role_conversions_new_role_name_fkey"
            columns: ["new_role_name"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_name"]
          },
          {
            foreignKeyName: "role_conversions_original_role_name_fkey"
            columns: ["original_role_name"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_name"]
          },
          {
            foreignKeyName: "role_conversions_target_player_id_fkey"
            columns: ["target_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      role_inheritance_choices: {
        Row: {
          choice_made_at: string | null
          created_at: string | null
          day_number: number
          deceased_player_id: string
          deceased_role_name: string
          game_code: string
          inheritance_id: string
          inheritor_player_id: string
          original_inheritor_role_name: string
        }
        Insert: {
          choice_made_at?: string | null
          created_at?: string | null
          day_number: number
          deceased_player_id: string
          deceased_role_name: string
          game_code: string
          inheritance_id?: string
          inheritor_player_id: string
          original_inheritor_role_name: string
        }
        Update: {
          choice_made_at?: string | null
          created_at?: string | null
          day_number?: number
          deceased_player_id?: string
          deceased_role_name?: string
          game_code?: string
          inheritance_id?: string
          inheritor_player_id?: string
          original_inheritor_role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_inheritance_choices_deceased_player_id_fkey"
            columns: ["deceased_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "role_inheritance_choices_deceased_role_name_fkey"
            columns: ["deceased_role_name"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_name"]
          },
          {
            foreignKeyName: "role_inheritance_choices_game_code_fkey"
            columns: ["game_code"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["game_code"]
          },
          {
            foreignKeyName: "role_inheritance_choices_inheritor_player_id_fkey"
            columns: ["inheritor_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "role_inheritance_choices_original_inheritor_role_name_fkey"
            columns: ["original_inheritor_role_name"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_name"]
          },
        ]
      }
      roles: {
        Row: {
          ability_cost_formula: string | null
          ability_description: string | null
          ability_effect_type:
            | Database["public"]["Enums"]["ability_effect_type"]
            | null
          ability_name: string | null
          ability_target_type:
            | Database["public"]["Enums"]["ability_target_type"]
            | null
          can_be_assigned_randomly: boolean
          description: string | null
          faction: Database["public"]["Enums"]["role_faction"]
          max_uses_per_day: number | null
          max_uses_per_game: number | null
          role_name: string
          tier: Database["public"]["Enums"]["role_tier"]
          unique: boolean
        }
        Insert: {
          ability_cost_formula?: string | null
          ability_description?: string | null
          ability_effect_type?:
            | Database["public"]["Enums"]["ability_effect_type"]
            | null
          ability_name?: string | null
          ability_target_type?:
            | Database["public"]["Enums"]["ability_target_type"]
            | null
          can_be_assigned_randomly?: boolean
          description?: string | null
          faction: Database["public"]["Enums"]["role_faction"]
          max_uses_per_day?: number | null
          max_uses_per_game?: number | null
          role_name: string
          tier: Database["public"]["Enums"]["role_tier"]
          unique?: boolean
        }
        Update: {
          ability_cost_formula?: string | null
          ability_description?: string | null
          ability_effect_type?:
            | Database["public"]["Enums"]["ability_effect_type"]
            | null
          ability_name?: string | null
          ability_target_type?:
            | Database["public"]["Enums"]["ability_target_type"]
            | null
          can_be_assigned_randomly?: boolean
          description?: string | null
          faction?: Database["public"]["Enums"]["role_faction"]
          max_uses_per_day?: number | null
          max_uses_per_game?: number | null
          role_name?: string
          tier?: Database["public"]["Enums"]["role_tier"]
          unique?: boolean
        }
        Relationships: []
      }
      secretary_vote_announcements: {
        Row: {
          actual_votes: Json
          announced_votes: Json
          announcement_id: string
          created_at: string | null
          day_number: number
          game_code: string
          is_truthful: boolean
          secretary_player_id: string
          voting_phase: Database["public"]["Enums"]["game_phase"]
        }
        Insert: {
          actual_votes: Json
          announced_votes: Json
          announcement_id?: string
          created_at?: string | null
          day_number: number
          game_code: string
          is_truthful: boolean
          secretary_player_id: string
          voting_phase: Database["public"]["Enums"]["game_phase"]
        }
        Update: {
          actual_votes?: Json
          announced_votes?: Json
          announcement_id?: string
          created_at?: string | null
          day_number?: number
          game_code?: string
          is_truthful?: boolean
          secretary_player_id?: string
          voting_phase?: Database["public"]["Enums"]["game_phase"]
        }
        Relationships: [
          {
            foreignKeyName: "secretary_vote_announcements_game_code_fkey"
            columns: ["game_code"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["game_code"]
          },
          {
            foreignKeyName: "secretary_vote_announcements_secretary_player_id_fkey"
            columns: ["secretary_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      treasury_transactions: {
        Row: {
          action_type: Database["public"]["Enums"]["treasury_action_type"]
          created_at: string | null
          day_number: number
          details: string | null
          game_code: string
          points_spent: number
          target_player_id: string | null
          transaction_id: string
          treasurer_player_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["treasury_action_type"]
          created_at?: string | null
          day_number: number
          details?: string | null
          game_code: string
          points_spent: number
          target_player_id?: string | null
          transaction_id?: string
          treasurer_player_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["treasury_action_type"]
          created_at?: string | null
          day_number?: number
          details?: string | null
          game_code?: string
          points_spent?: number
          target_player_id?: string | null
          transaction_id?: string
          treasurer_player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treasury_transactions_game_code_fkey"
            columns: ["game_code"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["game_code"]
          },
          {
            foreignKeyName: "treasury_transactions_target_player_id_fkey"
            columns: ["target_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "treasury_transactions_treasurer_player_id_fkey"
            columns: ["treasurer_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      vengeance_guesses: {
        Row: {
          created_at: string | null
          day_number: number
          game_code: string
          guessed_voter_id: string
          imprisoned_player_id: string
          is_correct: boolean
          vengeance_id: string
          vengeance_player_id: string
        }
        Insert: {
          created_at?: string | null
          day_number: number
          game_code: string
          guessed_voter_id: string
          imprisoned_player_id: string
          is_correct: boolean
          vengeance_id?: string
          vengeance_player_id: string
        }
        Update: {
          created_at?: string | null
          day_number?: number
          game_code?: string
          guessed_voter_id?: string
          imprisoned_player_id?: string
          is_correct?: boolean
          vengeance_id?: string
          vengeance_player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vengeance_guesses_game_code_fkey"
            columns: ["game_code"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["game_code"]
          },
          {
            foreignKeyName: "vengeance_guesses_guessed_voter_id_fkey"
            columns: ["guessed_voter_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "vengeance_guesses_imprisoned_player_id_fkey"
            columns: ["imprisoned_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "vengeance_guesses_vengeance_player_id_fkey"
            columns: ["vengeance_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ability_effect_type:
        | "Kill"
        | "Hospitalize"
        | "Protect"
        | "SwapIdentity"
        | "MiniGameDisrupt"
        | "SacrificeWithTarget"
        | "InheritRoleOnDeath"
        | "RevealVotesOnTarget"
        | "RevealTierPlayers"
        | "RevealAllVotesOnImprisoned"
        | "DoubleVote"
        | "ManageGroupPoints"
        | "BuildHouseOfWorship"
        | "ResuscitatePlayer"
        | "FreePlayerFromPrison"
        | "RevealFactionCount"
        | "ConvertViceToVirtue"
        | "ConvertVirtueToVice"
        | "ChooseRoleInheritance"
        | "GuessVoterForHospitalization"
      ability_target_type:
        | "Self"
        | "SinglePlayerAlive"
        | "SinglePlayerAnyStatus"
        | "TierSelect"
        | "None"
        | "PreviousDayPrisonVoters"
        | "LastImprisonedPlayerVoters"
      chat_channel_type:
        | "General"
        | "Faction_Vice"
        | "Faction_Virtue"
        | "DeadChat"
        | "PrisonChat"
        | "OfficialChat"
        | "DirectMessage"
      election_role_name: "chairperson" | "secretary" | "treasurer" | "prison"
      game_phase:
        | "Lobby"
        | "Reflection_RoleActions"
        | "Reflection_MiniGame"
        | "Outreach"
        | "Consultation_Discussion"
        | "Consultation_Voting_Prison"
        | "Consultation_TreasurerActions"
        | "Consultation_Elections_Chairperson"
        | "Paused"
        | "Finished"
        | "Tutorial"
        | "RoleReveal"
        | "Reflection_MiniGame_Result"
        | "Consultation_Elections_Secretary"
        | "Consultation_Elections_Result"
      player_status:
        | "Alive"
        | "Dead"
        | "Hospitalized"
        | "Imprisoned"
        | "Disconnected"
      role_faction: "Vice" | "Virtue" | "Official" | "Neutral"
      role_tier: "S" | "A" | "B" | "C" | "D" | "OfficialTier"
      treasury_action_type:
        | "BuildHouseOfWorship"
        | "ResuscitatePlayer"
        | "FreePlayerFromPrison"
        | "RevealFactionCount"
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
    Enums: {
      ability_effect_type: [
        "Kill",
        "Hospitalize",
        "Protect",
        "SwapIdentity",
        "MiniGameDisrupt",
        "SacrificeWithTarget",
        "InheritRoleOnDeath",
        "RevealVotesOnTarget",
        "RevealTierPlayers",
        "RevealAllVotesOnImprisoned",
        "DoubleVote",
        "ManageGroupPoints",
        "BuildHouseOfWorship",
        "ResuscitatePlayer",
        "FreePlayerFromPrison",
        "RevealFactionCount",
        "ConvertViceToVirtue",
        "ConvertVirtueToVice",
        "ChooseRoleInheritance",
        "GuessVoterForHospitalization",
      ],
      ability_target_type: [
        "Self",
        "SinglePlayerAlive",
        "SinglePlayerAnyStatus",
        "TierSelect",
        "None",
        "PreviousDayPrisonVoters",
        "LastImprisonedPlayerVoters",
      ],
      chat_channel_type: [
        "General",
        "Faction_Vice",
        "Faction_Virtue",
        "DeadChat",
        "PrisonChat",
        "OfficialChat",
        "DirectMessage",
      ],
      election_role_name: ["chairperson", "secretary", "treasurer", "prison"],
      game_phase: [
        "Lobby",
        "Reflection_RoleActions",
        "Reflection_MiniGame",
        "Outreach",
        "Consultation_Discussion",
        "Consultation_Voting_Prison",
        "Consultation_TreasurerActions",
        "Consultation_Elections_Chairperson",
        "Paused",
        "Finished",
        "Tutorial",
        "RoleReveal",
        "Reflection_MiniGame_Result",
        "Consultation_Elections_Secretary",
        "Consultation_Elections_Result",
      ],
      player_status: [
        "Alive",
        "Dead",
        "Hospitalized",
        "Imprisoned",
        "Disconnected",
      ],
      role_faction: ["Vice", "Virtue", "Official", "Neutral"],
      role_tier: ["S", "A", "B", "C", "D", "OfficialTier"],
      treasury_action_type: [
        "BuildHouseOfWorship",
        "ResuscitatePlayer",
        "FreePlayerFromPrison",
        "RevealFactionCount",
      ],
    },
  },
} as const
