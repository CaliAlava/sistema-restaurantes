export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'owner' | 'admin' | 'cashier' | 'kitchen' | 'waiter';
export type OrderChannel = 'pos' | 'web' | 'whatsapp' | 'delivery_app';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'dispatched' | 'cancelled';
export type FulfillmentType = 'dine_in' | 'takeaway' | 'delivery';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'transfer' | 'card';

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          custom_domain: string | null;
          logo_url: string | null;
          banner_url: string | null;
          currency: string;
          timezone: string;
          tax_rate: number;
          phone: string | null;
          email: string | null;
          settings: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          custom_domain?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          currency?: string;
          timezone?: string;
          tax_rate?: number;
          phone?: string | null;
          email?: string | null;
          settings?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          custom_domain?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          currency?: string;
          timezone?: string;
          tax_rate?: number;
          phone?: string | null;
          email?: string | null;
          settings?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenant_users: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          role: UserRole;
          display_name: string;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          role?: UserRole;
          display_name: string;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          role?: UserRole;
          display_name?: string;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          display_order: number;
          is_active: boolean;
          available_channels: OrderChannel[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          available_channels?: OrderChannel[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          available_channels?: OrderChannel[];
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          tenant_id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          sku: string | null;
          base_price: number;
          cost_price: number | null;
          tax_rate: number;
          image_url: string | null;
          is_available: boolean;
          track_inventory: boolean;
          stock_quantity: number;
          display_order: number;
          is_featured: boolean;
          available_channels: OrderChannel[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          sku?: string | null;
          base_price: number;
          cost_price?: number | null;
          tax_rate?: number;
          image_url?: string | null;
          is_available?: boolean;
          track_inventory?: boolean;
          stock_quantity?: number;
          display_order?: number;
          is_featured?: boolean;
          available_channels?: OrderChannel[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          sku?: string | null;
          base_price?: number;
          cost_price?: number | null;
          tax_rate?: number;
          image_url?: string | null;
          is_available?: boolean;
          track_inventory?: boolean;
          stock_quantity?: number;
          display_order?: number;
          is_featured?: boolean;
          available_channels?: OrderChannel[];
          created_at?: string;
          updated_at?: string;
        };
      };
      modifier_groups: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          min_selections: number;
          max_selections: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          min_selections?: number;
          max_selections?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          min_selections?: number;
          max_selections?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      modifier_options: {
        Row: {
          id: string;
          tenant_id: string;
          modifier_group_id: string;
          name: string;
          price_delta: number;
          is_default: boolean;
          is_available: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          modifier_group_id: string;
          name: string;
          price_delta?: number;
          is_default?: boolean;
          is_available?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          modifier_group_id?: string;
          name?: string;
          price_delta?: number;
          is_default?: boolean;
          is_available?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_modifier_groups: {
        Row: {
          id: string;
          tenant_id: string;
          product_id: string;
          modifier_group_id: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          product_id: string;
          modifier_group_id: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          product_id?: string;
          modifier_group_id?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      modifier_option_groups: {
        Row: {
          id: string;
          tenant_id: string;
          modifier_option_id: string;
          child_modifier_group_id: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          modifier_option_id: string;
          child_modifier_group_id: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          modifier_option_id?: string;
          child_modifier_group_id?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          tenant_id: string;
          daily_order_number: number;
          channel: OrderChannel;
          status: OrderStatus;
          fulfillment_type: FulfillmentType;
          table_number: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          delivery_address: string | null;
          delivery_reference: string | null;
          payment_method: PaymentMethod;
          payment_status: PaymentStatus;
          net_subtotal: number;
          tax_total: number;
          delivery_fee: number;
          tip_amount: number;
          grand_total: number;
          notes: string | null;
          estimated_minutes: number;
          prepared_at: string | null;
          ready_at: string | null;
          dispatched_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          daily_order_number: number;
          channel?: OrderChannel;
          status?: OrderStatus;
          fulfillment_type?: FulfillmentType;
          table_number?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          delivery_address?: string | null;
          delivery_reference?: string | null;
          payment_method?: PaymentMethod;
          payment_status?: PaymentStatus;
          net_subtotal: number;
          tax_total: number;
          delivery_fee?: number;
          tip_amount?: number;
          grand_total: number;
          notes?: string | null;
          estimated_minutes?: number;
          prepared_at?: string | null;
          ready_at?: string | null;
          dispatched_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          daily_order_number?: number;
          channel?: OrderChannel;
          status?: OrderStatus;
          fulfillment_type?: FulfillmentType;
          table_number?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          delivery_address?: string | null;
          delivery_reference?: string | null;
          payment_method?: PaymentMethod;
          payment_status?: PaymentStatus;
          net_subtotal?: number;
          tax_total?: number;
          delivery_fee?: number;
          tip_amount?: number;
          grand_total?: number;
          notes?: string | null;
          estimated_minutes?: number;
          prepared_at?: string | null;
          ready_at?: string | null;
          dispatched_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          tenant_id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          unit_price: number;
          tax_rate: number;
          quantity: number;
          subtotal: number;
          special_instructions: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          unit_price: number;
          tax_rate?: number;
          quantity: number;
          subtotal: number;
          special_instructions?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          unit_price?: number;
          tax_rate?: number;
          quantity?: number;
          subtotal?: number;
          special_instructions?: string | null;
          created_at?: string;
        };
      };
      order_item_modifiers: {
        Row: {
          id: string;
          tenant_id: string;
          order_item_id: string;
          parent_order_modifier_id: string | null;
          modifier_group_name: string;
          modifier_option_name: string;
          price_delta: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          order_item_id: string;
          parent_order_modifier_id?: string | null;
          modifier_group_name: string;
          modifier_option_name: string;
          price_delta?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          order_item_id?: string;
          parent_order_modifier_id?: string | null;
          modifier_group_name?: string;
          modifier_option_name?: string;
          price_delta?: number;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      is_tenant_member: {
        Args: { lookup_tenant_id: string };
        Returns: boolean;
      };
      has_tenant_role: {
        Args: { lookup_tenant_id: string; required_roles: UserRole[] };
        Returns: boolean;
      };
    };
  };
}
