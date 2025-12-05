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

type PublicSchema = Database['public']

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
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
    : never = never
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
    : never = never
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
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never
