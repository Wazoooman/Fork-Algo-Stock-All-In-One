"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Key,
  Camera,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  DollarSign,
  Target,
  AlertTriangle,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { UserDataService } from "@/lib/user-data"

interface PlatformSettingsProps {
  onCurrencyChange?: (currency: string) => void
}

export default function PlatformSettings({ onCurrencyChange }: PlatformSettingsProps) {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Platform Settings
  const [apiKey, setApiKey] = useState("")
  const [currency, setCurrency] = useState("usd")
  const [notifications, setNotifications] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState("30")
  const [riskTolerance, setRiskTolerance] = useState("medium")

  // User Profile Settings
  const [userProfile, setUserProfile] = useState({
    firstName: "John",
    lastName: "Trader",
    email: "john.trader@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    joinDate: "2024-01-15",
    tradingExperience: "intermediate",
    preferredStrategy: "swing",
    accountBalance: 50000,
    totalTrades: 127,
    winRate: 68.5,
    avgReturn: 12.3,
  })

  useEffect(() => {
    setMounted(true)

    if (user) {
      // Load user-specific settings
      const userSettings = UserDataService.getPlatformSettings(user.id)
      const userProfileData = UserDataService.getUserProfile(user.id)

      // Load platform settings
      setApiKey(userSettings.apiKey || "")
      setCurrency(userSettings.currency || "usd")
      setNotifications(userSettings.notifications ?? true)
      setAutoRefresh(userSettings.autoRefresh ?? true)
      setRefreshInterval(userSettings.refreshInterval || "30")
      setRiskTolerance(userSettings.riskTolerance || "medium")

      // Load user profile with user's actual data
      setUserProfile((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        joinDate: user.createdAt ? user.createdAt.split("T")[0] : prev.joinDate,
        ...userProfileData,
      }))
    } else {
      // Load anonymous settings
      const savedSettings = localStorage.getItem("platformSettings")
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings)
          setApiKey(settings.apiKey || "")
          setCurrency(settings.currency || "usd")
          setNotifications(settings.notifications ?? true)
          setAutoRefresh(settings.autoRefresh ?? true)
          setRefreshInterval(settings.refreshInterval || "30")
          setRiskTolerance(settings.riskTolerance || "medium")
        } catch (error) {
          console.error("Error loading settings:", error)
        }
      }

      // Load anonymous user profile
      const savedProfile = localStorage.getItem("userProfile")
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile)
          setUserProfile((prev) => ({ ...prev, ...profile }))
        } catch (error) {
          console.error("Error loading profile:", error)
        }
      }
    }
  }, [user])

  const saveSettings = () => {
    const settings = {
      apiKey,
      currency,
      notifications,
      autoRefresh,
      refreshInterval,
      riskTolerance,
    }

    if (user) {
      UserDataService.savePlatformSettings(user.id, settings)
    } else {
      localStorage.setItem("platformSettings", JSON.stringify(settings))
    }

    if (onCurrencyChange) {
      onCurrencyChange(currency)
    }

    toast({
      title: "Settings Saved",
      description: "Your platform settings have been updated successfully.",
    })
  }

  const saveProfile = () => {
    if (user) {
      UserDataService.saveUserProfile(user.id, userProfile)
    } else {
      localStorage.setItem("userProfile", JSON.stringify(userProfile))
    }

    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    })
  }

  const updateProfile = (field: string, value: string | number) => {
    setUserProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Settings</h1>
        <p className="text-gray-400 mt-2">
          Manage your platform settings and profile
          {user && <span className="ml-2 text-green-400">• Synced to your account</span>}
        </p>
      </div>

      <Tabs defaultValue="platform" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
          <TabsTrigger value="platform" className="data-[state=active]:bg-gray-700 text-gray-300">
            <Settings className="h-4 w-4 mr-2" />
            Platform
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-gray-700 text-gray-300">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-gray-700 text-gray-300">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-gray-700 text-gray-300">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <Database className="h-5 w-5" />
                API Configuration
              </CardTitle>
              <CardDescription className="text-gray-400">Configure your market data API settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-gray-200">
                  Finnhub API Key
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Finnhub API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
                <p className="text-sm text-gray-500">
                  Get your free API key from{" "}
                  <a
                    href="https://finnhub.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    finnhub.io
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Display Settings
              </CardTitle>
              <CardDescription className="text-gray-400">Customize how data is displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-gray-200">
                  Currency
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="jpy">JPY (¥)</SelectItem>
                    <SelectItem value="cad">CAD (C$)</SelectItem>
                    <SelectItem value="aud">AUD (A$)</SelectItem>
                    <SelectItem value="chf">CHF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme" className="text-gray-200">
                  Theme
                </Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100">Data Refresh</CardTitle>
              <CardDescription className="text-gray-400">Configure automatic data refresh settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-200">Auto Refresh</Label>
                  <p className="text-sm text-gray-500">Automatically refresh market data</p>
                </div>
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>

              {autoRefresh && (
                <div className="space-y-2">
                  <Label htmlFor="refreshInterval" className="text-gray-200">
                    Refresh Interval (seconds)
                  </Label>
                  <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">
              Save Platform Settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-gray-400">
                Update your personal details and trading profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" />
                  <AvatarFallback className="bg-gray-700 text-gray-200 text-lg">
                    {userProfile.firstName[0]}
                    {userProfile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-200">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={userProfile.firstName}
                    onChange={(e) => updateProfile("firstName", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-100"
                    disabled={!!user} // Disable if user is logged in (comes from account)
                  />
                  {user && <p className="text-xs text-gray-500">This comes from your account settings</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-200">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={userProfile.lastName}
                    onChange={(e) => updateProfile("lastName", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-100"
                    disabled={!!user} // Disable if user is logged in (comes from account)
                  />
                  {user && <p className="text-xs text-gray-500">This comes from your account settings</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => updateProfile("email", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                  disabled={!!user} // Disable if user is logged in (comes from account)
                />
                {user && <p className="text-xs text-gray-500">This comes from your account settings</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-200 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={userProfile.phone}
                    onChange={(e) => updateProfile("phone", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-200 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={userProfile.location}
                    onChange={(e) => updateProfile("location", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-100"
                  />
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-gray-200">
                    Trading Experience
                  </Label>
                  <Select
                    value={userProfile.tradingExperience}
                    onValueChange={(value) => updateProfile("tradingExperience", value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (1-5 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strategy" className="text-gray-200">
                    Preferred Strategy
                  </Label>
                  <Select
                    value={userProfile.preferredStrategy}
                    onValueChange={(value) => updateProfile("preferredStrategy", value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="day">Day Trading</SelectItem>
                      <SelectItem value="swing">Swing Trading</SelectItem>
                      <SelectItem value="position">Position Trading</SelectItem>
                      <SelectItem value="longterm">Long-term Investing</SelectItem>
                      <SelectItem value="options">Options Trading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trading Statistics
              </CardTitle>
              <CardDescription className="text-gray-400">Your trading performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    ${userProfile.accountBalance.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Account Balance</div>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{userProfile.totalTrades}</div>
                  <div className="text-sm text-gray-400">Total Trades</div>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{userProfile.winRate}%</div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">+{userProfile.avgReturn}%</div>
                  <div className="text-sm text-gray-400">Avg Return</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveProfile} className="bg-blue-600 hover:bg-blue-700">
              Save Profile
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-gray-400">Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-200">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications in your browser</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <Separator className="bg-gray-700" />

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-200">Trading Alerts</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-200">Price Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified when stocks hit target prices</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-200">Volume Spikes</Label>
                      <p className="text-sm text-gray-500">Alert when unusual volume is detected</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-200">News Alerts</Label>
                      <p className="text-sm text-gray-500">Breaking news for your watchlist stocks</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-200">System Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-200">Market Open/Close</Label>
                      <p className="text-sm text-gray-500">Daily market session notifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-200">System Updates</Label>
                      <p className="text-sm text-gray-500">Platform updates and maintenance</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-gray-400">Manage your account security and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-200">Password & Authentication</h4>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-700 text-gray-300 bg-transparent"
                    disabled={!user}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  {!user && <p className="text-xs text-gray-500">Sign in to manage password settings</p>}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-200">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <Badge variant="outline" className="border-yellow-600 text-yellow-400">
                      {user ? "Available" : "Sign in required"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-200">Risk Management</h4>
                <div className="space-y-2">
                  <Label htmlFor="riskTolerance" className="text-gray-200 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Risk Tolerance
                  </Label>
                  <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Danger Zone
                </h4>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-red-600 text-red-400 hover:bg-red-600/10 bg-transparent"
                    disabled={!user}
                  >
                    Clear All Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-red-600 text-red-400 hover:bg-red-600/10 bg-transparent"
                    disabled={!user}
                  >
                    Delete Account
                  </Button>
                  {!user && <p className="text-xs text-gray-500">Sign in to access account management options</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
