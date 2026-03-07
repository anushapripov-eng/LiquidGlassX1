-- Project: TradeJournal Supabase Schema
-- Based on Next.js App structure

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nickname TEXT,
    avatar_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profile Settings
CREATE TABLE IF NOT EXISTS profile_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    account_size DECIMAL(20, 2) DEFAULT 10000,
    bio TEXT,
    accent_color TEXT DEFAULT 'blue',
    metal_price_api_key TEXT,
    finnhub_api_key TEXT,
    custom_avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trades
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset TEXT NOT NULL,
    result DECIMAL(10, 2) NOT NULL, -- percentage
    trade_date DATE NOT NULL,
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Trade Entries (Detailed execution steps if needed)
CREATE TABLE IF NOT EXISTS trade_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
    entry_price DECIMAL(20, 8),
    exit_price DECIMAL(20, 8),
    size DECIMAL(20, 2),
    side TEXT CHECK (side IN ('long', 'short')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Daily Notes / Day Status
CREATE TABLE IF NOT EXISTS daily_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    note_date DATE NOT NULL,
    content TEXT,
    is_skipped BOOLEAN DEFAULT FALSE,
    status TEXT CHECK (status IN ('profit', 'loss', 'skip', 'break')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, note_date)
);

-- 6. Weekly Notes / Weekly Status
CREATE TABLE IF NOT EXISTS weekly_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    learning TEXT,
    improve TEXT,
    thoughts TEXT,
    balance_change DECIMAL(20, 2),
    goal_hit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_start_date)
);

-- 7. Rules
CREATE TABLE IF NOT EXISTS rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Important Points
CREATE TABLE IF NOT EXISTS important_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Mistakes
CREATE TABLE IF NOT EXISTS mistakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mistake_date DATE NOT NULL,
    description TEXT NOT NULL,
    tag TEXT CHECK (tag IN ('technical', 'broke-rules', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Telegram Flags (Worker persistence)
CREATE TABLE IF NOT EXISTS telegram_flags (
    id SERIAL PRIMARY KEY,
    flag_key TEXT UNIQUE NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Uploaded Files (Metadata for storage)
CREATE TABLE IF NOT EXISTS uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_type TEXT,
    bucket_name TEXT DEFAULT 'journal_assets',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX idx_trades_user_date ON trades(user_id, trade_date);
CREATE INDEX idx_daily_notes_user_date ON daily_notes(user_id, note_date);
CREATE INDEX idx_weekly_notes_user_date ON weekly_notes(user_id, week_start_date);
