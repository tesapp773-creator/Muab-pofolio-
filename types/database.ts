// Hand-written types matching supabase/migrations/0001_init.sql.
// If the schema changes, update this alongside the migration —
// (or generate it with `supabase gen types typescript`).

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          business_name: string | null;
          avatar_url: string | null;
          plan: 'free' | 'pro' | 'business';
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          kind: 'chat' | 'tool';
          tool_slug: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['conversations']['Row']> & { user_id: string };
        Update: Partial<Database['public']['Tables']['conversations']['Row']>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          model: string | null;
          provider: string | null;
          tokens_estimate: number | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['messages']['Row']> & {
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
      };
      saved_outputs: {
        Row: {
          id: string;
          user_id: string;
          tool_slug: string;
          title: string;
          content: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['saved_outputs']['Row']> & {
          user_id: string;
          tool_slug: string;
          title: string;
          content: string;
        };
        Update: Partial<Database['public']['Tables']['saved_outputs']['Row']>;
      };
      usage_logs: {
        Row: {
          id: string;
          user_id: string;
          kind: 'chat' | 'tool';
          provider: string | null;
          model: string | null;
          tokens_estimate: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['usage_logs']['Row']> & {
          user_id: string;
          kind: 'chat' | 'tool';
        };
        Update: Partial<Database['public']['Tables']['usage_logs']['Row']>;
      };
    };
  };
}
