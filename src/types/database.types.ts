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
      app_users: {
        Row: {
          id: string
          ragic_id: number
          ragic_member_id: string | null
          line_user_id: string
          locale: string | null
          avg_cycle_days: number | null
          avg_period_days: number | null
          luteal_phase_days: number | null
          next_period_date: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          ragic_id: number
          ragic_member_id?: string | null
          line_user_id: string
          locale?: string | null
          avg_cycle_days?: number | null
          avg_period_days?: number | null
          luteal_phase_days?: number | null
          next_period_date?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          ragic_id?: number
          ragic_member_id?: string | null
          line_user_id?: string
          locale?: string | null
          avg_cycle_days?: number | null
          avg_period_days?: number | null
          luteal_phase_days?: number | null
          next_period_date?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      period_logs: {
        Row: {
          id: string
          user_id: string | null
          start_date: string
          end_date: string | null
          flow_level: string | null
          symptoms: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          start_date: string
          end_date?: string | null
          flow_level?: string | null
          symptoms?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          start_date?: string
          end_date?: string | null
          flow_level?: string | null
          symptoms?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "period_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          id: string
          user_id: string | null
          target_date: string
          message_key: string
          message_params: Json | null
          status: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          target_date: string
          message_key: string
          message_params?: Json | null
          status?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          target_date?: string
          message_key?: string
          message_params?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
