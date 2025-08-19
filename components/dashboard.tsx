"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  BookOpen,
  Newspaper,
  Target,
  Calendar,
  Brain,
  AlertTriangle,
} from "lucide-react"
import { useCurrency } from "@/app/page"
import dynamic from "next/dynamic"
import TradingHeatmap from "./trading-heatmap"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Button } from "@/components/ui/button"

// Dynamically import the entire chart component to prevent SSR issues and improve loading
const ChartComponents = dynamic(() => import("./chart-components"), {
  ssr: false,
  loading: () => (
    <div className="h-32">
      <Skeleton className="h-full w-full rounded-full" />
    </div>
  ),
})

interface DashboardProps {
  onNavigate: (tab: "dashboard" | "screener" | "journal" | "news" | "profile" | "settings") => void
}

const EMOTIONS = [
  { value: "neutral", label: "Neutral", color: "#9A3412" },
  { value: "focused", label: "Focused", color: "#EA580C" },
  { value: "vengeful", label: "Vengeful", color: "#DC2626" },
  { value: "trusting", label: "Trusting", color: "#F97316" },
  { value: "nervous", label: "Nervous", color: "#FB923C" },
  { value: "tired", label: "Tired out", color: "#FDBA74" },
  { value: "happy", label: "Happy", color: "#FED7AA" },
  { value: "sad", label: "Sad", color: "#C2410C" },
]

