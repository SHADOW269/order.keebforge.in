export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string | null
          created_at: string
          customer_id: string
          id: string
          is_default: boolean
          pincode: string | null
          state: string | null
          street_address: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_default?: boolean
          pincode?: string | null
          state?: string | null
          street_address?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_default?: boolean
          pincode?: string | null
          state?: string | null
          street_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_customer_notes: {
        Row: {
          created_at: string
          id: string
          order_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_customer_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_order_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_customer_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_orders_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_customer_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_internal_notes: {
        Row: {
          created_at: string
          id: string
          order_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_internal_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_order_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_internal_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_orders_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_internal_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_order_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_orders_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          discord_username: string | null
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discord_username?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discord_username?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_custom_work: {
        Row: {
          category: Database["public"]["Enums"]["custom_work_category"]
          created_at: string
          description: string | null
          id: string
          notes: string | null
          order_id: string
          price: number
          quantity: number
          sort_order: number
          title: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["custom_work_category"]
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          order_id: string
          price?: number
          quantity?: number
          sort_order?: number
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["custom_work_category"]
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          price?: number
          quantity?: number
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_custom_work_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_order_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_custom_work_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_orders_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_custom_work_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_products: {
        Row: {
          created_at: string
          id: string
          name: string
          order_id: string
          sort_order: number
          type: Database["public"]["Enums"]["product_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_id: string
          sort_order?: number
          type: Database["public"]["Enums"]["product_type"]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_id?: string
          sort_order?: number
          type?: Database["public"]["Enums"]["product_type"]
        }
        Relationships: [
          {
            foreignKeyName: "order_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_order_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_orders_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_services: {
        Row: {
          created_at: string
          id: string
          line_total: number | null
          order_id: string
          quantity: number
          service_id: string
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          line_total?: number | null
          order_id: string
          quantity?: number
          service_id: string
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number | null
          order_id?: string
          quantity?: number
          service_id?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_services_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_order_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_services_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_orders_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_services_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_timeline: {
        Row: {
          created_at: string
          id: string
          note: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_timeline_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_order_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_timeline_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_orders_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_timeline_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_tracking: {
        Row: {
          billing_summary: Json
          courier: string | null
          created_at: string
          customer_notes: Json
          estimated_delivery: string | null
          estimated_dispatch: string | null
          estimated_total: number | null
          order_id: string
          order_number: string
          payment_status: string | null
          products: Json
          selected_services: Json
          service_type: string | null
          shipping_status: string | null
          status: string | null
          timeline: Json
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          warranty_end: string | null
          warranty_start: string | null
          warranty_status: string | null
        }
        Insert: {
          billing_summary?: Json
          courier?: string | null
          created_at?: string
          customer_notes?: Json
          estimated_delivery?: string | null
          estimated_dispatch?: string | null
          estimated_total?: number | null
          order_id: string
          order_number: string
          payment_status?: string | null
          products?: Json
          selected_services?: Json
          service_type?: string | null
          shipping_status?: string | null
          status?: string | null
          timeline?: Json
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          warranty_end?: string | null
          warranty_start?: string | null
          warranty_status?: string | null
        }
        Update: {
          billing_summary?: Json
          courier?: string | null
          created_at?: string
          customer_notes?: Json
          estimated_delivery?: string | null
          estimated_dispatch?: string | null
          estimated_total?: number | null
          order_id?: string
          order_number?: string
          payment_status?: string | null
          products?: Json
          selected_services?: Json
          service_type?: string | null
          shipping_status?: string | null
          status?: string | null
          timeline?: Json
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          warranty_end?: string | null
          warranty_start?: string | null
          warranty_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "admin_order_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "admin_orders_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string | null
          billing_details: Json
          created_at: string
          current_status: string
          customer_id: string
          estimated_total: number | null
          id: string
          is_deleted: boolean
          order_number: string
          order_summary: string | null
          service_type: string | null
          updated_at: string
        }
        Insert: {
          address_id?: string | null
          billing_details?: Json
          created_at?: string
          current_status?: string
          customer_id: string
          estimated_total?: number | null
          id?: string
          is_deleted?: boolean
          order_number: string
          order_summary?: string | null
          service_type?: string | null
          updated_at?: string
        }
        Update: {
          address_id?: string | null
          billing_details?: Json
          created_at?: string
          current_status?: string
          customer_id?: string
          estimated_total?: number | null
          id?: string
          is_deleted?: boolean
          order_number?: string
          order_summary?: string | null
          service_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_paid: number
          created_at: string
          id: string
          order_id: string
          paid_at: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          id?: string
          order_id: string
          paid_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount_paid?: number
          created_at?: string
          id?: string
          order_id?: string
          paid_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_order_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "admin_orders_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipping_info: {
        Row: {
          courier: string | null
          created_at: string
          estimated_delivery_date: string | null
          estimated_dispatch_date: string | null
          id: string
          order_id: string
          packaging_cost: number
          shipping_cost: number
          shipping_status: Database["public"]["Enums"]["shipping_status"]
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
        }
        Insert: {
          courier?: string | null
          created_at?: string
          estimated_delivery_date?: string | null
          estimated_dispatch_date?: string | null
          id?: string
          order_id: string
          packaging_cost?: number
          shipping_cost?: number
          shipping_status?: Database["public"]["Enums"]["shipping_status"]
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Update: {
          courier?: string | null
          created_at?: string
          estimated_delivery_date?: string | null
          estimated_dispatch_date?: string | null
          id?: string
          order_id?: string
          packaging_cost?: number
          shipping_cost?: number
          shipping_status?: Database["public"]["Enums"]["shipping_status"]
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_info_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "admin_order_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_info_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "admin_orders_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_info_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      warranty_records: {
        Row: {
          created_at: string
          id: string
          order_id: string
          updated_at: string
          warranty_end: string | null
          warranty_start: string | null
          warranty_status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          updated_at?: string
          warranty_end?: string | null
          warranty_start?: string | null
          warranty_status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          updated_at?: string
          warranty_end?: string | null
          warranty_start?: string | null
          warranty_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warranty_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "admin_order_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "admin_orders_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_order_kpis: {
        Row: {
          amount_paid: number | null
          created_at: string | null
          current_status: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          discord_username: string | null
          estimated_total: number | null
          id: string | null
          order_number: string | null
          payment_status: string | null
          service_type: string | null
          shipping_status: string | null
          state: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      admin_orders_list: {
        Row: {
          city: string | null
          created_at: string | null
          current_status: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          discord_username: string | null
          estimated_total: number | null
          id: string | null
          order_number: string | null
          payment_status: string | null
          pincode: string | null
          service_type: string | null
          shipping_status: string | null
          state: string | null
          street_address: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_order_number: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      sync_order_tracking: { Args: { p_order_id: string }; Returns: undefined }
    }
    Enums: {
      custom_work_category: "keyboard" | "mouse"
      payment_status: "Payment Pending" | "Partially Paid" | "Paid"
      product_type:
        | "keyboard"
        | "switch"
        | "keycap"
        | "mouse"
        | "pcb"
        | "components"
      shipping_status:
        | "Not Dispatched"
        | "Dispatched"
        | "In Transit"
        | "Out for Delivery"
        | "Delivered"
        | "Returned"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      custom_work_category: ["keyboard", "mouse"],
      payment_status: ["Payment Pending", "Partially Paid", "Paid"],
      product_type: [
        "keyboard",
        "switch",
        "keycap",
        "mouse",
        "pcb",
        "components",
      ],
      shipping_status: [
        "Not Dispatched",
        "Dispatched",
        "In Transit",
        "Out for Delivery",
        "Delivered",
        "Returned",
      ],
    },
  },
} as const

