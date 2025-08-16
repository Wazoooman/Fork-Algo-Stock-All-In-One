// User-specific data storage
export class UserDataService {
  private static getUserKey(userId: string, dataType: string): string {
    return `marketdesk_user_${userId}_${dataType}`
  }

  // Trade Journal Data
  static saveTradeJournal(userId: string, trades: any[]) {
    const key = this.getUserKey(userId, "trades")
    localStorage.setItem(key, JSON.stringify(trades))
  }

  static getTradeJournal(userId: string): any[] {
    const key = this.getUserKey(userId, "trades")
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  // Platform Settings
  static savePlatformSettings(userId: string, settings: any) {
    const key = this.getUserKey(userId, "settings")
    localStorage.setItem(key, JSON.stringify(settings))
  }

  static getPlatformSettings(userId: string): any {
    const key = this.getUserKey(userId, "settings")
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : {}
  }

  // User Profile
  static saveUserProfile(userId: string, profile: any) {
    const key = this.getUserKey(userId, "profile")
    localStorage.setItem(key, JSON.stringify(profile))
  }

  static getUserProfile(userId: string): any {
    const key = this.getUserKey(userId, "profile")
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : {}
  }

  // Watchlists
  static saveWatchlists(userId: string, watchlists: any[]) {
    const key = this.getUserKey(userId, "watchlists")
    localStorage.setItem(key, JSON.stringify(watchlists))
  }

  static getWatchlists(userId: string): any[] {
    const key = this.getUserKey(userId, "watchlists")
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  // Clear all user data (for logout/account deletion)
  static clearUserData(userId: string) {
    const keys = ["trades", "settings", "profile", "watchlists"]
    keys.forEach((dataType) => {
      const key = this.getUserKey(userId, dataType)
      localStorage.removeItem(key)
    })
  }

  // Migrate anonymous data to user account
  static migrateAnonymousData(userId: string) {
    // Migrate existing trade journal data
    const existingTrades = localStorage.getItem("tradeJournal")
    if (existingTrades) {
      this.saveTradeJournal(userId, JSON.parse(existingTrades))
      localStorage.removeItem("tradeJournal")
    }

    // Migrate existing platform settings
    const existingSettings = localStorage.getItem("platformSettings")
    if (existingSettings) {
      this.savePlatformSettings(userId, JSON.parse(existingSettings))
      localStorage.removeItem("platformSettings")
    }

    // Migrate existing user profile
    const existingProfile = localStorage.getItem("userProfile")
    if (existingProfile) {
      this.saveUserProfile(userId, JSON.parse(existingProfile))
      localStorage.removeItem("userProfile")
    }
  }
}
