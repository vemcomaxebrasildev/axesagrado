export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          diff: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Relationships: []
      }
      chatbot_menu: {
        Row: {
          action: string
          created_at: string
          id: string
          parent_id: string | null
          position: number
          response_text: string | null
          title: string
          trigger: string
          updated_at: string
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          position?: number
          response_text?: string | null
          title: string
          trigger: string
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          position?: number
          response_text?: string | null
          title?: string
          trigger?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_menu_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chatbot_menu"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          notes: string | null
          order_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      home_content: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          unit_price?: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          delivered_at: string | null
          id: string
          notes: string | null
          paid_amount: number
          paid_at: string | null
          payment_method: string | null
          payment_status: string
          shipped_at: string | null
          shipping_carrier: string | null
          shipping_cost: number
          status: string
          total: number
          tracking_code: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          delivered_at?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string
          shipped_at?: string | null
          shipping_carrier?: string | null
          shipping_cost?: number
          status?: string
          total?: number
          tracking_code?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          delivered_at?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string
          shipped_at?: string | null
          shipping_carrier?: string | null
          shipping_cost?: number
          status?: string
          total?: number
          tracking_code?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          path: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          created_at: string
          hero_image: string | null
          id: string
          published: boolean
          sections: Json
          seo_description: string | null
          seo_og_image: string | null
          seo_title: string | null
          slug: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hero_image?: string | null
          id?: string
          published?: boolean
          sections?: Json
          seo_description?: string | null
          seo_og_image?: string | null
          seo_title?: string | null
          slug: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hero_image?: string | null
          id?: string
          published?: boolean
          sections?: Json
          seo_description?: string | null
          seo_og_image?: string | null
          seo_title?: string | null
          slug?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          badge: string | null
          category: string
          created_at: string
          description: string | null
          dimensions: string | null
          entity: string | null
          featured: boolean
          featured_position: number
          id: string
          image: string | null
          images: string[]
          name: string
          old_price: number | null
          price: number
          shipping: string | null
          short_description: string | null
          slug: string
          stock: number
          updated_at: string
          video: string | null
          weight: string | null
        }
        Insert: {
          active?: boolean
          badge?: string | null
          category: string
          created_at?: string
          description?: string | null
          dimensions?: string | null
          entity?: string | null
          featured?: boolean
          featured_position?: number
          id?: string
          image?: string | null
          images?: string[]
          name: string
          old_price?: number | null
          price?: number
          shipping?: string | null
          short_description?: string | null
          slug: string
          stock?: number
          updated_at?: string
          video?: string | null
          weight?: string | null
        }
        Update: {
          active?: boolean
          badge?: string | null
          category?: string
          created_at?: string
          description?: string | null
          dimensions?: string | null
          entity?: string | null
          featured?: boolean
          featured_position?: number
          id?: string
          image?: string | null
          images?: string[]
          name?: string
          old_price?: number | null
          price?: number
          shipping?: string | null
          short_description?: string | null
          slug?: string
          stock?: number
          updated_at?: string
          video?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          level: string
          message: string
          source: string
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          level?: string
          message: string
          source?: string
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          level?: string
          message?: string
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          active: boolean
          author: string
          created_at: string
          id: string
          position: number
          quote: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          author: string
          created_at?: string
          id?: string
          position?: number
          quote: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          author?: string
          created_at?: string
          id?: string
          position?: number
          quote?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wa_agents: {
        Row: {
          active: boolean
          created_at: string
          display_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wa_conversations: {
        Row: {
          assigned_to: string | null
          bot_state: Json | null
          contact_name: string | null
          contact_phone: string
          created_at: string
          first_response_at: string | null
          id: string
          last_message_at: string
          queue: string | null
          resolved_at: string | null
          status: string
          unread_count: number
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          bot_state?: Json | null
          contact_name?: string | null
          contact_phone: string
          created_at?: string
          first_response_at?: string | null
          id?: string
          last_message_at?: string
          queue?: string | null
          resolved_at?: string | null
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          bot_state?: Json | null
          contact_name?: string | null
          contact_phone?: string
          created_at?: string
          first_response_at?: string | null
          id?: string
          last_message_at?: string
          queue?: string | null
          resolved_at?: string | null
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      wa_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          direction: string
          id: string
          kind: string
          sender_user_id: string | null
          wa_message_id: string | null
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          direction: string
          id?: string
          kind?: string
          sender_user_id?: string | null
          wa_message_id?: string | null
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          direction?: string
          id?: string
          kind?: string
          sender_user_id?: string | null
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wa_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "wa_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_wa_staff: { Args: { _uid: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "customer"
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
      app_role: ["admin", "customer"],
    },
  },
} as const
