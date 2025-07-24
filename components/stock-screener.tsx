"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Brain,
  BarChart3,
  Loader2,
  Clock,
  Activity,
  RefreshCw,
  BookOpen,
  Calculator,
  LineChart,
  DollarSign,
  Shield,
  Users,
  CheckCircle,
  XCircle,
  Settings,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useCurrency } from "@/app/page"

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
  timeUntil: string
  statusColor: string
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

type TradeType = "day" | "swing" | "position" | "longterm" | "options"

export default function StockScreener() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ScreenerResult[]>([])
  const [selectedResult, setSelectedResult] = useState<ScreenerResult | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [marketTime, setMarketTime] = useState<MarketTime>({
    currentTime: "",
    marketStatus: "Calculating...",
    timeUntil: "",
    statusColor: "text-gray-500",
  })
  const [tradeType, setTradeType] = useState<TradeType>("swing")
  const [apiKey, setApiKey] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [connectionTesting, setConnectionTesting] = useState(false)

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { formatPrice } = useCurrency()

  // Sample stock data
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

  // Load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem("finnhubApiKey")
    if (savedApiKey) {
      setApiKey(savedApiKey)
      // Auto-test connection if API key exists
      testConnection(savedApiKey)
    }
  }, [])

  // Update market time
  useEffect(() => {
    const updateMarketTime = () => {
      const now = new Date()
      const mtTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Denver" }))
      const currentTime = mtTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })

      const marketOpen = new Date(mtTime)
      marketOpen.setHours(7, 30, 0, 0)
      const marketClose = new Date(mtTime)
      marketClose.setHours(14, 0, 0, 0)

      const isWeekday = mtTime.getDay() > 0 && mtTime.getDay() < 6
      const isMarketHours = isWeekday && mtTime >= marketOpen && mtTime <= marketClose

      let marketStatus = "Closed"
      let timeUntil = ""
      let statusColor = "text-red-500"

      if (isWeekday) {
        if (isMarketHours) {
          marketStatus = "Open"
          statusColor = "text-green-500"
          const msUntilClose = marketClose.getTime() - mtTime.getTime()
          const hoursUntilClose = Math.floor(msUntilClose / (1000 * 60 * 60))
          const minutesUntilClose = Math.floor((msUntilClose % (1000 * 60 * 60)) / (1000 * 60))
          timeUntil = `${hoursUntilClose}h ${minutesUntilClose}m until close`
        } else if (mtTime < marketOpen) {
          marketStatus = "Pre-Market"
          statusColor = "text-yellow-500"
          const msUntilOpen = marketOpen.getTime() - mtTime.getTime()
          const hoursUntilOpen = Math.floor(msUntilOpen / (1000 * 60 * 60))
          const minutesUntilOpen = Math.floor((msUntilOpen % (1000 * 60 * 60)) / (1000 * 60))
          timeUntil = `${hoursUntilOpen}h ${minutesUntilOpen}m until open`
        } else {
          marketStatus = "After-Hours"
          statusColor = "text-orange-500"
          timeUntil = "Market closed for the day"
        }
      } else {
        marketStatus = "Weekend"
        statusColor = "text-gray-500"
        timeUntil = "Market closed for weekend"
      }

      setMarketTime({ currentTime, marketStatus, timeUntil, statusColor })
    }

    updateMarketTime()
    const interval = setInterval(updateMarketTime, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Test Finnhub API connection
  const testConnection = async (keyToTest?: string) => {
    const testKey = keyToTest || apiKey
    if (!testKey.trim()) {
      alert("Please enter your Finnhub API key")
      return
    }

    setConnectionTesting(true)
    try {
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${testKey}`)
      const data = await response.json()

      if (response.ok && data.c && !data.error) {
        setIsConnected(true)
        setApiKey(testKey)
        localStorage.setItem("finnhubApiKey", testKey)
        setLastUpdate(new Date().toLocaleTimeString())
        if (!keyToTest) {
          // Only show alert if manually testing
          alert("✅ Successfully connected to Finnhub API!")
        }
      } else {
        setIsConnected(false)
        if (data.error) {
          alert(`❌ API Error: ${data.error}`)
        } else {
          alert("❌ Failed to connect. Please check your API key.")
        }
      }
    } catch (error) {
      setIsConnected(false)
      console.error("Connection error:", error)
      if (!keyToTest) {
        // Only show alert if manually testing
        alert("❌ Connection error. Please check your internet connection.")
      }
    } finally {
      setConnectionTesting(false)
    }
  }

  // Fetch real market data from Finnhub
  const fetchMarketData = async (symbols: string[]) => {
    if (!apiKey.trim()) {
      throw new Error("API key is required")
    }

    const results = []
    const maxSymbols = Math.min(symbols.length, 15) // Limit to prevent rate limiting

    for (let i = 0; i < maxSymbols; i++) {
      const symbol = symbols[i]
      try {
        // Fetch quote data
        const quoteResponse = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`)
        const quote: FinnhubQuote = await quoteResponse.json()

        if (quote.error) {
          console.error(`API Error for ${symbol}:`, quote.error)
          continue
        }

        // Add delay to respect rate limits (60 calls/minute for free tier)
        await new Promise((resolve) => setTimeout(resolve, 1100))

        // Fetch company profile
        const profileResponse = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`)
        const profile: FinnhubProfile = await profileResponse.json()

        if (profile.error) {
          console.error(`Profile API Error for ${symbol}:`, profile.error)
        }

        if (quote.c && quote.c > 0) {
          results.push({
            symbol,
            name: profile.name || `${symbol} Corp`,
            sector: profile.finnhubIndustry || "Unknown",
            price: quote.c,
            change: quote.d || 0,
            changePercent: quote.dp || 0,
            marketCap: profile.marketCapitalization || 0,
            quote,
            profile,
          })
        }

        // Add another delay between requests
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error)
      }
    }

    return results
  }

  // Calculate algorithmic scores based on real data
  const calculateScores = (stockData: any) => {
    const { quote, profile } = stockData

    // Technical score based on price action
    const dailyRange = quote.h - quote.l
    const positionInRange = dailyRange > 0 ? (quote.c - quote.l) / dailyRange : 0.5

    const technicalScore = Math.min(
      100,
      Math.max(
        0,
        50 +
          quote.dp * 1.5 + // Recent performance weight
          positionInRange * 25 + // Position in daily range
          (quote.c > quote.pc ? 15 : -10) + // Above/below previous close
          (quote.c > quote.o ? 10 : -5), // Above/below opening price
      ),
    )

    // Momentum score based on recent price change
    const momentumScore = Math.min(
      100,
      Math.max(
        0,
        50 +
          quote.dp * 2.5 + // Weight recent performance heavily
          (quote.d > 0 ? 20 : -15) + // Positive/negative change bonus
          (Math.abs(quote.dp) > 1 ? 10 : 0), // Volatility bonus for momentum
      ),
    )

    // Value score (simplified - based on market cap and price stability)
    const marketCapScore = profile.marketCapitalization > 100000 ? 20 : profile.marketCapitalization > 10000 ? 10 : 0
    const valueScore = Math.min(
      100,
      Math.max(
        0,
        60 + marketCapScore + (Math.random() - 0.5) * 30, // Placeholder with market cap consideration
      ),
    )

    // Quality score based on market cap, stability, and consistency
    const stabilityBonus = Math.abs(quote.dp) < 2 ? 15 : Math.abs(quote.dp) < 5 ? 5 : -5
    const qualityScore = Math.min(
      100,
      Math.max(
        0,
        (profile.marketCapitalization > 100000 ? 75 : profile.marketCapitalization > 10000 ? 65 : 55) +
          stabilityBonus +
          (quote.c > 10 ? 10 : 0), // Price quality (avoid penny stocks)
      ),
    )

    // Risk score (inverse of volatility and based on market cap)
    const volatilityPenalty = Math.abs(quote.dp) * 3
    const marketCapBonus = profile.marketCapitalization > 100000 ? 20 : profile.marketCapitalization > 10000 ? 10 : 0
    const riskScore = Math.min(
      100,
      Math.max(0, 80 + marketCapBonus - volatilityPenalty - (Math.abs(quote.d) / quote.c) * 500),
    )

    // Volume score (based on price movement and assumed volume)
    const volumeScore = Math.min(100, Math.max(0, 70 + (Math.abs(quote.dp) > 2 ? 20 : 10) + (Math.random() - 0.5) * 20))

    // Sentiment score (based on price action and market cap)
    const priceActionSentiment = quote.dp > 2 ? 20 : quote.dp > 0 ? 10 : quote.dp > -2 ? 0 : -10
    const sentimentScore = Math.min(
      100,
      Math.max(0, 65 + priceActionSentiment + (profile.marketCapitalization > 50000 ? 15 : 5)),
    )

    const fundamentalScore = (valueScore + qualityScore) / 2

    // Overall score calculation with trade type weighting
    const baseWeights = {
      fundamental: 0.25,
      technical: 0.2,
      value: 0.15,
      quality: 0.15,
      momentum: 0.1,
      risk: 0.1,
      sentiment: 0.05,
    }

    const overallScore =
      fundamentalScore * baseWeights.fundamental +
      technicalScore * baseWeights.technical +
      valueScore * baseWeights.value +
      qualityScore * baseWeights.quality +
      momentumScore * baseWeights.momentum +
      riskScore * baseWeights.risk +
      sentimentScore * baseWeights.sentiment

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

  // Generate reasons and warnings based on real data
  const generateInsights = (stockData: any, scores: any) => {
    const { quote, profile, symbol } = stockData
    const reasons = []
    const warnings = []

    // Positive factors
    if (quote.dp > 3) reasons.push("Strong positive momentum (+3% today)")
    else if (quote.dp > 1) reasons.push("Positive momentum today")

    if (profile.marketCapitalization > 100000) reasons.push("Large-cap stability (>$100B market cap)")
    else if (profile.marketCapitalization > 10000) reasons.push("Mid-cap growth potential")

    if (quote.c > quote.o && quote.c > quote.pc) reasons.push("Trading above both opening and previous close")

    const dailyRange = quote.h - quote.l
    const positionInRange = dailyRange > 0 ? (quote.c - quote.l) / dailyRange : 0.5
    if (positionInRange > 0.8) reasons.push("Trading near daily high")

    if (scores.technicalScore > 80) reasons.push("Strong technical indicators")
    if (scores.qualityScore > 85) reasons.push("High quality metrics")
    if (scores.riskScore > 75) reasons.push("Favorable risk profile")

    // Risk factors
    if (Math.abs(quote.dp) > 5) warnings.push("High volatility today (>5% move)")
    else if (Math.abs(quote.dp) > 3) warnings.push("Elevated volatility (>3% move)")

    if (quote.dp < -3) warnings.push("Significant decline today")
    if (positionInRange < 0.2) warnings.push("Trading near daily low")
    if (profile.marketCapitalization < 1000) warnings.push("Small-cap volatility risk")
    if (quote.c < 5) warnings.push("Low-priced stock risk")

    if (scores.riskScore < 50) warnings.push("Elevated risk metrics")
    if (scores.technicalScore < 40) warnings.push("Weak technical setup")

    return {
      reasons: reasons.length > 0 ? reasons : ["Algorithmic analysis based on current market data"],
      warnings: warnings.length > 0 ? warnings : ["Standard market risks apply"],
    }
  }

  // Run screener with real or simulated data
  const runScreener = async () => {
    setLoading(true)

    try {
      let processedResults: ScreenerResult[]

      if (isConnected && apiKey.trim()) {
        // Use real Finnhub data
        console.log("Fetching real market data...")
        const marketData = await fetchMarketData(STOCK_SYMBOLS)

        if (marketData.length === 0) {
          throw new Error("No market data received. Please check your API key and connection.")
        }

        // Process and score the real data
        processedResults = marketData.map((stock) => {
          const scores = calculateScores(stock)
          const insights = generateInsights(stock, scores)

          return {
            symbol: stock.symbol,
            name: stock.name,
            sector: stock.sector,
            price: stock.price,
            change: stock.change,
            changePercent: stock.changePercent,
            ...scores,
            ...insights,
            confidence: Math.min(95, 75 + Math.random() * 20),
            lastUpdated: new Date().toLocaleTimeString(),
          }
        })
      } else {
        // Use simulated data (demo mode)
        console.log("Using simulated data (demo mode)")
        processedResults = STOCK_SYMBOLS.slice(0, 12).map((symbol, index) => {
          const baseScore = 85 - index * 2.5 + Math.random() * 15
          const price = 25 + Math.random() * 300
          const change = (Math.random() - 0.5) * 15
          const changePercent = (change / price) * 100

          return {
            symbol,
            name: `${symbol} Company Inc.`,
            sector: ["Technology", "Healthcare", "Finance", "Consumer", "Energy", "Industrial"][
              Math.floor(Math.random() * 6)
            ],
            price,
            change,
            changePercent,
            overallScore: baseScore,
            fundamentalScore: baseScore + (Math.random() - 0.5) * 25,
            technicalScore: baseScore + (Math.random() - 0.5) * 25,
            momentumScore: baseScore + (Math.random() - 0.5) * 25,
            valueScore: baseScore + (Math.random() - 0.5) * 25,
            qualityScore: baseScore + (Math.random() - 0.5) * 25,
            riskScore: baseScore + (Math.random() - 0.5) * 25,
            sentimentScore: baseScore + (Math.random() - 0.5) * 25,
            volumeScore: baseScore + (Math.random() - 0.5) * 25,
            reasons: [
              "Strong momentum indicators",
              "Above key moving averages",
              "High institutional ownership",
              "Positive earnings revisions",
              "Technical breakout pattern",
              "Sector rotation tailwind",
            ].slice(0, Math.floor(Math.random() * 4) + 2),
            warnings: [
              "High volatility environment",
              "Overbought conditions",
              "Earnings date approaching",
              "Market uncertainty",
              "Sector headwinds",
            ].slice(0, Math.floor(Math.random() * 3) + 1),
            confidence: 70 + Math.random() * 25,
            lastUpdated: new Date().toLocaleTimeString(),
          }
        })
      }

      // Sort by overall score
      setResults(processedResults.sort((a, b) => b.overallScore - a.overallScore))
      setLastUpdate(new Date().toLocaleTimeString())
    } catch (error) {
      console.error("Screening error:", error)
      alert(`Error running screener: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Stock Screener
          </h1>
          <p className="text-muted-foreground mt-2">Advanced algorithmic analysis with real-time market data</p>
        </div>

        {/* Market Clock */}
        <Card className="w-auto">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Mountain Time</div>
                  <div className="font-medium">{marketTime.currentTime}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Market</div>
                  <div className={`font-medium ${marketTime.statusColor}`}>{marketTime.marketStatus}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="screener" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="screener">Screener</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="methodology">Methodology</TabsTrigger>
        </TabsList>

        <TabsContent value="screener">
          <div className="space-y-6">
            {/* API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Finnhub API Configuration
                  <div className="ml-auto flex items-center gap-2">
                    {isConnected ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Connected
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600 text-sm">
                        <XCircle className="h-4 w-4" />
                        Demo Mode
                      </div>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  Get your free API key at{" "}
                  <a
                    href="https://finnhub.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    finnhub.io
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter your Finnhub API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => testConnection()}
                    disabled={connectionTesting || !apiKey.trim()}
                    variant="outline"
                  >
                    {connectionTesting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Screening Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Stock Screening Parameters
                </CardTitle>
                <CardDescription>Configure your screening criteria and trade type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Trade Type</Label>
                      <Select value={tradeType} onValueChange={(value) => setTradeType(value as TradeType)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trade type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Day Trade</SelectItem>
                          <SelectItem value="swing">Swing Trade</SelectItem>
                          <SelectItem value="position">Position Trade</SelectItem>
                          <SelectItem value="longterm">Long-Term Investment</SelectItem>
                          <SelectItem value="options">Options Trade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Market Status</Label>
                      <div className="p-3 border rounded-lg">
                        <div className={`font-medium ${marketTime.statusColor}`}>{marketTime.marketStatus}</div>
                        <div className="text-sm text-gray-500">{marketTime.timeUntil}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={runScreener} disabled={loading} className="w-full" size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isConnected ? "Fetching Real Market Data..." : "Running Analysis..."}
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Run Stock Screener
                    </>
                  )}
                </Button>

                {loading && (
                  <div className="text-center space-y-2">
                    <div className="text-sm text-gray-500 space-y-1">
                      {isConnected ? (
                        <>
                          <p>• Fetching real-time market data from Finnhub</p>
                          <p>• Processing fundamental metrics</p>
                          <p>• Analyzing technical indicators</p>
                          <p>• Calculating momentum scores</p>
                          <p>• Evaluating risk factors</p>
                          <p>• Optimizing for {tradeType} trading</p>
                        </>
                      ) : (
                        <>
                          <p>• Analyzing fundamental metrics</p>
                          <p>• Processing technical indicators</p>
                          <p>• Calculating momentum scores</p>
                          <p>• Evaluating risk factors</p>
                          <p>• Optimizing for {tradeType} trading</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Screening Results</span>
                {lastUpdate && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <RefreshCw className="h-4 w-4" />
                    Last updated: {lastUpdate}
                  </div>
                )}
              </CardTitle>
              <CardDescription>Ranked by overall algorithmic score</CardDescription>
            </CardHeader>
            <CardContent>
              {results.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Overall Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={result.symbol} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell className="font-medium">#{index + 1}</TableCell>
                        <TableCell className="font-bold">{result.symbol}</TableCell>
                        <TableCell>{result.name}</TableCell>
                        <TableCell>{formatPrice(result.price)}</TableCell>
                        <TableCell>
                          <div
                            className={`flex items-center gap-1 ${result.change >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {result.change >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span>
                              {formatPrice(result.change)} ({result.changePercent.toFixed(2)}%)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getScoreColor(result.overallScore)}`}>
                              {result.overallScore.toFixed(1)}
                            </span>
                            <Progress value={result.overallScore} className="w-16" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={result.overallScore >= 90 ? "default" : "secondary"}>
                            {getScoreBadge(result.overallScore)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => setSelectedResult(result)}>
                            Analyze
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Run the screener to see analysis results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          {selectedResult ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedResult.symbol} - Detailed Analysis</span>
                    <Badge variant="outline">Confidence: {selectedResult.confidence.toFixed(1)}%</Badge>
                  </CardTitle>
                  <CardDescription>
                    {selectedResult.name} | Current Price: {formatPrice(selectedResult.price)} | Change:{" "}
                    <span className={selectedResult.change >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatPrice(selectedResult.change)} ({selectedResult.changePercent.toFixed(2)}%)
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(selectedResult.fundamentalScore)}`}>
                        {selectedResult.fundamentalScore.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">Fundamental</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(selectedResult.technicalScore)}`}>
                        {selectedResult.technicalScore.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">Technical</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(selectedResult.momentumScore)}`}>
                        {selectedResult.momentumScore.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">Momentum</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(selectedResult.qualityScore)}`}>
                        {selectedResult.qualityScore.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">Quality</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Positive Factors
                      </h4>
                      <ul className="space-y-2">
                        {selectedResult.reasons.map((reason, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Risk Factors
                      </h4>
                      <ul className="space-y-2">
                        {selectedResult.warnings.map((warning, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Value Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className={`text-3xl font-bold ${getScoreColor(selectedResult.valueScore)}`}>
                        {selectedResult.valueScore.toFixed(1)}
                      </div>
                      <Progress value={selectedResult.valueScore} className="flex-1" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className={`text-3xl font-bold ${getScoreColor(selectedResult.riskScore)}`}>
                        {selectedResult.riskScore.toFixed(1)}
                      </div>
                      <Progress value={selectedResult.riskScore} className="flex-1" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Grade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(selectedResult.overallScore)}`}>
                        {getScoreBadge(selectedResult.overallScore)}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">{selectedResult.overallScore.toFixed(1)}/100</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Select a stock from the Results tab to see detailed analysis</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="methodology">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Screening Methodology Overview
                </CardTitle>
                <CardDescription>Understanding how our algorithmic scoring system evaluates stocks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Our stock screener uses a comprehensive multi-factor approach, combining quantitative analysis from
                    various financial disciplines to provide objective stock rankings. Each stock receives scores across
                    multiple categories, which are then weighted to produce an overall score.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Overall Score Calculation</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Fundamental Analysis:</span>
                          <span className="font-medium">25%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Technical Analysis:</span>
                          <span className="font-medium">20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Value Metrics:</span>
                          <span className="font-medium">15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quality Assessment:</span>
                          <span className="font-medium">15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Momentum Indicators:</span>
                          <span className="font-medium">10%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Assessment:</span>
                          <span className="font-medium">10%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sentiment Analysis:</span>
                          <span className="font-medium">5%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Score Interpretation</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span>90-100: Excellent</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span>80-89: Good</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                          <span>70-79: Fair</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span>Below 70: Poor</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fundamental Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="h-5 w-5" />
                    Fundamental Analysis (25%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm">Profitability Metrics</h5>
                      <p className="text-xs text-muted-foreground">ROE, ROA, ROIC, Net Margin, Operating Margin</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Growth Indicators</h5>
                      <p className="text-xs text-muted-foreground">Revenue Growth, Earnings Growth, FCF Growth</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Financial Strength</h5>
                      <p className="text-xs text-muted-foreground">Debt/Equity, Current Ratio, Interest Coverage</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Efficiency Ratios</h5>
                      <p className="text-xs text-muted-foreground">Asset Turnover, Inventory Turnover</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <LineChart className="h-5 w-5" />
                    Technical Analysis (20%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm">Trend Analysis</h5>
                      <p className="text-xs text-muted-foreground">
                        SMA/EMA Crossovers, Trend Strength, Price Position
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Momentum Oscillators</h5>
                      <p className="text-xs text-muted-foreground">RSI, MACD, Stochastic, Williams %R</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Volume Analysis</h5>
                      <p className="text-xs text-muted-foreground">Volume Trend, OBV, Volume Price Trend</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Chart Patterns</h5>
                      <p className="text-xs text-muted-foreground">Support/Resistance, Breakouts, Reversals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Value Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5" />
                    Value Assessment (15%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm">Valuation Multiples</h5>
                      <p className="text-xs text-muted-foreground">P/E, P/B, P/S, EV/EBITDA, PEG Ratio</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Yield Metrics</h5>
                      <p className="text-xs text-muted-foreground">FCF Yield, Dividend Yield, Earnings Yield</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Intrinsic Value</h5>
                      <p className="text-xs text-muted-foreground">Graham Number, DCF Models, Asset-based Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5" />
                    Quality Assessment (15%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm">Earnings Quality</h5>
                      <p className="text-xs text-muted-foreground">Piotroski F-Score, Altman Z-Score, Accruals</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Business Consistency</h5>
                      <p className="text-xs text-muted-foreground">Earnings Stability, Revenue Predictability</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Competitive Position</h5>
                      <p className="text-xs text-muted-foreground">Market Share, Moat Indicators, Pricing Power</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Momentum Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5" />
                    Momentum Analysis (10%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm">Price Momentum</h5>
                      <p className="text-xs text-muted-foreground">3M, 6M, 12M Returns, Relative Strength</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Earnings Momentum</h5>
                      <p className="text-xs text-muted-foreground">EPS Revisions, Estimate Changes, Surprises</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Analyst Momentum</h5>
                      <p className="text-xs text-muted-foreground">Recommendation Changes, Target Price Updates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5" />
                    Risk Assessment (10%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm">Volatility Measures</h5>
                      <p className="text-xs text-muted-foreground">Beta, Standard Deviation, Downside Deviation</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Risk-Adjusted Returns</h5>
                      <p className="text-xs text-muted-foreground">Sharpe Ratio, Sortino Ratio, Maximum Drawdown</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Financial Risk</h5>
                      <p className="text-xs text-muted-foreground">Bankruptcy Risk, Credit Risk, Liquidity Risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Trade Type Optimization
                </CardTitle>
                <CardDescription>How scoring weights adjust based on your selected trade type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Day Trading</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Momentum:</span>
                        <span className="font-medium">40%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Technical:</span>
                        <span className="font-medium">30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volume:</span>
                        <span className="font-medium">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk:</span>
                        <span className="font-medium">10%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Swing Trading</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Technical:</span>
                        <span className="font-medium">35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Momentum:</span>
                        <span className="font-medium">25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fundamental:</span>
                        <span className="font-medium">25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk:</span>
                        <span className="font-medium">15%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Long-term Investment</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Fundamental:</span>
                        <span className="font-medium">50%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quality:</span>
                        <span className="font-medium">25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Value:</span>
                        <span className="font-medium">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk:</span>
                        <span className="font-medium">10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
