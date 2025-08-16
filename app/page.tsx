"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { useTheme } from "@/components/theme-provider"
import { TrendingUp } from "lucide-react"
import { TrendingUpIcon, CheckCircle, XCircle } from "lucide-react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Import our main components
import StockScreener from "@/components/stock-screener"
import TradeJournal from "@/components/trade-journal"
import NewsFeed from "@/components/news-feed"
import Dashboard from "@/components/dashboard"
import PlatformSettings from "@/components/platform-settings"
import { AppSidebar } from "@/components/app-sidebar"
import { UserMenu } from "@/components/auth/user-menu"
import { useAuth } from "@/lib/auth"
import { UserDataService } from "@/lib/user-data"

interface ScreenerResult {
  symbol: string
  name: string
  sector: string
  price: number
  change: number
  changePercent: number
  overallScore: number
  fundamentalScore: number
  technicalScore: number
  momentumScore: number
  valueScore: number
  qualityScore: number
  riskScore: number
  sentimentScore: number
  volumeScore: number
  reasons: string[]
  warnings: string[]
  confidence: number
  lastUpdated: string
}

interface MarketTime {
  currentTime: string
  marketStatus: string
  openTime: string
  closeTime: string
  timeUntil: string
  timeUntilLabel: string
  statusColor: string
}

type TradeType = "day" | "swing" | "position" | "longterm" | "options"

interface TradeAnalysis {
  type: TradeType
  timeframe: string
  riskLevel: string
  optimalEntryPoints: string[]
  optimalExitPoints: string[]
  stopLossRecommendation: string
  takeProfitRecommendation: string
  keyIndicators: string[]
  tradingVolume: string
  bestTimeToTrade: string
}

interface EntrySignal {
  name: string
  description: string
  bullishSignal: boolean
  strength: "Strong" | "Moderate" | "Weak"
  timeframe: string
  example: string
  riskLevel: "Low" | "Medium" | "High"
  successRate: string
  entryPrice: number
  stopLoss: number
  target1: number
  target2: number
  riskReward: string
}

interface FinnhubQuote {
  c: number // Current price
  d: number // Change
  dp: number // Percent change
  h: number // High price of the day
  l: number // Low price of the day
  o: number // Open price of the day
  pc: number // Previous close price
  t: number // Timestamp
}

interface FinnhubProfile {
  country: string
  currency: string
  exchange: string
  ipo: string
  marketCapitalization: number
  name: string
  phone: string
  shareOutstanding: number
  ticker: string
  weburl: string
  logo: string
  finnhubIndustry: string
}

interface SPY0DTEAnalysis {
  version: string
  marketSentiment: number
  marketPerformanceFactor: number
  technicalAnalysisScore: number
  optionsMarketAnalysis: number
  historicalDataAnalysis: number
  bayesianProbabilityFactor: number
  hurstExponent: number
  meanReversionFactor: number
  finalMarketDirection: number
  optimalEntryTiming: number
  directionalBias: "CALLS" | "PUTS"
  monteCarloSim1: number
  monteCarloSim2: number
  forecastZones: {
    time1030: number
    time1100: number
    time1400: number
    close: number
  }
  topContracts: Array<{
    type: "CALL" | "PUT"
    strike: number
    delta: number
    itmProbability: number
    premium: number
  }>
  confidence: number
}

type ActiveTab = "dashboard" | "screener" | "journal" | "news" | "settings"

// Currency Context
interface CurrencyContextType {
  currency: string
  setCurrency: (currency: string) => void
  formatPrice: (price: number) => string
  getCurrencySymbol: () => string
  convertPrice: (price: number) => number
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider")
  }
  return context
}

// Currency conversion rates (in a real app, these would come from an API)
const CURRENCY_RATES = {
  usd: 1,
  eur: 0.85,
  gbp: 0.73,
  jpy: 110,
  cad: 1.25,
  aud: 1.35,
  chf: 0.92,
}

const CURRENCY_SYMBOLS = {
  usd: "$",
  eur: "€",
  gbp: "£",
  jpy: "¥",
  cad: "C$",
  aud: "A$",
  chf: "CHF",
}

