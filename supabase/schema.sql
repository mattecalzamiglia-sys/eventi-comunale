-- ================================================
-- SCHEMA DATABASE - APP EVENTI COMUNALI
-- ================================================

-- Abilita estensione UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ENUM TYPES
-- ================================================

CREATE TYPE user_role AS ENUM ('admin', 'comunale', 'cittadino');

CREATE TYPE event_category AS ENUM (
  'sport',
  'cultura',
  'sociale',
  'musica',
  'arte',
  'educazione',
  'famiglia',
  'altro'
);

CREATE TYPE notification_type AS ENUM ('nuovo_evento', 'promemoria', 'sistema');

-- ================================================
-- TABELLA USERS
-- ================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'cittadino',
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  app_notifications BOOLEAN NOT NULL DEFAULT true,
  preferred_categories event_category[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indici per users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- ================================================
-- TABELLA EVENTS
-- ================================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titolo TEXT NOT NULL,
  descrizione TEXT NOT NULL,
  data_inizio DATE NOT NULL,
  ora_inizio TIME NOT NULL,
  data_fine DATE,
  ora_fine TIME,
  luogo TEXT NOT NULL,
  categoria event_category NOT NULL,
  associazione TEXT NOT NULL,
  creato_da UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  immagine_url TEXT,
  costo DECIMAL(10,2),
  is_gratuito BOOLEAN NOT NULL DEFAULT true,
  link_esterni TEXT,
  contatti TEXT,
  views_count INTEGER NOT NULL DEFAULT 0,
  is_draft BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indici per events
CREATE INDEX idx_events_data_inizio ON events(data_inizio);
CREATE INDEX idx_events_categoria ON events(categoria);
CREATE INDEX idx_events_creato_da ON events(creato_da);
CREATE INDEX idx_events_luogo ON events(luogo);
CREATE INDEX idx_events_is_draft ON events(is_draft);

-- ================================================
-- TABELLA REVIEWS
-- ================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  commento TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id) -- Un utente può lasciare una sola recensione per evento
);

-- Indici per reviews
CREATE INDEX idx_reviews_event_id ON reviews(event_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- ================================================
-- TABELLA SAVED_EVENTS (Preferiti)
-- ================================================

CREATE TABLE saved_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id) -- Un utente può salvare un evento una sola volta
);

-- Indici per saved_events
CREATE INDEX idx_saved_events_user_id ON saved_events(user_id);
CREATE INDEX idx_saved_events_event_id ON saved_events(event_id);

-- ================================================
-- TABELLA NOTIFICATIONS
-- ================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titolo TEXT NOT NULL,
  messaggio TEXT NOT NULL,
  tipo notification_type NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indici per notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ================================================
-- VIEWS
-- ================================================

-- View per eventi con statistiche
CREATE OR REPLACE VIEW events_with_stats AS
SELECT
  e.*,
  COALESCE(AVG(r.rating), 0) as avg_rating,
  COUNT(DISTINCT r.id) as reviews_count,
  COUNT(DISTINCT s.id) as saves_count,
  u.nome as creator_nome,
  u.cognome as creator_cognome
FROM events e
LEFT JOIN reviews r ON e.id = r.event_id
LEFT JOIN saved_events s ON e.id = s.event_id
LEFT JOIN users u ON e.creato_da = u.id
WHERE e.is_draft = false
GROUP BY e.id, u.nome, u.cognome;

-- ================================================
-- FUNCTIONS
-- ================================================

