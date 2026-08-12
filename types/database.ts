// Hand-written types matching supabase/migrations/0001_init.sql.
// If the schema changes, update this alongside the migration —
// (or generate it with `supabase gen types typescript`).
//
// Shape matches what `supabase gen types typescript` produces, including
// Relationships/Views/Functions/Enums/CompositeTypes — @supabase/supabase-js's
// internal GenericSchema constraints expect all of these to be present (even
// empty) or query-result type inference silently degrades to `never` in some
// call sites.

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
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'conversations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'saved_outputs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'usage_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