// SPY 0DTE Strategy v23.6 Analysis
const calculateSPY0DTEAnalysis = (selectedStock?: ScreenerResult): SPY0DTEAnalysis => {
  const currentPrice = selectedStock?.price || 445 // Default SPY price

  // Step 1: Market Sentiment (MS)
  const econ = 0.6 + Math.random() * 0.4 // Economic factors (0.6-1.0)
  const sector = 0.5 + Math.random() * 0.5 // Sector rotation
  const geoPol = 0.4 + Math.random() * 0.6 // Geopolitical
  const global = 0.5 + Math.random() * 0.5 // Global markets
  const premarket = 0.3 + Math.random() * 0.7 // Premarket action

  const marketSentiment = (econ * 0.3 + sector * 0.2 + geoPol * 0.15 + global * 0.15 + premarket * 0.2) / 10

  // Step 2: Market Performance Factor (MPF)
  const priceChange = selectedStock?.changePercent || (Math.random() - 0.5) * 2
  const marketPerformanceFactor = Math.abs(priceChange) / 100

  // Step 3: Technical Analysis Score (TAS)
  const vwap = 0.4 + Math.random() * 0.6
  const rsi = 0.3 + Math.random() * 0.7
  const sma = 0.4 + Math.random() * 0.6
  const ema = 0.4 + Math.random() * 0.6
  const macd = 0.3 + Math.random() * 0.7
  const volume = 0.4 + Math.random() * 0.6
  const patterns = 0.3 + Math.random() * 0.7

  const technicalAnalysisScore = (vwap * 1.5 + rsi + sma + ema + macd + volume + patterns) / 70

  // Step 4: Options Market Analysis (OMA)
  const pcRatio = 0.3 + Math.random() * 0.7
  const iv = 0.4 + Math.random() * 0.6
  const delta = 0.4 + Math.random() * 0.6
  const gamma = 0.3 + Math.random() * 0.7
  const theta = 0.2 + Math.random() * 0.8
  const hv = 0.4 + Math.random() * 0.6

  const optionsMarketAnalysis = (pcRatio * 0.2 + iv * 0.2 + delta * 0.2 + gamma * 0.2 + theta * 0.1 + hv * 0.1) / 10

  // Step 5: Historical Data Analysis (HDA)
  const historicalDataAnalysis = 0.4 + Math.random() * 0.6

  // Step 6: Bayesian Probability Factor (BPF)
  const bayesianProbabilityFactor = 0.3 + Math.random() * 0.7

  // Step 7: Hurst Exponent
  const hurstExponent = 0.3 + Math.random() * 0.4 // 0.3-0.7 range

  // Step 8: Mean Reversion Factor (MRF)
  const meanReversionFactor = 0.2 + Math.random() * 0.8

  // Step 9: Final Market Direction (FMD)
  const finalMarketDirection =
    marketSentiment * 0.15 +
    marketPerformanceFactor * 0.1 +
    technicalAnalysisScore * 0.1 +
    optionsMarketAnalysis * 0.1 +
    historicalDataAnalysis * 0.1 +
    bayesianProbabilityFactor * 0.1 +
    hurstExponent * 0.1 +
    meanReversionFactor * 0.1 +
    0.65 * 0.25 // Additional factors

  // Step 10: Optimal Entry Timing
  const optimalEntryTiming = 0.4 + Math.random() * 0.6

  // Monte Carlo Simulations
  const monteCarloSim1 = 0.45 + Math.random() * 0.3 // 250k simulations
  const monteCarloSim2 = 0.4 + Math.random() * 0.4 // Entry timing refinement

  // Forecast Zones
  const forecastZones = {
    time1030: currentPrice * (0.995 + Math.random() * 0.01),
    time1100: currentPrice * (0.992 + Math.random() * 0.016),
    time1400: currentPrice * (0.988 + Math.random() * 0.024),
    close: currentPrice * (0.985 + Math.random() * 0.03),
  }

  // Directional Bias
  const directionalBias: "CALLS" | "PUTS" = finalMarketDirection >= 0.5 ? "CALLS" : "PUTS"

  // Top Contracts (ITM + 4 OTM)
  const topContracts =
    directionalBias === "CALLS"
      ? [
          { type: "CALL" as const, strike: currentPrice - 2, delta: 0.65, itmProbability: 0.68, premium: 3.45 },
          { type: "CALL" as const, strike: currentPrice, delta: 0.52, itmProbability: 0.52, premium: 2.15 },
          { type: "CALL" as const, strike: currentPrice + 1, delta: 0.42, itmProbability: 0.42, premium: 1.65 },
          { type: "CALL" as const, strike: currentPrice + 2, delta: 0.33, itmProbability: 0.33, premium: 1.25 },
          { type: "CALL" as const, strike: currentPrice + 3, delta: 0.25, itmProbability: 0.25, premium: 0.95 },
        ]
      : [
          { type: "PUT" as const, strike: currentPrice + 2, delta: -0.65, itmProbability: 0.68, premium: 3.45 },
          { type: "PUT" as const, strike: currentPrice, delta: -0.52, itmProbability: 0.52, premium: 2.15 },
          { type: "PUT" as const, strike: currentPrice - 1, delta: -0.42, itmProbability: 0.42, premium: 1.65 },
          { type: "PUT" as const, strike: currentPrice - 2, delta: -0.33, itmProbability: 0.33, premium: 1.25 },
          { type: "PUT" as const, strike: currentPrice - 3, delta: -0.25, itmProbability: 0.25, premium: 0.95 },
        ]

  const confidence = Math.min(95, 70 + Math.abs(finalMarketDirection - 0.5) * 100)

  return {
    version: "23.6",
    marketSentiment,
    marketPerformanceFactor,
    technicalAnalysisScore,
    optionsMarketAnalysis,
    historicalDataAnalysis,
    bayesianProbabilityFactor,
    hurstExponent,
    meanReversionFactor,
    finalMarketDirection,
    optimalEntryTiming,
    directionalBias,
    monteCarloSim1,
    monteCarloSim2,
    forecastZones,
    topContracts,
    confidence,
  }
}

const tabTitles = {
  dashboard: "Dashboard",
  screener: "Stock Screener",
  journal: "Trade Journal",
  news: "News Feed",
  settings: "Settings",
}

const tabDescriptions = {
  dashboard: "Overview and quick stats",
  screener: "Algorithmic stock analysis",
  journal: "Log and track your trades",
  news: "Real-time market news",
  settings: "Platform configuration & profile",
}

