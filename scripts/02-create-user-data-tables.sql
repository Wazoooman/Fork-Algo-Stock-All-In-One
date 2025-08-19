-- Create watchlists table
CREATE TABLE IF NOT EXISTS neon_auth.watchlists (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  symbols JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trade history table
CREATE TABLE IF NOT EXISTS neon_auth.trade_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  action TEXT NOT NULL, -- 'buy' or 'sell'
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  trade_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS neon_auth.user_preferences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  default_watchlist_id TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON neon_auth.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_history_user_id ON neon_auth.trade_history(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_history_symbol ON neon_auth.trade_history(symbol);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON neon_auth.user_preferences(user_id);
