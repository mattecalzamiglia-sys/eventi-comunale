# App Eventi Comunali

Web app per la gestione e pubblicazione di eventi organizzati dal comune e dalle associazioni comunali.

## Funzionalità

### Cittadino
- Visualizzazione eventi (lista e calendario)
- Filtri per categoria, data, luogo, associazione
- Salvataggio eventi nei preferiti
- Valutazione eventi (stelle + commenti)
- Notifiche per nuovi eventi e promemoria

### Utente Comunale
- Dashboard personale
- Creazione e modifica eventi
- Statistiche dei propri eventi
- Gestione bozze

### Admin
- Gestione account comunali (crea, attiva/disattiva, elimina)
- Modifica/eliminazione di tutti gli eventi
- Statistiche globali della piattaforma

## Setup

### 1. Installa le dipendenze

```bash
cd eventi-comunale
npm install
```

### 2. Configura Supabase

1. Crea un nuovo progetto su https://supabase.com
2. Vai su Project Settings > API e copia:
   - Project URL
   - anon/public key
3. Crea il file `.env.local` nella root del progetto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Crea il database

1. Vai su **SQL Editor** nella dashboard Supabase
2. Copia e incolla il contenuto di `supabase/schema.sql`
3. Clicca **Run** per eseguire lo script

### 4. Crea lo storage per le immagini (opzionale)

1. Vai su **Storage** nella dashboard Supabase
2. Crea un nuovo bucket chiamato `event-images`
3. Imposta il bucket come **Public**

### 5. Crea gli account Admin

Gli admin devono essere creati manualmente:

1. Vai su **Authentication > Users** nella dashboard Supabase
2. Clicca **Add user > Create new user**
3. Crea il primo admin:
   - Email: `matteo@admin.com`
   - Password: `cagliostro$1`
   - Conferma la email (checkbox)
4. Crea il secondo admin:
   - Email: `polpo@admin.com`
   - Password: `toro`
   - Conferma la email (checkbox)
5. Copia gli UUID dei due utenti appena creati
6. Vai su **SQL Editor** ed esegui (sostituendo gli UUID):

```sql
INSERT INTO users (id, email, nome, cognome, role) VALUES
  ('UUID-DEL-PRIMO-ADMIN', 'matteo@admin.com', 'Matteo', 'Calzamiglia', 'admin'),
  ('UUID-DEL-SECONDO-ADMIN', 'polpo@admin.com', 'Polpo', '', 'admin');
```

### 6. Avvia l'applicazione

```bash
npm run dev
```

Apri http://localhost:3000 nel browser.

## Credenziali di test

**Admin 1:**
- Email: matteo@admin.com
- Password: cagliostro$1

**Admin 2:**
- Email: polpo@admin.com
- Password: toro

## Struttura del progetto

```
src/
├── app/
│   ├── (auth)/           # Login, registrazione, recupero password
│   ├── admin/            # Pannello admin
│   ├── dashboard/        # Dashboard comunale
│   ├── evento/[id]/      # Dettaglio evento
│   ├── calendario/       # Vista calendario
│   ├── preferiti/        # Eventi salvati
│   ├── profilo/          # Impostazioni utente
│   └── notifiche/        # Centro notifiche
├── components/
│   ├── layout/           # Navbar
│   └── events/           # Card evento, filtri
├── lib/
│   ├── supabase/         # Client Supabase
│   └── actions/          # Server actions
├── stores/               # Zustand stores
└── types/                # TypeScript types
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: Zustand
- **Date**: date-fns

## Deploy su Vercel

1. Connetti il repository GitHub a Vercel
2. Aggiungi le variabili d'ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (URL del deploy, es. https://tuodominio.vercel.app)
3. Deploy!

## Note importanti

- Le associazioni non hanno accesso diretto all'app
- Workflow: associazione contatta comune → comunale crea evento → pubblicazione immediata
- Le recensioni sono possibili solo dopo la data dell'evento
- Un utente può lasciare una sola recensione per evento
- Gli utenti comunali vengono creati solo dagli admin