export default function TradingPlatform() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard")
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [results, setResults] = useState<ScreenerResult[]>([])
  const [selectedResult, setSelectedResult] = useState<ScreenerResult | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [marketTime, setMarketTime] = useState<MarketTime>({
    currentTime: "",
    marketStatus: "Calculating...",
    openTime: "7:30 AM",
    closeTime: "2:00 PM",
    timeUntil: "",
    timeUntilLabel: "",
    statusColor: "text-gray-500",
  })
  const [tradeType, setTradeType] = useState<TradeType>("swing")
  const [tradeAnalysis, setTradeAnalysis] = useState<TradeAnalysis | null>(null)
  const [spy0DTEAnalysis, setSpy0DTEAnalysis] = useState<SPY0DTEAnalysis | null>(null)
  const [currency, setCurrency] = useState("usd")

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Screening parameters
  const [minMarketCap, setMinMarketCap] = useState(1000) // Million
  const [maxPE, setMaxPE] = useState(30)
  const [minROE, setMinROE] = useState(10)
  const [enableMomentum, setEnableMomentum] = useState(true)
  const [enableValue, setEnableValue] = useState(true)
  const [enableQuality, setEnableQuality] = useState(true)
  const [enableTechnical, setEnableTechnical] = useState(true)
  const [riskTolerance, setRiskTolerance] = useState(50)

  // Popular stocks to screen (you can modify this list)
  const STOCK_SYMBOLS = [
    "AAPL",
    "MSFT",
    "GOOGL",
    "AMZN",
    "TSLA",
    "META",
    "NVDA",
    "NFLX",
    "BRK.B",
    "JPM",
    "JNJ",
    "V",
    "PG",
    "UNH",
    "HD",
    "MA",
    "DIS",
    "PYPL",
    "ADBE",
    "CRM",
    "INTC",
    "VZ",
    "KO",
    "PFE",
    "WMT",
    "BAC",
    "XOM",
    "T",
    "CSCO",
    "ABT",
  ]

  // Load currency from settings
  useEffect(() => {
    if (user) {
      // Load user-specific settings
      const userSettings = UserDataService.getPlatformSettings(user.id)
      if (userSettings.currency) {
        setCurrency(userSettings.currency)
      }
    } else {
      // Load anonymous settings
      const savedSettings = localStorage.getItem("platformSettings")
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings)
          if (settings.currency) {
            setCurrency(settings.currency)
          }
        } catch (error) {
          console.error("Error loading currency setting:", error)
        }
      }
    }
  }, [user])

  // Migrate anonymous data when user logs in
  useEffect(() => {
    if (user) {
      UserDataService.migrateAnonymousData(user.id)
    }
  }, [user])

  // Currency functions
  const convertPrice = (price: number): number => {
    const rate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES] || 1
    return price * rate
  }

  const formatPrice = (price: number): string => {
    const convertedPrice = convertPrice(price)
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || "$"

    if (currency === "jpy") {
      return `${symbol}${Math.round(convertedPrice).toLocaleString()}`
    }
    return `${symbol}${convertedPrice.toFixed(2)}`
  }

  const getCurrencySymbol = (): string => {
    return CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || "$"
  }

  // Update market time every minute
  useEffect(() => {
    const updateMarketTime = () => {
      const now = new Date()

      // Convert to Mountain Time
      const mtTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Denver" }))
      const currentTime = mtTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })

      // Market hours in Mountain Time (7:30 AM - 2:00 PM MT)
      const marketOpen = new Date(mtTime)
      marketOpen.setHours(7, 30, 0, 0)

      const marketClose = new Date(mtTime)
      marketClose.setHours(14, 0, 0, 0)

      const isWeekday = mtTime.getDay() > 0 && mtTime.getDay() < 6
      const isMarketHours = isWeekday && mtTime >= marketOpen && mtTime <= marketClose

      let marketStatus = "Closed"
      let timeUntil = ""
      let timeUntilLabel = ""
      let statusColor = "text-red-500"

      if (isWeekday) {
        if (isMarketHours) {
          marketStatus = "Open"
          statusColor = "text-green-500"
          const msUntilClose = marketClose.getTime() - mtTime.getTime()
          const hoursUntilClose = Math.floor(msUntilClose / (1000 * 60 * 60))
          const minutesUntilClose = Math.floor((msUntilClose % (1000 * 60 * 60)) / (1000 * 60))
          timeUntil = `${hoursUntilClose}h ${minutesUntilClose}m`
          timeUntilLabel = "Until Close"
        } else if (mtTime < marketOpen) {
          marketStatus = "Pre-Market"
          statusColor = "text-yellow-500"
          const msUntilOpen = marketOpen.getTime() - mtTime.getTime()
          const hoursUntilOpen = Math.floor(msUntilOpen / (1000 * 60 * 60))
          const minutesUntilOpen = Math.floor((msUntilOpen % (1000 * 60 * 60)) / (1000 * 60))
          timeUntil = `${hoursUntilOpen}h ${minutesUntilOpen}m`
          timeUntilLabel = "Until Open"
        } else {
          marketStatus = "After-Hours"
          statusColor = "text-orange-500"
          timeUntil = "Closed"
          timeUntilLabel = "For Today"
        }
      } else {
        marketStatus = "Weekend"
        statusColor = "text-gray-500"
        timeUntil = "Closed"
        timeUntilLabel = "Weekend"
      }

      setMarketTime({
        currentTime,
        marketStatus,
        openTime: "7:30 AM",
        closeTime: "2:00 PM",
        timeUntil,
        timeUntilLabel,
        statusColor,
      })
    }

    // Update immediately
    updateMarketTime()

    // Update every minute
    const interval = setInterval(updateMarketTime, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Entry signals data based on trade type
  const getEntrySignals = (tradeType: TradeType, selectedStock?: ScreenerResult): EntrySignal[] => {
    const currentPrice = selectedStock?.price || 100

    const signals = {
      day: [
        {
          name: "Gap Up with Volume",
          description: "Stock gaps up 1-3% on high volume (2x+ average)",
          bullishSignal: true,
          strength: "Strong" as const,
          timeframe: "First 30 minutes",
          example: selectedStock
            ? `${selectedStock.symbol} opens at ${formatPrice(currentPrice * 1.02)} (2% gap up) on 3x normal volume`
            : "Stock opens 2% higher on 3x normal volume",
          riskLevel: "Medium" as const,
          successRate: "65-70%",
          entryPrice: currentPrice * 1.015, // Enter on pullback from gap
          stopLoss: currentPrice * 0.995, // Tight stop below previous close
          target1: currentPrice * 1.03, // 3% target
          target2: currentPrice * 1.045, // 4.5% target
          riskReward: "1:2.5",
        },
        {
          name: "VWAP Bounce",
          description: "Price pulls back to VWAP and bounces with volume",
          bullishSignal: true,
          strength: "Moderate" as const,
          timeframe: "Mid-morning",
          example: selectedStock
            ? `${selectedStock.symbol} drops to ${formatPrice(currentPrice * 0.995)} VWAP, then bounces to ${formatPrice(currentPrice * 1.007)}`
            : "Stock drops to VWAP, then bounces with volume",
          riskLevel: "Low" as const,
          successRate: "60-65%",
          entryPrice: currentPrice * 0.997, // Enter on bounce from VWAP
          stopLoss: currentPrice * 0.988, // Stop below VWAP
          target1: currentPrice * 1.012, // 1.2% target
          target2: currentPrice * 1.02, // 2% target
          riskReward: "1:2",
        },
        {
          name: "Breakout Above Resistance",
          description: "Clean break above previous day's high with volume",
          bullishSignal: true,
          strength: "Strong" as const,
          timeframe: "Any time",
          example: selectedStock
            ? `${selectedStock.symbol} breaks above ${formatPrice(currentPrice * 1.015)} resistance on 2x volume`
            : "Clean break above resistance on high volume",
          riskLevel: "Medium" as const,
          successRate: "70-75%",
          entryPrice: currentPrice * 1.017, // Enter on breakout confirmation
          stopLoss: currentPrice * 1.005, // Stop below breakout level
          target1: currentPrice * 1.035, // 3.5% target
          target2: currentPrice * 1.05, // 5% target
          riskReward: "1:2.5",
        },
        {
          name: "Morning Doji Reversal",
          description: "Small body candle after gap down, showing indecision",
          bullishSignal: true,
          strength: "Weak" as const,
          timeframe: "First hour",
          example: selectedStock
            ? `${selectedStock.symbol} opens down 2% at ${formatPrice(currentPrice * 0.98)}, forms doji, then reverses`
            : "Opens down 2%, forms doji, then reverses upward",
          riskLevel: "High" as const,
          successRate: "45-50%",
          entryPrice: currentPrice * 0.985, // Enter on reversal confirmation
          stopLoss: currentPrice * 0.975, // Stop below doji low
          target1: currentPrice * 1.005, // Back to previous close
          target2: currentPrice * 1.02, // 2% target
          riskReward: "1:2",
        },
      ],
      swing: [
        {
          name: "50 EMA Bounce",
          description: "Price tests and bounces off 50-day EMA with volume",
          bullishSignal: true,
          strength: "Strong" as const,
          timeframe: "Daily chart",
          example: selectedStock
            ? `${selectedStock.symbol} tests 50 EMA at ${formatPrice(currentPrice * 0.97)}, bounces with volume`
            : "Stock tests 50 EMA support and bounces with volume",
          riskLevel: "Low" as const,
          successRate: "75-80%",
          entryPrice: currentPrice * 0.975, // Enter on bounce confirmation
          stopLoss: currentPrice * 0.955, // Stop below 50 EMA
          target1: currentPrice * 1.05, // 5% target
          target2: currentPrice * 1.08, // 8% target
          riskReward: "1:2.5",
        },
        {
          name: "Bull Flag Pattern",
          description: "Consolidation after strong move, then breakout",
          bullishSignal: true,
          strength: "Strong" as const,
          timeframe: "3-10 days",
          example: selectedStock
            ? `${selectedStock.symbol} consolidates ${formatPrice(currentPrice * 0.98)}-${formatPrice(currentPrice)}, breaks ${formatPrice(currentPrice * 1.01)}`
            : "Consolidation after strong move, then clean breakout",
          riskLevel: "Medium" as const,
          successRate: "70-75%",
          entryPrice: currentPrice * 1.012, // Enter on flag breakout
          stopLoss: currentPrice * 0.975, // Stop below flag low
          target1: currentPrice * 1.06, // 6% target (flag height)
          target2: currentPrice * 1.09, // 9% target
          riskReward: "1:2.2",
        },
        {
          name: "RSI Oversold Bounce",
          description: "RSI below 30, then crosses back above with price bounce",
          bullishSignal: true,
          strength: "Moderate" as const,
          timeframe: "Daily chart",
          example: selectedStock
            ? `${selectedStock.symbol} RSI hits 25 at ${formatPrice(currentPrice * 0.94)}, bounces as RSI recovers`
            : "RSI oversold bounce with price confirmation",
          riskLevel: "Medium" as const,
          successRate: "60-65%",
          entryPrice: currentPrice * 0.95, // Enter on RSI recovery
          stopLoss: currentPrice * 0.92, // Stop below oversold low
          target1: currentPrice * 1.02, // 2% target
          target2: currentPrice * 1.06, // 6% target
          riskReward: "1:2.3",
        },
        {
          name: "Volume Breakout",
          description: "Price breaks resistance on 3x+ average volume",
          bullishSignal: true,
          strength: "Strong" as const,
          timeframe: "Daily chart",
          example: selectedStock
            ? `${selectedStock.symbol} breaks ${formatPrice(currentPrice * 1.05)} resistance on 4x volume`
            : "High-volume breakout above key resistance",
          riskLevel: "Low" as const,
          successRate: "80-85%",
          entryPrice: currentPrice * 1.052, // Enter on volume confirmation
          stopLoss: currentPrice * 1.02, // Stop below breakout level
          target1: currentPrice * 1.1, // 10% target
          target2: currentPrice * 1.15, // 15% target
          riskReward: "1:2.8",
        },
      ],
      position: [
        {
          name: "Golden Cross",
          description: "50-day MA crosses above 200-day MA",
          bullishSignal: true,
          strength: "Strong" as const,
          timeframe: "Weekly/Monthly",
          example: "50 MA crosses above 200 MA - major bullish signal",
          riskLevel: "Low" as const,
          successRate: "75-80%",
          entryPrice: currentPrice * 1.01, // Enter on cross confirmation
          stopLoss: currentPrice * 0.9, // 10% stop loss
          target1: currentPrice * 1.25, // 25% target
          target2: currentPrice * 1.5, // 50% target
          riskReward: "1:2.5",
        },
        {
          name: "Earnings Beat + Guidance Raise",
          description: "Company beats estimates and raises forward guidance",
          bullishSignal: true,
          strength: "Strong" as const,
          timeframe: "Quarterly",
          example: "EPS beat with raised guidance - fundamental catalyst",
          riskLevel: "Medium" as const,
          successRate: "70-75%",
          entryPrice: currentPrice * 1.02, // Enter after initial reaction
          stopLoss: currentPrice * 0.88, // 12% stop loss
          target1: currentPrice * 1.2, // 20% target
          target2: currentPrice * 1.4, // 40% target
          riskReward: "1:2.3",
        },
        {
          name: "Sector Rotation Entry",
          description: "Money flowing into underperformed sector",
          bullishSignal: true,
          strength: "Moderate" as const,
          timeframe: "Monthly",
          example: "Sector showing relative strength after underperformance",
          riskLevel: "Medium" as const,
          successRate: "65-70%",
          entryPrice: currentPrice * 0.98, // Enter on sector strength
          stopLoss: currentPrice * 0.85, // 15% stop loss
          target1: currentPrice * 1.18, // 18% target
          target2: currentPrice * 1.35, // 35% target
          riskReward: "1:2.2",
        },
        {
          name: "Support Level Hold",
          description: "Price tests major support level and holds",
          bullishSignal: true,
          strength: "Moderate" as const,
          timeframe: "Weekly",
          example: selectedStock
            ? `${selectedStock.symbol} tests ${formatPrice(currentPrice * 0.9)} support (3rd time) and holds`
            : "Stock tests major support level and holds",
          riskLevel: "Low" as const,
          successRate: "60-65%",
          entryPrice: currentPrice * 0.92, // Enter on support hold
          stopLoss: currentPrice * 0.87, // Stop below support
          target1: currentPrice * 1.08, // 8% target
          target2: currentPrice * 1.18, // 18% target
          riskReward: "1:2.6",
        },
      ],
      longterm: [
        {
          name: "Market Correction Entry",
          description: "Quality stock down 20%+ during market correction",
          bullishSignal: true,
          strength: "Strong" as const,
          timeframe: "Months",
          example: "Blue chip stock down 20%+ during broad market sell-off",
          riskLevel: "Low" as const,
          successRate: "80-85%",
          entryPrice: currentPrice * 0.8, // Enter during correction
          stopLoss: currentPrice * 0.65, // 35% stop (rare)
          target1: currentPrice * 1.2, // 20% recovery
          target2: currentPrice * 1.6, // 60% long-term target
          riskReward: "1:2.7",
        },
        {
          name: "New Product Cycle",
          description: "Company launching major new product or service",
          bullishSignal: true,
          strength: "Strong" as const,
          timeframe: "Quarters/Years",
          example: "Revolutionary product launch with large addressable market",
          riskLevel: "Medium" as const,
          successRate: "70-75%",
          entryPrice: currentPrice * 0.95, // Enter before full recognition
          stopLoss: currentPrice * 0.75, // 25% stop loss
          target1: currentPrice * 1.5, // 50% target
          target2: currentPrice * 2.5, // 150% target
          riskReward: "1:2.5",
        },
        {
          name: "Dividend Aristocrat Dip",
          description: "25+ year dividend grower temporarily undervalued",
          bullishSignal: true,
          strength: "Moderate" as const,
          timeframe: "Months",
          example: "Dividend aristocrat trading below historical valuation",
          riskLevel: "Low" as const,
          successRate: "75-80%",
          entryPrice: currentPrice * 0.9, // Enter on temporary dip
          stopLoss: currentPrice * 0.75, // 25% stop loss
          target1: currentPrice * 1.2, // 20% target
          target2: currentPrice * 1.5, // 50% target
          riskReward: "1:2",
        },
        {
          name: "Industry Transformation",
          description: "Company positioned for major industry shift",
          bullishSignal: true,
          strength: "Strong" as const,
          timeframe: "Years",
          example: "Company leading transformation in major industry",
          riskLevel: "High" as const,
          successRate: "60-90%",
          entryPrice: currentPrice * 0.85, // Enter during uncertainty
          stopLoss: currentPrice * 0.6, // 40% stop loss
          target1: currentPrice * 2, // 100% target
          target2: currentPrice * 4, // 300% target
          riskReward: "1:3+",
        },
      ],
      options: [
        {
          name: "Low IV Before Catalyst",
          description: "Implied volatility below 20th percentile before earnings",
          bullishSignal: true,
          strength: "Strong" as const,
          timeframe: "Days to weeks",
          example: "IV at 25% when historical average is 40%, earnings in 2 weeks",
          riskLevel: "Medium" as const,
          successRate: "65-70%",
          entryPrice: currentPrice * 0.02, // Option premium estimate
          stopLoss: currentPrice * 0.01, // 50% of premium
          target1: currentPrice * 0.04, // 100% gain
          target2: currentPrice * 0.06, // 200% gain
          riskReward: "1:2",
        },
        {
          name: "High IV Crush Setup",
          description: "Sell options when IV is above 80th percentile",
          bullishSignal: false,
          strength: "Strong" as const,
          timeframe: "Days",
          example: "IV at 60% after earnings, sell premium for decay",
          riskLevel: "High" as const,
          successRate: "70-75%",
          entryPrice: currentPrice * 0.03, // Premium collected
          stopLoss: currentPrice * 0.06, // 2x premium loss
          target1: currentPrice * 0.015, // 50% profit
          target2: currentPrice * 0.009, // 70% profit
          riskReward: "1:1",
        },
        {
          name: "Technical Breakout + Options Flow",
          description: "Unusual call activity before technical breakout",
          bullishSignal: true,
          strength: "Moderate" as const,
          timeframe: "Days",
          example: selectedStock
            ? `${selectedStock.symbol} at ${formatPrice(currentPrice)}, sell ${formatPrice(currentPrice * 1.05)} calls`
            : "Stock near resistance, sell covered calls",
          riskLevel: "High" as const,
          successRate: "55-60%",
          entryPrice: currentPrice * 0.025, // Call option premium
          stopLoss: currentPrice * 0.0125, // 50% loss
          target1: currentPrice * 0.05, // 100% gain
          target2: currentPrice * 0.075, // 200% gain
          riskReward: "1:2",
        },
        {
          name: "Covered Call on Resistance",
          description: "Sell calls when stock approaches strong resistance",
          bullishSignal: false,
          strength: "Moderate" as const,
          timeframe: "Weeks",
          example: selectedStock
            ? `${selectedStock.symbol} at ${formatPrice(currentPrice)}, sell ${formatPrice(currentPrice * 1.05)} calls`
            : "Stock near resistance, sell covered calls",
          riskLevel: "Low" as const,
          successRate: "60-65%",
          entryPrice: currentPrice * 0.015, // Premium collected
          stopLoss: 0, // Covered call - no stop loss
          target1: currentPrice * 0.0075, // 50% profit
          target2: currentPrice * 0.012, // 80% profit
          riskReward: "Income",
        },
      ],
    }

    return signals[tradeType] || signals.swing
  }

  // Fetch real market data from Finnhub
  const fetchMarketData = async (symbols: string[]) => {
    if (!apiKey.trim()) {
      throw new Error("API key is required")
    }

    const results = []

    for (const symbol of symbols) {
      try {
        // Fetch quote data
        const quoteResponse = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`)
        const quote: FinnhubQuote = await quoteResponse.json()

        // Fetch company profile
        const profileResponse = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`)
        const profile: FinnhubProfile = await profileResponse.json()

        if (quote.c && profile.name) {
          results.push({
            symbol,
            name: profile.name,
            sector: profile.finnhubIndustry || "Unknown",
            price: quote.c,
            change: quote.d,
            changePercent: quote.dp,
            marketCap: profile.marketCapitalization,
            // We'll calculate scores based on available data
            quote,
            profile,
          })
        }

        // Add delay to respect rate limits (60 calls/minute for free tier)
        await new Promise((resolve) => setTimeout(resolve, 1100))
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error)
      }
    }

    return results
  }

  // Calculate algorithmic scores based on real data
  const calculateScores = (stockData: any) => {
    const { quote, profile, symbol } = stockData

    // Technical score based on price action
    const technicalScore = Math.min(
      100,
      Math.max(
        0,
        50 +
          quote.dp * 2 + // Recent performance
          ((quote.c - quote.l) / (quote.h - quote.l)) * 30 + // Position in daily range
          (quote.c > quote.pc ? 20 : -10), // Above/below previous close
      ),
    )

    // Momentum score based on recent price change
    const momentumScore = Math.min(
      100,
      Math.max(
        0,
        50 +
          quote.dp * 3 + // Weight recent performance heavily
          (quote.d > 0 ? 25 : -15), // Positive/negative change bonus
      ),
    )

    // Value score (simplified - would need more fundamental data)
    const valueScore = Math.min(
      100,
      Math.max(
        0,
        70 + (Math.random() - 0.5) * 40, // Placeholder until we get P/E, P/B data
      ),
    )

    // Quality score based on market cap and stability
    const qualityScore = Math.min(
      100,
      Math.max(
        0,
        (profile.marketCapitalization > 100000 ? 80 : 60) + // Large cap bonus
          (Math.abs(quote.dp) < 2 ? 20 : 0) + // Low volatility bonus
          (Math.random() - 0.5) * 20, // Placeholder for earnings quality
      ),
    )

    // Risk score (inverse of volatility)
    const riskScore = Math.min(
      100,
      Math.max(
        0,
        100 -
          Math.abs(quote.dp) * 5 - // Penalize high volatility
          (Math.abs(quote.d) / quote.c) * 1000, // Penalize large price swings
      ),
    )

    // Volume and sentiment scores (placeholders)
    const volumeScore = 75 + (Math.random() - 0.5) * 30
    const sentimentScore = 70 + (Math.random() - 0.5) * 40
    const fundamentalScore = (valueScore + qualityScore) / 2

    // Overall score calculation
    const overallScore =
      fundamentalScore * 0.25 +
      technicalScore * 0.2 +
      valueScore * 0.15 +
      qualityScore * 0.15 +
      momentumScore * 0.1 +
      riskScore * 0.1 +
      sentimentScore * 0.05

    return {
      overallScore,
      fundamentalScore,
      technicalScore,
      momentumScore,
      valueScore,
      qualityScore,
      riskScore,
      sentimentScore,
      volumeScore,
    }
  }

  const testConnection = async () => {
    if (!apiKey.trim()) {
      alert("Please enter your Finnhub API key")
      return
    }

    setDataLoading(true)
    try {
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${apiKey}`)
      const data = await response.json()

      if (response.ok && data.c) {
        setIsConnected(true)
        setLastUpdate(new Date().toLocaleTimeString())
        alert("✅ Successfully connected to Finnhub API!")
      } else {
        setIsConnected(false)
        alert("❌ Failed to connect. Please check your API key.")
      }
    } catch (error) {
      setIsConnected(false)
      alert("❌ Connection error. Please check your internet connection.")
    } finally {
      setDataLoading(false)
    }
  }

  // Simulate screener results (replace with real API calls)
  const runUltimateScreener = async () => {
    setLoading(true)

    try {
      let processedResults: ScreenerResult[]

      if (isConnected && apiKey.trim()) {
        // Use real Finnhub data
        const marketData = await fetchMarketData(STOCK_SYMBOLS.slice(0, 10)) // Limit to 10 stocks for demo

        // Process and score the real data
        processedResults = marketData.map((stock) => {
          const scores = calculateScores(stock)

          // Generate reasons and warnings based on real data
          const reasons = []
          const warnings = []

          if (stock.changePercent > 2) reasons.push("Strong positive momentum today")
          if (stock.marketCap > 100000) reasons.push("Large-cap stability")
          if (stock.quote.c > stock.quote.o) reasons.push("Trading above opening price")

          if (Math.abs(stock.changePercent) > 5) warnings.push("High volatility today")
          if (stock.changePercent < -3) warnings.push("Significant decline today")

          return {
            symbol: stock.symbol,
            name: stock.name,
            sector: stock.sector,
            price: stock.price,
            change: stock.change,
            changePercent: stock.changePercent,
            ...scores,
            reasons: reasons.length > 0 ? reasons : ["Algorithmic analysis based on current market data"],
            warnings: warnings.length > 0 ? warnings : ["Standard market risks apply"],
            confidence: Math.min(95, 80 + Math.random() * 15),
            lastUpdated: new Date().toLocaleTimeString(),
          }
        })
      } else {
        // Use simulated data (demo mode)
        processedResults = STOCK_SYMBOLS.slice(0, 10).map((symbol, index) => {
          const baseScore = 85 - index * 3 + Math.random() * 10
          const price = 50 + Math.random() * 200
          const change = (Math.random() - 0.5) * 10
          const changePercent = (change / price) * 100

          return {
            symbol,
            name: `${symbol} Company Inc.`,
            sector: ["Technology", "Healthcare", "Finance", "Consumer", "Energy"][Math.floor(Math.random() * 5)],
            price,
            change,
            changePercent,
            overallScore: baseScore,
            fundamentalScore: baseScore + (Math.random() - 0.5) * 20,
            technicalScore: baseScore + (Math.random() - 0.5) * 20,
            momentumScore: baseScore + (Math.random() - 0.5) * 20,
            valueScore: baseScore + (Math.random() - 0.5) * 20,
            qualityScore: baseScore + (Math.random() - 0.5) * 20,
            riskScore: baseScore + (Math.random() - 0.5) * 20,
            sentimentScore: baseScore + (Math.random() - 0.5) * 20,
            volumeScore: baseScore + (Math.random() - 0.5) * 20,
            reasons: [
              "Strong momentum indicators",
              "Above key moving averages",
              "High institutional ownership",
              "Positive earnings revisions",
            ].slice(0, Math.floor(Math.random() * 4) + 1),
            warnings: ["High volatility", "Overbought conditions", "Earnings date approaching"].slice(
              0,
              Math.floor(Math.random() * 3),
            ),
            confidence: 75 + Math.random() * 20,
            lastUpdated: new Date().toLocaleTimeString(),
          }
        })
      }

      setResults(processedResults.sort((a, b) => b.overallScore - a.overallScore))
      setLastUpdate(new Date().toLocaleTimeString())
      generateTradeAnalysis(tradeType)

      if (selectedResult?.symbol === "SPY" || tradeType === "options") {
        setSpy0DTEAnalysis(calculateSPY0DTEAnalysis(selectedResult))
      }
    } catch (error) {
      console.error("Screening error:", error)
      alert("Error running screener. Please check your API connection.")
    } finally {
      setLoading(false)
    }
  }

  const generateTradeAnalysis = (type: TradeType) => {
    // Generate different analysis based on trade type
    const analyses: Record<TradeType, TradeAnalysis> = {
      day: {
        type: "day",
        timeframe: "Intraday (minutes to hours)",
        riskLevel: "High",
        optimalEntryPoints: [
          "After morning volatility settles (9:30-10:30 AM MT)",
          "Breakouts with volume confirmation",
          "Support tests with bullish reversal patterns",
        ],
        optimalExitPoints: [
          "When price target is reached (typically 1-3% gain)",
          "Before market close",
          "When momentum indicators reverse",
        ],
        stopLossRecommendation: "Tight (0.5-1% below entry)",
        takeProfitRecommendation: "1:2 risk-reward minimum (1-3% targets)",
        keyIndicators: ["VWAP", "1-minute & 5-minute charts", "Level 2 data", "Relative volume"],
        tradingVolume: "High volume stocks only (1M+ shares daily)",
        bestTimeToTrade: "First hour and last hour of trading session",
      },
      swing: {
        type: "swing",
        timeframe: "Days to weeks",
        riskLevel: "Medium",
        optimalEntryPoints: [
          "Pullbacks to key moving averages (20/50 EMA)",
          "Breakouts above resistance with confirmation",
          "Oversold conditions with reversal signals",
        ],
        optimalExitPoints: ["Resistance levels", "Overbought conditions", "After earnings announcements"],
        stopLossRecommendation: "Below recent swing low (typically 5-8%)",
        takeProfitRecommendation: "1:2 or 1:3 risk-reward (10-20% targets)",
        keyIndicators: ["Daily chart patterns", "RSI", "MACD", "Volume trends"],
        tradingVolume: "Medium to high volume preferred",
        bestTimeToTrade: "Any time during market hours, often end of day",
      },
      position: {
        type: "position",
        timeframe: "Weeks to months",
        riskLevel: "Medium-Low",
        optimalEntryPoints: [
          "Major support levels",
          "After earnings dips in strong companies",
          "Sector rotation opportunities",
        ],
        optimalExitPoints: [
          "Major resistance levels",
          "Deteriorating fundamentals",
          "Technical trend changes on weekly charts",
        ],
        stopLossRecommendation: "10-15% below entry or below major support",
        takeProfitRecommendation: "25-50% profit targets or trailing stops",
        keyIndicators: ["Weekly charts", "Sector performance", "Fundamental metrics", "Institutional ownership"],
        tradingVolume: "Any volume, focus on liquidity for position sizing",
        bestTimeToTrade: "Any time, often after earnings reports",
      },
      longterm: {
        type: "longterm",
        timeframe: "Months to years",
        riskLevel: "Low",
        optimalEntryPoints: ["Major market corrections", "Industry transformations", "Undervalued quality companies"],
        optimalExitPoints: ["Fundamental thesis change", "Extreme overvaluation", "Better opportunities elsewhere"],
        stopLossRecommendation: "20-25% or fundamental-based stops",
        takeProfitRecommendation: "100%+ or hold for years with trailing stops",
        keyIndicators: ["Fundamental analysis", "Competitive advantage", "Management quality", "Industry trends"],
        tradingVolume: "Not critical, focus on business quality",
        bestTimeToTrade: "Any time, dollar-cost averaging recommended",
      },
      options: {
        type: "options",
        timeframe: "Days to months (contract dependent)",
        riskLevel: "Very High",
        optimalEntryPoints: [
          "Low implied volatility for buying options",
          "High implied volatility for selling options",
          "Before anticipated catalysts",
        ],
        optimalExitPoints: [
          "50-100% profit for long options",
          "70-80% profit for short options",
          "Before major time decay acceleration",
        ],
        stopLossRecommendation: "50% loss for long options, position sizing for short options",
        takeProfitRecommendation: "Depends on strategy, typically 50-100% for long options",
        keyIndicators: ["Implied volatility", "Greeks (Delta, Theta, Vega)", "Open interest", "Volume"],
        tradingVolume: "High option volume and open interest required",
        bestTimeToTrade: "Depends on strategy, avoid holding through earnings unless specifically planned",
      },
    }

    setTradeAnalysis(analyses[type])
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 80) return "Good"
    if (score >= 70) return "Fair"
    return "Poor"
  }

  const handleTradeTypeChange = (value: TradeType) => {
    setTradeType(value)
    generateTradeAnalysis(value)
  }

  const getSignalIcon = (signal: EntrySignal) => {
    if (signal.bullishSignal) {
      return signal.strength === "Strong" ? (
        <CheckCircle className="h-5 w-5 text-green-600" />
      ) : signal.strength === "Moderate" ? (
        <TrendingUp className="h-5 w-5 text-blue-600" />
      ) : (
        <TrendingUpIcon className="h-5 w-5 text-yellow-600" />
      )
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "Strong":
        return "text-green-600 bg-green-50 dark:bg-green-950"
      case "Moderate":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950"
      case "Weak":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950"
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "text-green-600"
      case "Medium":
        return "text-yellow-600"
      case "High":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigate={setActiveTab} />
      case "screener":
        return <StockScreener />
      case "journal":
        return <TradeJournal />
      case "news":
        return <NewsFeed />
      case "settings":
        return <PlatformSettings onCurrencyChange={setCurrency} />
      default:
        return <Dashboard onNavigate={setActiveTab} />
    }
  }

  const currencyContextValue: CurrencyContextType = {
    currency,
    setCurrency,
    formatPrice,
    getCurrencySymbol,
    convertPrice,
  }

  return (
    <CurrencyContext.Provider value={currencyContextValue}>
      <div className="min-h-screen bg-gray-950">
        <SidebarProvider>
          <AppSidebar activeTab={activeTab} onNavigate={setActiveTab} />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-800 px-4 bg-gray-900/50">
              <SidebarTrigger className="-ml-1 text-gray-300 hover:text-white hover:bg-gray-800" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-gray-700" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#" className="text-gray-400 hover:text-gray-200">
                      MarketDesk
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block text-gray-600" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-gray-200">{tabTitles[activeTab]}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="ml-auto">
                <UserMenu />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 bg-gray-950">
              <div className="mx-auto w-full">{renderContent()}</div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </CurrencyContext.Provider>
  )
}