-- Funzione per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funzione per incrementare views_count
CREATE OR REPLACE FUNCTION increment_event_views(event_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE events SET views_count = views_count + 1 WHERE id = event_uuid;
END;
$$ LANGUAGE plpgsql;

-- Funzione per creare notifica nuovo evento
CREATE OR REPLACE FUNCTION notify_new_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserisci notifiche per gli utenti che hanno abilitato le notifiche per questa categoria
  INSERT INTO notifications (user_id, titolo, messaggio, tipo, event_id)
  SELECT
    u.id,
    'Nuovo evento: ' || NEW.titolo,
    'Un nuovo evento nella categoria ' || NEW.categoria || ' è stato pubblicato!',
    'nuovo_evento',
    NEW.id
  FROM users u
  WHERE u.role = 'cittadino'
    AND u.app_notifications = true
    AND (NEW.categoria = ANY(u.preferred_categories) OR array_length(u.preferred_categories, 1) IS NULL);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- TRIGGERS
-- ================================================

-- Trigger per aggiornare updated_at su users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger per aggiornare updated_at su events
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger per notificare nuovo evento (solo se non è bozza)
CREATE TRIGGER trigger_notify_new_event
  AFTER INSERT ON events
  FOR EACH ROW
  WHEN (NEW.is_draft = false)
  EXECUTE FUNCTION notify_new_event();

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Abilita RLS su tutte le tabelle
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ================================================
-- POLICIES - USERS
-- ================================================

-- Tutti possono vedere i profili base
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- Gli utenti possono modificare solo il proprio profilo
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Solo gli admin possono inserire nuovi utenti comunali
CREATE POLICY "Admins can insert comunale users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
    OR role = 'cittadino'
  );

-- Solo gli admin possono eliminare utenti
CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ================================================
-- POLICIES - EVENTS
-- ================================================

-- Tutti possono vedere eventi pubblicati
CREATE POLICY "Published events are viewable by everyone" ON events
  FOR SELECT USING (is_draft = false OR creato_da = auth.uid());

-- Comunale e Admin possono creare eventi
CREATE POLICY "Comunale and Admin can create events" ON events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('comunale', 'admin')
    )
  );

-- Comunale può modificare solo i propri eventi, Admin può modificare tutti
CREATE POLICY "Users can update own events or admin all" ON events
  FOR UPDATE USING (
    creato_da = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Comunale può eliminare solo i propri eventi, Admin può eliminare tutti
CREATE POLICY "Users can delete own events or admin all" ON events
  FOR DELETE USING (
    creato_da = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ================================================
-- POLICIES - REVIEWS
-- ================================================

-- Tutti possono vedere le recensioni
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

-- Cittadini possono creare recensioni
CREATE POLICY "Citizens can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Utenti possono modificare/eliminare solo le proprie recensioni
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- POLICIES - SAVED_EVENTS
-- ================================================

-- Utenti possono vedere solo i propri preferiti
CREATE POLICY "Users can view own saved events" ON saved_events
  FOR SELECT USING (auth.uid() = user_id);

-- Utenti possono salvare eventi
CREATE POLICY "Users can save events" ON saved_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Utenti possono rimuovere i propri preferiti
CREATE POLICY "Users can remove own saved events" ON saved_events
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- POLICIES - NOTIFICATIONS
-- ================================================

-- Utenti possono vedere solo le proprie notifiche
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Sistema può creare notifiche (tramite trigger/functions)
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Utenti possono aggiornare (marcare come lette) le proprie notifiche
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Utenti possono eliminare le proprie notifiche
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- STORAGE BUCKET PER IMMAGINI
-- ================================================

-- Nota: Eseguire questi comandi nella dashboard Supabase Storage
-- oppure tramite l'API

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('event-images', 'event-images', true);

-- CREATE POLICY "Anyone can view event images"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'event-images');

-- CREATE POLICY "Authenticated users can upload event images"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'event-images'
--   AND auth.role() = 'authenticated'
-- );

-- CREATE POLICY "Users can update own event images"
-- ON storage.objects FOR UPDATE
-- USING (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own event images"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ================================================
-- INSERIMENTO ADMIN PREDEFINITI
-- ================================================

-- Nota: Gli admin vanno creati tramite Supabase Auth prima,
-- poi inseriti qui con i loro UUID.
--
-- Esempio (da eseguire dopo aver creato gli utenti in Auth):
--
-- INSERT INTO users (id, email, nome, cognome, role)
-- VALUES
--   ('uuid-admin-1', 'matteo@admin.com', 'Matteo', 'Calzamiglia', 'admin'),
--   ('uuid-admin-2', 'polpo@admin.com', 'Polpo', '', 'admin');