// Orange color palette for mistakes
const ORANGE_PALETTE = [
  "#EA580C", // Primary orange
  "#F97316", // Bright orange
  "#FB923C", // Light orange
  "#C2410C", // Dark orange
  "#9A3412", // Deep orange
  "#FDBA74", // Pale orange
  "#FED7AA", // Very light orange
  "#7C2D12", // Very dark orange
  "#DC2626", // Red-orange
  "#EF4444", // Light red-orange
]

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [trades, setTrades] = useState<any[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [chartsReady, setChartsReady] = useState(false)
  const { formatPrice } = useCurrency()
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<"1w" | "1m" | "3m" | "6m" | "1Y">("1m")

  // Pre-calculate and memoize chart data to prevent recalculation
  const chartData = useMemo(() => {
    if (!isDataLoaded || trades.length === 0) {
      return { emotionData: [], mistakeData: [] }
    }

    // Calculate emotions
    const emotionCounts: Record<string, number> = {}
    trades.forEach((trade) => {
      if (trade.emotion) {
        emotionCounts[trade.emotion] = (emotionCounts[trade.emotion] || 0) + 1
      }
    })

    const emotionData = Object.entries(emotionCounts)
      .map(([emotion, count]) => {
        const emotionDataItem = EMOTIONS.find((e) => e.value === emotion)
        return {
          name: emotionDataItem?.label || emotion,
          value: count,
          color: emotionDataItem?.color || "#EA580C",
        }
      })
      .sort((a, b) => b.value - a.value)

    // Calculate mistakes
    const mistakeCounts: Record<string, number> = {}
    trades.forEach((trade) => {
      if (trade.mistakes) {
        trade.mistakes.forEach((mistake: string) => {
          mistakeCounts[mistake] = (mistakeCounts[mistake] || 0) + 1
        })
      }
    })

    const mistakeData = Object.entries(mistakeCounts)
      .map(([mistake, count], index) => ({
        name: mistake,
        value: count,
        color: ORANGE_PALETTE[index % ORANGE_PALETTE.length],
      }))
      .sort((a, b) => b.value - a.value)

    return { emotionData, mistakeData }
  }, [trades, isDataLoaded])

  // Calculate detailed stats from trades
  const calculateStats = useMemo(() => {
    const closedTrades = trades.filter((t) => t.status === "Closed")
    const totalTrades = closedTrades.length
    const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0).length
    const losingTrades = closedTrades.filter((t) => (t.pnl || 0) < 0).length
    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    const avgWin =
      winningTrades > 0
        ? closedTrades.filter((t) => (t.pnl || 0) > 0).reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades
        : 0
    const avgLoss =
      losingTrades > 0
        ? Math.abs(
            closedTrades.filter((t) => (t.pnl || 0) < 0).reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades,
          )
        : 0
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0

    return { totalTrades, winningTrades, losingTrades, totalPnL, winRate, avgWin, avgLoss, profitFactor }
  }, [trades])

  // Load trade journal data from localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTrades = localStorage.getItem("tradeJournal")
        if (savedTrades) {
          const tradesData = JSON.parse(savedTrades)
          setTrades(tradesData)
        }
      } catch (error) {
        console.error("Error loading trade data:", error)
      } finally {
        setIsDataLoaded(true)
        // Add a small delay to ensure charts are ready to render
        setTimeout(() => setChartsReady(true), 100)
      }
    }

    loadData()
  }, [])

  const recentTrades = useMemo(() => {
    return trades
      .filter((t) => t.status === "Closed")
      .sort((a, b) => new Date(b.exitDate || b.entryDate).getTime() - new Date(a.exitDate || a.entryDate).getTime())
      .slice(0, 4)
      .map((trade) => ({
        symbol: trade.symbol,
        type: trade.type,
        pnl: trade.pnl || 0,
        date: trade.exitDate || trade.entryDate,
        status: trade.status,
      }))
  }, [trades])

  const profitChartData = useMemo(() => {
    if (!isDataLoaded || trades.length === 0) return []

    const now = new Date()
    let startDate: Date

    switch (selectedTimeFrame) {
      case "1w":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "1m":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "3m":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "6m":
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      case "1Y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const closedTrades = trades
      .filter((trade) => trade.status === "Closed" && trade.pnl !== undefined)
      .map((trade) => ({
        ...trade,
        date: new Date(trade.exitDate || trade.entryDate),
        pnl: trade.pnl || 0,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    if (closedTrades.length === 0) return []

    const filteredTrades = closedTrades.filter((trade) => trade.date >= startDate && trade.date <= now)

    if (filteredTrades.length === 0) return []

    // Create cumulative P&L data points
    const lineData = []
    let cumulativePnL = 0

    // Add starting point
    lineData.push({
      date: startDate.toISOString().split("T")[0],
      value: 0,
      label: startDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    })

    filteredTrades.forEach((trade, index) => {
      cumulativePnL += trade.pnl
      lineData.push({
        date: trade.date.toISOString().split("T")[0],
        value: cumulativePnL,
        label: trade.date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        trade: trade,
      })
    })

    return lineData
  }, [trades, selectedTimeFrame, isDataLoaded])

  const timeFrameMetrics = useMemo(() => {
    const chartData = profitChartData
    if (chartData.length === 0) {
      return {
        totalReturn: 0,
        totalTrades: 0,
        winRate: 0,
        bestPeriod: 0,
        worstPeriod: 0,
        avgPeriodReturn: 0,
      }
    }

    const totalReturn = chartData[chartData.length - 1]?.value || 0
    const totalTrades = chartData.length - 1 // Subtract 1 for starting point
    const profitableTrades = chartData.filter(
      (d, index) => index > 0 && d.value > (chartData[index - 1]?.value || 0),
    ).length
    const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0

    // Calculate best and worst single trade impacts
    let bestTrade = 0
    let worstTrade = 0
    for (let i = 1; i < chartData.length; i++) {
      const tradeImpact = chartData[i].value - chartData[i - 1].value
      bestTrade = Math.max(bestTrade, tradeImpact)
      worstTrade = Math.min(worstTrade, tradeImpact)
    }

    const avgReturn = totalTrades > 0 ? totalReturn / totalTrades : 0

    return {
      totalReturn,
      totalTrades,
      winRate,
      bestPeriod: bestTrade,
      worstPeriod: worstTrade,
      avgPeriodReturn: avgReturn,
    }
  }, [profitChartData])

  const activePositions = useMemo(() => {
    return trades
      .filter((t) => t.status === "Open")
      .map((trade) => ({
        symbol: trade.symbol,
        shares: trade.shares || 0,
        avgPrice: trade.entryPrice || 0,
        currentPrice: trade.entryPrice || 0, // In real app, this would be live price
      }))
  }, [trades])

  const stats = calculateStats

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome to MarketDesk</h1>
        <p className="text-muted-foreground mt-2">
          Your comprehensive platform for stock analysis, trade journaling, and market insights
        </p>
      </div>

      {/* Enhanced Stats Cards from Trade Journal - Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold">Total Trades</CardTitle>
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{stats.totalTrades}</div>
            <p className="text-sm text-muted-foreground">Closed positions</p>
            <div className="mt-2 text-xs text-muted-foreground">
              {stats.winningTrades}W / {stats.losingTrades}L
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold">Win Rate</CardTitle>
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{stats.winRate.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">{stats.winningTrades} winning trades</p>
            <div className="mt-2 text-xs text-muted-foreground">Profit Factor: {stats.profitFactor.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold">Total P&L</CardTitle>
            <DollarSign className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold mb-2 ${stats.totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatPrice(stats.totalPnL)}
            </div>
            <p className="text-sm text-muted-foreground">Realized gains/losses</p>
            <div className="mt-2 text-xs text-muted-foreground">
              Avg Win: {formatPrice(stats.avgWin)} | Avg Loss: {formatPrice(-stats.avgLoss)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold">Open Positions</CardTitle>
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{trades.filter((t) => t.status === "Open").length}</div>
            <p className="text-sm text-muted-foreground">Active trades</p>
            <div className="mt-2 text-xs text-muted-foreground">Risk exposure tracking</div>
          </CardContent>
        </Card>
      </div>

      {/* Compact Psychology Analytics from Trade Journal - Only show if there's data and charts are ready */}
      {chartsReady && (chartData.emotionData.length > 0 || chartData.mistakeData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Emotions Analytics - Smaller */}
          {chartData.emotionData.length > 0 && (
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Trading Psychology
                </CardTitle>
                <CardDescription className="text-xs">Emotional patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense
                  fallback={
                    <div className="h-32">
                      <Skeleton className="h-full w-full rounded-full" />
                    </div>
                  }
                >
                  <ChartComponents
                    data={chartData.emotionData}
                    type="emotion"
                    size={{ width: 128, height: 128, innerRadius: 20, outerRadius: 40 }}
                  />
                </Suspense>
                <div className="mt-2 space-y-1">
                  {chartData.emotionData.slice(0, 3).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span>{entry.name}</span>
                      </div>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mistakes Analytics - Smaller */}
          {chartData.mistakeData.length > 0 && (
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Common Errors
                </CardTitle>
                <CardDescription className="text-xs">Mistake patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense
                  fallback={
                    <div className="h-32">
                      <Skeleton className="h-full w-full rounded-full" />
                    </div>
                  }
                >
                  <ChartComponents
                    data={chartData.mistakeData}
                    type="mistake"
                    size={{ width: 128, height: 128, innerRadius: 20, outerRadius: 40 }}
                  />
                </Suspense>
                <div className="mt-2 space-y-1">
                  {chartData.mistakeData.slice(0, 3).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="truncate">
                          {entry.name.length > 15 ? entry.name.substring(0, 15) + "..." : entry.name}
                        </span>
                      </div>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Win Rate Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Trading Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Win Rate</span>
                <span className="text-sm font-medium">{stats.winRate.toFixed(1)}%</span>
              </div>
              <Progress value={stats.winRate} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-green-600">Winning Trades</div>
                <div>{stats.winningTrades}</div>
              </div>
              <div>
                <div className="font-medium text-red-600">Losing Trades</div>
                <div>{stats.losingTrades}</div>
              </div>
              <div>
                <div className="font-medium">Total Trades</div>
                <div>{stats.totalTrades}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profit Performance Over Time */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-600">
                Trading Performance
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1 text-sm uppercase tracking-wide">
                PROFIT & LOSS (USD)
              </CardDescription>
            </div>
            <div className="flex gap-1">
              {(["1w", "1m", "3m", "6m", "1Y"] as const).map((timeFrame) => (
                <Button
                  key={timeFrame}
                  variant={selectedTimeFrame === timeFrame ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeFrame(timeFrame)}
                  className="text-xs px-2 py-1"
                >
                  {timeFrame.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {profitChartData.length > 0 ? (
            <div className="space-y-4">
              <div className="h-80 p-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profitChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <defs>
                      <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EA580C" stopOpacity={0.75} />
                        <stop offset="100%" stopColor="#EA580C" stopOpacity={0.25} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="1 1" stroke="#f1f5f9" className="opacity-30" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={{ stroke: "#e2e8f0" }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return selectedTimeFrame === "1w"
                          ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : selectedTimeFrame === "1Y"
                            ? date.toLocaleDateString("en-US", { month: "short" })
                            : date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={{ stroke: "#e2e8f0" }}
                      tickFormatter={(value) => formatPrice(value)}
                      domain={["dataMin - 100", "dataMax + 100"]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              <p className="text-sm font-medium text-foreground">
                                {new Date(label).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="text-lg font-bold text-foreground mt-1">{formatPrice(data.value)}</p>
                              {data.trade && (
                                <div className="mt-2 pt-2 border-t border-border">
                                  <p className="text-xs text-muted-foreground">
                                    {data.trade.symbol}: {formatPrice(data.trade.pnl)}
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#EA580C"
                      strokeWidth={3}
                      fill="url(#orangeGradient)"
                      dot={{ fill: "#EA580C", strokeWidth: 0, r: 6 }}
                      activeDot={{ r: 8, fill: "#EA580C" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Time Frame Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div
                    className={`text-lg font-bold ${timeFrameMetrics.totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatPrice(timeFrameMetrics.totalReturn)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Return</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{timeFrameMetrics.totalTrades}</div>
                  <div className="text-xs text-muted-foreground">Total Trades</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{timeFrameMetrics.winRate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Period Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{formatPrice(timeFrameMetrics.bestPeriod)}</div>
                  <div className="text-xs text-muted-foreground">Best Period</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{formatPrice(timeFrameMetrics.worstPeriod)}</div>
                  <div className="text-xs text-muted-foreground">Worst Period</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-lg font-bold ${timeFrameMetrics.avgPeriodReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatPrice(timeFrameMetrics.avgPeriodReturn)}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg per Period</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No trades found for the selected time frame</p>
              <p className="text-sm">Complete some trades to see your profit performance</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trading Activity Heatmap */}
      {isDataLoaded && <TradingHeatmap trades={trades} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recent Trades
            </CardTitle>
            <CardDescription>Your latest trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTrades.length > 0 ? (
                recentTrades.map((trade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{trade.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {trade.type} • {trade.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {trade.status === "Closed" ? (
                        <div className={`font-medium ${trade.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                        </div>
                      ) : (
                        <div className="font-medium text-muted-foreground">Open</div>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {trade.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No recent trades</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Positions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Active Positions
            </CardTitle>
            <CardDescription>Currently held positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activePositions.length > 0 ? (
                activePositions.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{position.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {position.shares} shares @ ${position.avgPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${position.currentPrice.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Current Price</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No active positions</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("screener")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Stock Screener
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Find trading opportunities with our algorithmic stock screener
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("journal")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              Trade Journal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Log and analyze your trades to improve performance</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("news")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Newspaper className="h-5 w-5" />
              Market News
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Stay updated with real-time financial news and analysis</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
