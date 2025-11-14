import { getSupabaseServerClient } from './supabase'

const sql = getSupabaseServerClient()

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
    const supabase = await getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        password_hash: passwordHash,
        email_verified: false,
        verification_token: verificationToken,
        verification_token_expires: tokenExpires.toISOString(),
        subscription: 'free'
      })
      .select()
      .single()
    
    if (error) throw error
    return data as DatabaseUser
  }

  static async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    const supabase = await getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return (data as DatabaseUser) || null
  }

  static async getUserById(id: string): Promise<DatabaseUser | null> {
    const supabase = await getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return (data as DatabaseUser) || null
  }

  static async verifyEmail(token: string): Promise<boolean> {
    const supabase = await getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires: null
      })
      .eq('verification_token', token)
      .gt('verification_token_expires', new Date().toISOString())
      .select()
    
    if (error) throw error
    return data.length > 0
  }

  static async updateUserName(userId: string, firstName: string, lastName: string): Promise<DatabaseUser | null> {
    const supabase = await getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return (data as DatabaseUser) || null
  }

  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const supabase = await getSupabaseServerClient()
      
      // Delete related data first (Supabase handles this via CASCADE if configured)
      await supabase.from('user_preferences').delete().eq('user_id', userId)
      await supabase.from('trade_history').delete().eq('user_id', userId)
      await supabase.from('watchlists').delete().eq('user_id', userId)
      
      // Delete the user
      const { error } = await supabase.from('users').delete().eq('id', userId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error("Delete user error:", error)
      return false
    }
  }

  // Watchlist management
  static async getUserWatchlists(userId: string): Promise<Watchlist[]> {
    const supabase = await getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Watchlist[]
  }

  static async createWatchlist(userId: string, name: string, symbols: string[] = []): Promise<Watchlist> {
    const supabase = await getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('watchlists')
      .insert({
        user_id: userId,
        name,
        symbols,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data as Watchlist
  }

  static async updateWatchlist(id: string, name: string, symbols: string[]): Promise<Watchlist> {
    const supabase = await getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('watchlists')
      .update({
        name,
        symbols,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Watchlist
  }

  // Trade history management
  static async getUserTradeHistory(userId: string): Promise<TradeHistory[]> {
    const supabase = await getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('trade_history')
      .select('*')
      .eq('user_id', userId)
      .order('trade_date', { ascending: false })
    
    if (error) throw error
    return data as TradeHistory[]
  }

  static async addTradeHistory(
    userId: string,
    symbol: string,
    action: "buy" | "sell",
    quantity: number,
    price: number,
    notes?: string,
  ): Promise<TradeHistory> {
    const supabase = await getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('trade_history')
      .insert({
        user_id: userId,
        symbol,
        action,
        quantity,
        price,
        notes: notes || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data as TradeHistory
  }

  // User preferences management
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const supabase = await getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return (data as UserPreferences) || null
  }

  static async createUserPreferences(userId: string): Promise<UserPreferences> {
    const supabase = await getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data as UserPreferences
  }

  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const supabase = await getSupabaseServerClient()
    const { theme, notifications_enabled, default_watchlist_id, preferences: prefs } = preferences

    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    if (theme !== undefined) updateData.theme = theme
    if (notifications_enabled !== undefined) updateData.notifications_enabled = notifications_enabled
    if (default_watchlist_id !== undefined) updateData.default_watchlist_id = default_watchlist_id
    if (prefs !== undefined) updateData.preferences = prefs

    const { data, error } = await supabase
      .from('user_preferences')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data as UserPreferences
  }
}
