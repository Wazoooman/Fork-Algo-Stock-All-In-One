"use client"

import { useState, useEffect } from "react"
import { Settings, Database, Bell, Shield, Check, RotateCcw } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface PlatformSettingsProps {
  onCurrencyChange?: (currency: string) => void
}

export default function PlatformSettings({ onCurrencyChange }: PlatformSettingsProps) {
  const defaultSettings = {
    finnhubKey: "",
    alphaVantageKey: "",
    emailNotifications: false,
    newsAlerts: false,
    priceAlerts: false,
    theme: "system",
    currency: "usd",
    compactMode: false,
    dataCollection: false,
    autoSave: true,
  }

  const [settings, setSettings] = useState(defaultSettings)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [resetStatus, setResetStatus] = useState<"idle" | "resetting" | "reset">("idle")

  /* ──────────────────────────────
   *  Load previously-saved settings
   * ────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem("platformSettings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings(parsed)
        if (onCurrencyChange && parsed.currency) {
          onCurrencyChange(parsed.currency)
        }
      } catch {
        /* ignore malformed JSON */
      }
    }
  }, [onCurrencyChange])

  /* ──────────────────────────────
   *  Helpers
   * ────────────────────────────── */
  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    if (key === "currency" && onCurrencyChange) onCurrencyChange(value)
  }

  const handleSave = () => {
    setSaveStatus("saving")
    setTimeout(() => {
      localStorage.setItem("platformSettings", JSON.stringify(settings))
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    }, 500)
  }

  const handleReset = () => {
    setResetStatus("resetting")
    setTimeout(() => {
      setSettings(defaultSettings)
      localStorage.removeItem("platformSettings")
      if (onCurrencyChange) onCurrencyChange("usd")
      setResetStatus("reset")
      setTimeout(() => setResetStatus("idle"), 2000)
    }, 500)
  }

  /* ──────────────────────────────
   *  UI
   * ────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Settings className="h-8 w-8" />
          Platform Settings
        </h1>
        <p className="mt-1 text-muted-foreground">Configure your TradingHub experience</p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── API Configuration ───────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>Connect external data sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="finnhubKey">Finnhub API Key</Label>
              <Input
                id="finnhubKey"
                type="password"
                placeholder="Enter your API key"
                value={settings.finnhubKey}
                onChange={(e) => updateSetting("finnhubKey", e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Get your free key at{" "}
                <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" className="underline">
                  finnhub.io
                </a>
              </p>
            </div>

            <div>
              <Label htmlFor="alphaVantageKey">Alpha Vantage API Key&nbsp;(Optional)</Label>
              <Input
                id="alphaVantageKey"
                type="password"
                placeholder="Enter your API key"
                value={settings.alphaVantageKey}
                onChange={(e) => updateSetting("alphaVantageKey", e.target.value)}
              />
            </div>

            <Button variant="secondary" onClick={() => alert("Connection test coming soon")}>
              Test Connection
            </Button>
          </CardContent>
        </Card>

        {/* ── Notifications ───────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "emailNotifications",
                label: "Email Notifications",
                desc: "Receive trade alerts via email",
              },
              {
                key: "newsAlerts",
                label: "News Alerts",
                desc: "Get notified of important market news",
              },
              {
                key: "priceAlerts",
                label: "Price Alerts",
                desc: "Alert me when a stock hits my target price",
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor={item.key}>{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  id={item.key}
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onCheckedChange={(checked) => updateSetting(item.key as keyof typeof settings, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Display Preferences ─────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Display Preferences</CardTitle>
            <CardDescription>Customize your interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme */}
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select value={settings.theme} onValueChange={(v) => updateSetting("theme", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Currency */}
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={settings.currency} onValueChange={(v) => updateSetting("currency", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
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

            {/* Compact Mode */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compactMode">Compact Mode</Label>
                <p className="text-xs text-muted-foreground">Show more data in less space</p>
              </div>
              <Switch
                id="compactMode"
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSetting("compactMode", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Privacy & Security ──────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Manage data and privacy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Anonymous usage data */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dataCollection">Anonymous Usage Data</Label>
                <p className="text-xs text-muted-foreground">Help improve the platform</p>
              </div>
              <Switch
                id="dataCollection"
                checked={settings.dataCollection}
                onCheckedChange={(checked) => updateSetting("dataCollection", checked)}
              />
            </div>

            {/* Auto-save trades */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoSave">Auto-save Trade Data</Label>
                <p className="text-xs text-muted-foreground">Automatically save your trades locally</p>
              </div>
              <Switch
                id="autoSave"
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting("autoSave", checked)}
              />
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                localStorage.clear()
                alert("All local data cleared.")
              }}
            >
              Clear All Local Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Save / Reset Buttons ─────────────── */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          disabled={resetStatus === "resetting"}
          onClick={handleReset}
          className="transition-all bg-transparent"
        >
          {resetStatus === "resetting" && <RotateCcw className="mr-2 h-4 w-4 animate-spin" />}
          {resetStatus === "reset" && <Check className="mr-2 h-4 w-4 text-green-600" />}
          {resetStatus === "idle" && "Reset to Defaults"}
          {resetStatus === "resetting" && "Resetting..."}
          {resetStatus === "reset" && "Reset Complete"}
        </Button>

        <Button disabled={saveStatus === "saving"} onClick={handleSave} className="transition-all">
          {saveStatus === "saving" && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {saveStatus === "saved" && <Check className="mr-2 h-4 w-4 text-white" />}
          {saveStatus === "idle" && "Save Settings"}
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "saved" && "Saved!"}
        </Button>
      </div>
    </div>
  )
}
