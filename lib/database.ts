import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface DatabaseUser {
  id: string
  email: string
  first_name: string
  last_name: string
  email_verified: boolean
  verification_token?: string
  verification_token_expires?: string
  password_hash: string
  subscription: "free" | "premium"
  created_at: string
  updated_at: string
}

export interface Watchlist {
  id: string
  user_id: string
  name: string
  symbols: string[]
  created_at: string
  updated_at: string
}

export interface TradeHistory {
  id: string
  user_id: string
  symbol: string
  action: "buy" | "sell"
  quantity: number
  price: number
  trade_date: string
  notes?: string
  created_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  theme: "light" | "dark"
  notifications_enabled: boolean
  default_watchlist_id?: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export class DatabaseService {
  // User management
  static async createUser(
    email: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
    verificationToken: string,
    tokenExpires: Date,
  ): Promise<DatabaseUser> {
    const result = await sql`
      INSERT INTO neon_auth.users (
        email, first_name, last_name, password_hash, 
        email_verified, verification_token, verification_token_expires,
        subscription
      ) VALUES (
        ${email}, ${firstName}, ${lastName}, ${passwordHash}, false, 
        ${verificationToken}, ${tokenExpires.toISOString()}, 'free'
      ) RETURNING *
    `
    return result[0] as DatabaseUser
  }

  static async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    const result = await sql`
      SELECT * FROM neon_auth.users WHERE email = ${email} LIMIT 1
    `
    return (result[0] as DatabaseUser) || null
  }

  static async getUserById(id: string): Promise<DatabaseUser | null> {
    const result = await sql`
      SELECT * FROM neon_auth.users WHERE id = ${id} LIMIT 1
    `
    return (result[0] as DatabaseUser) || null
  }

  static async verifyEmail(token: string): Promise<boolean> {
    const result = await sql`
      UPDATE neon_auth.users 
      SET email_verified = true, verification_token = NULL, verification_token_expires = NULL
      WHERE verification_token = ${token} 
      AND verification_token_expires > NOW()
      RETURNING id
    `
    return result.length > 0
  }

  // Watchlist management
  static async getUserWatchlists(userId: string): Promise<Watchlist[]> {
    const result = await sql`
      SELECT * FROM neon_auth.watchlists 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `
    return result as Watchlist[]
  }

  static async createWatchlist(userId: string, name: string, symbols: string[] = []): Promise<Watchlist> {
    const result = await sql`
      INSERT INTO neon_auth.watchlists (user_id, name, symbols, created_at, updated_at)
      VALUES (${userId}, ${name}, ${JSON.stringify(symbols)}, NOW(), NOW())
      RETURNING *
    `
    return result[0] as Watchlist
  }

  static async updateWatchlist(id: string, name: string, symbols: string[]): Promise<Watchlist> {
    const result = await sql`
      UPDATE neon_auth.watchlists 
      SET name = ${name}, symbols = ${JSON.stringify(symbols)}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] as Watchlist
  }

  // Trade history management
  static async getUserTradeHistory(userId: string): Promise<TradeHistory[]> {
    const result = await sql`
      SELECT * FROM neon_auth.trade_history 
      WHERE user_id = ${userId} 
      ORDER BY trade_date DESC
    `
    return result as TradeHistory[]
  }

  static async addTradeHistory(
    userId: string,
    symbol: string,
    action: "buy" | "sell",
    quantity: number,
    price: number,
    notes?: string,
  ): Promise<TradeHistory> {
    const result = await sql`
      INSERT INTO neon_auth.trade_history (user_id, symbol, action, quantity, price, notes, created_at)
      VALUES (${userId}, ${symbol}, ${action}, ${quantity}, ${price}, ${notes || null}, NOW())
      RETURNING *
    `
    return result[0] as TradeHistory
  }

  // User preferences management
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const result = await sql`
      SELECT * FROM neon_auth.user_preferences WHERE user_id = ${userId} LIMIT 1
    `
    return (result[0] as UserPreferences) || null
  }

  static async createUserPreferences(userId: string): Promise<UserPreferences> {
    const result = await sql`
      INSERT INTO neon_auth.user_preferences (user_id, created_at, updated_at)
      VALUES (${userId}, NOW(), NOW())
      RETURNING *
    `
    return result[0] as UserPreferences
  }

  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const { theme, notifications_enabled, default_watchlist_id, preferences: prefs } = preferences

    const result = await sql`
      UPDATE neon_auth.user_preferences 
      SET 
        theme = COALESCE(${theme || null}, theme),
        notifications_enabled = COALESCE(${notifications_enabled ?? null}, notifications_enabled),
        default_watchlist_id = COALESCE(${default_watchlist_id || null}, default_watchlist_id),
        preferences = COALESCE(${prefs ? JSON.stringify(prefs) : null}, preferences),
        updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `
    return result[0] as UserPreferences
  }
}
