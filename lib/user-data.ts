export class UserDataService {
  private static getUserKey(userId: string, dataType: string): string {
    return `marketdesk_user_${userId}_${dataType}`
  }

  // Trade Journal Data
  static saveTradeJournal(userId: string, trades: any[]) {
    if (typeof window === "undefined") return
    try {
      const key = this.getUserKey(userId, "trades")
      localStorage.setItem(key, JSON.stringify(trades))
    } catch (error) {
      console.error("Error saving trade journal:", error)
    }
  }

  static getTradeJournal(userId: string): any[] {
    if (typeof window === "undefined") return []
    try {
      const key = this.getUserKey(userId, "trades")
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error getting trade journal:", error)
      return []
    }
  }

  // Platform Settings
  static savePlatformSettings(userId: string, settings: any) {
    if (typeof window === "undefined") return
    try {
      const key = this.getUserKey(userId, "settings")
      localStorage.setItem(key, JSON.stringify(settings))
    } catch (error) {
      console.error("Error saving platform settings:", error)
    }
  }

  static getPlatformSettings(userId: string): any {
    if (typeof window === "undefined") return {}
    try {
      const key = this.getUserKey(userId, "settings")
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error("Error getting platform settings:", error)
      return {}
    }
  }

  // User Profile
  static saveUserProfile(userId: string, profile: any) {
    if (typeof window === "undefined") return
    try {
      const key = this.getUserKey(userId, "profile")
      localStorage.setItem(key, JSON.stringify(profile))
    } catch (error) {
      console.error("Error saving user profile:", error)
    }
  }

  static getUserProfile(userId: string): any {
    if (typeof window === "undefined") return {}
    try {
      const key = this.getUserKey(userId, "profile")
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error("Error getting user profile:", error)
      return {}
    }
  }

  // Watchlists
  static saveWatchlists(userId: string, watchlists: any[]) {
    if (typeof window === "undefined") return
    try {
      const key = this.getUserKey(userId, "watchlists")
      localStorage.setItem(key, JSON.stringify(watchlists))
    } catch (error) {
      console.error("Error saving watchlists:", error)
    }
  }

  static getWatchlists(userId: string): any[] {
    if (typeof window === "undefined") return []
    try {
      const key = this.getUserKey(userId, "watchlists")
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error getting watchlists:", error)
      return []
    }
  }

  // Clear all user data (for logout/account deletion)
  static clearUserData(userId: string) {
    if (typeof window === "undefined") return
    try {
      const keys = ["trades", "settings", "profile", "watchlists"]
      keys.forEach((dataType) => {
        const key = this.getUserKey(userId, dataType)
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error("Error clearing user data:", error)
    }
  }

  // Migrate anonymous data to user account
  static migrateAnonymousData(userId: string) {
    if (typeof window === "undefined") return
    try {
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
    } catch (error) {
      console.error("Error migrating anonymous data:", error)
    }
  }
}
