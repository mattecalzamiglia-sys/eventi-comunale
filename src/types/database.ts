export type UserRole = 'admin' | 'comunale' | 'cittadino'

export type EventCategory =
  | 'sport'
  | 'cultura'
  | 'sociale'
  | 'musica'
  | 'arte'
  | 'educazione'
  | 'famiglia'
  | 'altro'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nome: string
          cognome: string
          role: UserRole
          is_active: boolean
          email_notifications: boolean
          app_notifications: boolean
          preferred_categories: EventCategory[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nome: string
          cognome: string
          role?: UserRole
          is_active?: boolean
          email_notifications?: boolean
          app_notifications?: boolean
          preferred_categories?: EventCategory[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nome?: string
          cognome?: string
          role?: UserRole
          is_active?: boolean
          email_notifications?: boolean
          app_notifications?: boolean
          preferred_categories?: EventCategory[]
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          titolo: string
          descrizione: string
          data_inizio: string
          ora_inizio: string
          data_fine: string | null
          ora_fine: string | null
          luogo: string
          categoria: EventCategory
          associazione: string
          creato_da: string
          immagine_url: string | null
          costo: number | null
          is_gratuito: boolean
          link_esterni: string | null
          contatti: string | null
          views_count: number
          is_draft: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titolo: string
          descrizione: string
          data_inizio: string
          ora_inizio: string
          data_fine?: string | null
          ora_fine?: string | null
          luogo: string
          categoria: EventCategory
          associazione: string
          creato_da: string
          immagine_url?: string | null
          costo?: number | null
          is_gratuito?: boolean
          link_esterni?: string | null
          contatti?: string | null
          views_count?: number
          is_draft?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titolo?: string
          descrizione?: string
          data_inizio?: string
          ora_inizio?: string
          data_fine?: string | null
          ora_fine?: string | null
          luogo?: string
          categoria?: EventCategory
          associazione?: string
          creato_da?: string
          immagine_url?: string | null
          costo?: number | null
          is_gratuito?: boolean
          link_esterni?: string | null
          contatti?: string | null
          views_count?: number
          is_draft?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          event_id: string
          user_id: string
          rating: number
          commento: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          rating: number
          commento?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          rating?: number
          commento?: string | null
          created_at?: string
        }
      }
      saved_events: {
        Row: {
          id: string
          user_id: string
          event_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          titolo: string
          messaggio: string
          tipo: 'nuovo_evento' | 'promemoria' | 'sistema'
          event_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          titolo: string
          messaggio: string
          tipo: 'nuovo_evento' | 'promemoria' | 'sistema'
          event_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          titolo?: string
          messaggio?: string
          tipo?: 'nuovo_evento' | 'promemoria' | 'sistema'
          event_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      event_category: EventCategory
    }
  }
}

// Helper types
export type User = Database['public']['Tables']['users']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type SavedEvent = Database['public']['Tables']['saved_events']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// Event with additional computed fields
export interface EventWithStats extends Event {
  avg_rating: number | null
  reviews_count: number
  saves_count: number
  creator?: Pick<User, 'nome' | 'cognome'>
}
