"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { BookOpen, Plus, Edit, Trash2, TrendingUp, TrendingDown, Brain, AlertTriangle, ChevronDown } from "lucide-react"
import { useCurrency } from "@/app/page"
import { useAuth } from "@/lib/auth"
import { UserDataService } from "@/lib/user-data"

interface Trade {
  id: string
  symbol: string
  type: "Long" | "Short"
  entryDate: string
  entryTime: string
  exitDate?: string
  exitTime?: string
  shares: number
  entryPrice: number
  exitPrice?: number
  pnl?: number
  notes: string
  strategy: string
  status: "Open" | "Closed"
  entryMode?: "detailed" | "pnl"
  // New optional fields for emotions and mistakes
  emotion?: string
  mistakes?: string[]
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

const MISTAKES = [
  "Risk Management Error",
  "Ignored Take Profit",
  "News Influence",
  "Technical Analysis Error",
  "Ignored Stop Loss",
  "Overconfidence",
  "Fundamental Analysis Error",
  "Forgotten Trade Plan",
  "Slippage",
  "Lack of Research",
  "Regret Trading",
  "Wrong Entry Point",
  "Lack of Patience",
  "Wrong Exit Point",
  "Wrong Time Frame",
  "Execution Error",
  "Position Sizing Error",
  "Not Following Market Trends",
  "Market Condition Misjudgment",
  "Emotional Trading",
]

const initialTradeState: Partial<Trade> = {
  symbol: "",
  type: "Long",
  entryDate: "",
  entryTime: "",
  shares: 0,
  entryPrice: 0,
  notes: "",
  strategy: "",
  status: "Open",
  entryMode: "detailed",
}

export default function TradeJournal() {
  const { user } = useAuth()
  const [trades, setTrades] = useState<Trade[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [formData, setFormData] = useState<Partial<Trade>>(initialTradeState)
  const [entryMode, setEntryMode] = useState<"detailed" | "pnl">("detailed")
  const [selectedEmotion, setSelectedEmotion] = useState<string>("")
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([])
  const [showEmotionsMistakes, setShowEmotionsMistakes] = useState(false)

  const { formatPrice } = useCurrency()

  // Initialize form with current date/time
  const initializeForm = useCallback(() => {
    const now = new Date()
    return {
      ...initialTradeState,
      entryDate: now.toISOString().split("T")[0],
      entryTime: now.toTimeString().slice(0, 5),
      entryMode: "detailed",
    }
  }, [])

  // Load trades from user data or localStorage
  useEffect(() => {
    const loadTrades = async () => {
      if (user) {
        // Load user-specific trades
        const userTrades = UserDataService.getTradeJournal(user.id)
        setTrades(userTrades)
      } else {
        // Load anonymous trades
        const savedTrades = localStorage.getItem("tradeJournal")
        if (savedTrades) {
          try {
            const parsedTrades = JSON.parse(savedTrades)
            setTrades(parsedTrades)
          } catch (error) {
            console.error("Error loading trades:", error)
          }
        } else {
          // Initialize with sample data for anonymous users - 12 trades across 12 months
          const sampleTrades: Trade[] = [
            {
              id: "1",
              symbol: "AAPL",
              type: "Long",
              entryDate: "2024-01-15",
              entryTime: "09:30",
              exitDate: "2025-01-18",
              exitTime: "15:45",
              shares: 100,
              entryPrice: 185.5,
              exitPrice: 192.3,
              pnl: 680.0,
              notes: "Strong earnings beat, held through resistance break",
              strategy: "Earnings Play",
              status: "Closed",
              entryMode: "detailed",
              emotion: "focused",
              mistakes: [],
            },
            {
              id: "2",
              symbol: "TSLA",
              type: "Short",
              entryDate: "2024-02-08",
              entryTime: "10:15",
              exitDate: "2025-02-12",
              exitTime: "14:20",
              shares: 50,
              entryPrice: 245.8,
              exitPrice: 238.4,
              pnl: 370.0,
              notes: "Overvalued after rally, good short setup at resistance",
              strategy: "Mean Reversion",
              status: "Closed",
              entryMode: "detailed",
              emotion: "confident",
              mistakes: [],
            },
            {
              id: "3",
              symbol: "NVDA",
              type: "Long",
              entryDate: "2024-03-22",
              entryTime: "11:00",
              exitDate: "2025-03-25",
              exitTime: "13:30",
              shares: 25,
              entryPrice: 875.2,
              exitPrice: 912.5,
              pnl: 932.5,
              notes: "AI hype continuation, rode the momentum",
              strategy: "Momentum",
              status: "Closed",
              entryMode: "detailed",
              emotion: "happy",
              mistakes: [],
            },
            {
              id: "4",
              symbol: "MSFT",
              type: "Long",
              entryDate: "2024-04-10",
              entryTime: "09:45",
              exitDate: "2025-04-15",
              exitTime: "16:00",
              shares: 75,
              entryPrice: 420.15,
              exitPrice: 408.9,
              pnl: -843.75,
              notes: "Misjudged cloud earnings impact, cut losses quickly",
              strategy: "Earnings Play",
              status: "Closed",
              entryMode: "detailed",
              emotion: "nervous",
              mistakes: ["Technical Analysis Error", "Wrong Entry Point"],
            },
            {
              id: "5",
              symbol: "AMZN",
              type: "Long",
              entryDate: "2024-05-03",
              entryTime: "14:30",
              exitDate: "2025-05-08",
              exitTime: "11:15",
              shares: 40,
              entryPrice: 178.25,
              exitPrice: 185.6,
              pnl: 294.0,
              notes: "AWS growth story intact, good support bounce",
              strategy: "Support Bounce",
              status: "Closed",
              entryMode: "detailed",
              emotion: "focused",
              mistakes: [],
            },
            {
              id: "6",
              symbol: "GOOGL",
              type: "Short",
              entryDate: "2024-06-18",
              entryTime: "13:20",
              exitDate: "2025-06-20",
              exitTime: "10:45",
              shares: 60,
              entryPrice: 175.8,
              exitPrice: 182.4,
              pnl: -396.0,
              notes: "Unexpected AI announcement pumped the stock, stopped out",
              strategy: "Technical Breakdown",
              status: "Closed",
              entryMode: "detailed",
              emotion: "frustrated",
              mistakes: ["News Influence", "Ignored Stop Loss"],
            },
            {
              id: "7",
              symbol: "META",
              type: "Long",
              entryDate: "2024-07-12",
              entryTime: "10:00",
              exitDate: "2025-07-19",
              exitTime: "15:30",
              shares: 35,
              entryPrice: 495.3,
              exitPrice: 518.75,
              pnl: 820.75,
              notes: "VR/AR developments driving growth, perfect breakout",
              strategy: "Breakout",
              status: "Closed",
              entryMode: "detailed",
              emotion: "confident",
              mistakes: [],
            },
            {
              id: "8",
              symbol: "SPY",
              type: "Short",
              entryDate: "2024-08-05",
              entryTime: "09:30",
              exitDate: "2025-08-07",
              exitTime: "16:00",
              shares: 200,
              entryPrice: 545.2,
              exitPrice: 538.9,
              pnl: 1260.0,
              notes: "Market correction play, VIX spike indicated fear",
              strategy: "Market Hedge",
              status: "Closed",
              entryMode: "detailed",
              emotion: "focused",
              mistakes: [],
            },
            {
              id: "9",
              symbol: "AMD",
              type: "Long",
              entryDate: "2024-09-14",
              entryTime: "11:30",
              exitDate: "2025-09-16",
              exitTime: "14:00",
              shares: 80,
              entryPrice: 142.6,
              exitPrice: 138.2,
              pnl: -352.0,
              notes: "Chip sector rotation didn't materialize as expected",
              strategy: "Sector Rotation",
              status: "Closed",
              entryMode: "detailed",
              emotion: "disappointed",
              mistakes: ["Market Condition Misjudgment"],
            },
            {
              id: "10",
              symbol: "NFLX",
              type: "Long",
              entryDate: "2024-10-20",
              entryTime: "12:15",
              exitDate: "2025-10-25",
              exitTime: "13:45",
              shares: 30,
              entryPrice: 685.4,
              exitPrice: 702.8,
              pnl: 522.0,
              notes: "Subscriber growth exceeded expectations, held through volatility",
              strategy: "Earnings Play",
              status: "Closed",
              entryMode: "detailed",
              emotion: "patient",
              mistakes: [],
            },
            {
              id: "11",
              symbol: "COIN",
              type: "Long",
              entryDate: "2024-11-08",
              entryTime: "10:45",
              exitDate: "2025-11-12",
              exitTime: "15:15",
              shares: 45,
              entryPrice: 285.9,
              exitPrice: 312.4,
              pnl: 1192.5,
              notes: "Bitcoin rally lifted crypto stocks, perfect timing",
              strategy: "Crypto Momentum",
              status: "Closed",
              entryMode: "detailed",
              emotion: "excited",
              mistakes: [],
            },
            {
              id: "12",
              symbol: "QQQ",
              type: "Long",
              entryDate: "2024-12-15",
              entryTime: "09:45",
              shares: 150,
              entryPrice: 485.3,
              notes: "Year-end rally setup, tech leading the way",
              strategy: "Seasonal Play",
              status: "Open",
              entryMode: "detailed",
              emotion: "optimistic",
              mistakes: [],
            },
          ]
          setTrades(sampleTrades)
          localStorage.setItem("tradeJournal", JSON.stringify(sampleTrades))
        }
      }
    }

    loadTrades()
  }, [user])

  // Save trades to user data or localStorage
  useEffect(() => {
    if (trades.length > 0) {
      if (user) {
        UserDataService.saveTradeJournal(user.id, trades)
      } else {
        localStorage.setItem("tradeJournal", JSON.stringify(trades))
      }
    }
  }, [trades, user])

  // Sort trades: Open trades first (by entry date desc), then closed trades (by exit date desc)
  const sortedTrades = [...trades].sort((a, b) => {
    // Open trades first
    if (a.status === "Open" && b.status === "Closed") return -1
    if (a.status === "Closed" && b.status === "Open") return 1

    // Both open: sort by entry date (most recent first)
    if (a.status === "Open" && b.status === "Open") {
      const aDateTime = new Date(`${a.entryDate}T${a.entryTime}`)
      const bDateTime = new Date(`${b.entryDate}T${b.entryTime}`)
      return bDateTime.getTime() - aDateTime.getTime()
    }

    // Both closed: sort by exit date (most recent first)
    if (a.status === "Closed" && b.status === "Closed") {
      const aExitDateTime = new Date(`${a.exitDate}T${a.exitTime}`)
      const bExitDateTime = new Date(`${b.exitDate}T${b.exitTime}`)
      return bExitDateTime.getTime() - aExitDateTime.getTime()
    }

    return 0
  })

  const handleInputChange = useCallback((field: keyof Trade, value: string | number | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const openAddDialog = useCallback(() => {
    setFormData(initializeForm())
    setEntryMode("detailed")
    setSelectedEmotion("")
    setSelectedMistakes([])
    setIsAddDialogOpen(true)
  }, [initializeForm])

  const openEditDialog = useCallback((trade: Trade) => {
    setEditingTrade(trade)
    setFormData({ ...trade })
    setEntryMode(trade.entryMode || "detailed")
    setSelectedEmotion(trade.emotion || "")
    setSelectedMistakes(trade.mistakes || [])
    setIsEditDialogOpen(true)
  }, [])

  const closeDialogs = useCallback(() => {
    setIsAddDialogOpen(false)
    setIsEditDialogOpen(false)
    setEditingTrade(null)
    setFormData(initialTradeState)
    setEntryMode("detailed")
    setSelectedEmotion("")
    setSelectedMistakes([])
  }, [])

  const validateForm = useCallback(() => {
    if (!formData.symbol) {
      alert("Please enter a symbol")
      return false
    }

    if (entryMode === "detailed") {
      if (!formData.shares || !formData.entryPrice) {
        alert("Please fill in shares and entry price for detailed entry")
        return false
      }
    } else if (entryMode === "pnl") {
      if (formData.status === "Closed" && formData.pnl === undefined) {
        alert("Please enter P&L for closed trades")
        return false
      }
    }

    return true
  }, [formData, entryMode])

  const calculatePnL = useCallback((trade: Partial<Trade>) => {
    if (trade.entryMode === "pnl") {
      return trade.pnl // Use directly entered P&L
    }

    if (trade.status === "Closed" && trade.exitPrice && trade.entryPrice && trade.shares) {
      const multiplier = trade.type === "Long" ? 1 : -1
      return (trade.exitPrice - trade.entryPrice) * trade.shares * multiplier
    }
    return undefined
  }, [])

  const handleAddTrade = useCallback(() => {
    if (!validateForm()) return

    const newTrade: Trade = {
      id: Date.now().toString(),
      symbol: formData.symbol!.toUpperCase(),
      type: formData.type as "Long" | "Short",
      entryDate: formData.entryDate!,
      entryTime: formData.entryTime!,
      exitDate: formData.exitDate,
      exitTime: formData.exitTime,
      shares: entryMode === "detailed" ? formData.shares! : 0,
      entryPrice: entryMode === "detailed" ? formData.entryPrice! : 0,
      exitPrice: formData.exitPrice,
      notes: formData.notes || "",
      strategy: formData.strategy || "",
      status: formData.status as "Open" | "Closed",
      entryMode: entryMode,
      emotion: selectedEmotion || undefined,
      mistakes: selectedMistakes.length > 0 ? selectedMistakes : undefined,
    }

    newTrade.pnl = calculatePnL({ ...formData, entryMode })

    setTrades((prev) => [...prev, newTrade])
    setSelectedEmotion("")
    setSelectedMistakes([])
    closeDialogs()
  }, [formData, entryMode, selectedEmotion, selectedMistakes, validateForm, calculatePnL, closeDialogs])

  const handleUpdateTrade = useCallback(() => {
    if (!editingTrade || !validateForm()) return

    const updatedTrade: Trade = {
      ...editingTrade,
      symbol: formData.symbol!.toUpperCase(),
      type: formData.type as "Long" | "Short",
      entryDate: formData.entryDate!,
      entryTime: formData.entryTime!,
      exitDate: formData.exitDate,
      exitTime: formData.exitTime,
      shares: entryMode === "detailed" ? formData.shares! : editingTrade.shares,
      entryPrice: entryMode === "detailed" ? formData.entryPrice! : editingTrade.entryPrice,
      exitPrice: formData.exitPrice,
      notes: formData.notes || "",
      strategy: formData.strategy || "",
      status: formData.status as "Open" | "Closed",
      entryMode: entryMode,
      emotion: selectedEmotion || undefined,
      mistakes: selectedMistakes.length > 0 ? selectedMistakes : undefined,
    }

    updatedTrade.pnl = calculatePnL({ ...formData, entryMode })

    setTrades((prev) => prev.map((t) => (t.id === editingTrade.id ? updatedTrade : t)))
    setSelectedEmotion("")
    setSelectedMistakes([])
    closeDialogs()
  }, [editingTrade, formData, entryMode, selectedEmotion, selectedMistakes, validateForm, calculatePnL, closeDialogs])

  const handleDeleteTrade = useCallback((id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion === selectedEmotion ? "" : emotion)
  }

  const handleMistakeToggle = (mistake: string) => {
    setSelectedMistakes((prev) => (prev.includes(mistake) ? prev.filter((m) => m !== mistake) : [...prev, mistake]))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Trade Journal
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and analyze your trading performance
            {user && <span className="ml-2 text-green-400">• Synced to your account</span>}
          </p>
        </div>

        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Trade
        </Button>
      </div>

      {/* Trades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
          <CardDescription>Open trades shown first, then most recent</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedTrades.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Exit</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Entry Price</TableHead>
                  <TableHead>Exit Price</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Psychology</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={trade.type === "Long" ? "default" : "secondary"}>{trade.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{trade.entryDate}</div>
                        <div className="text-muted-foreground">{trade.entryTime}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {trade.exitDate ? (
                        <div className="text-sm">
                          <div>{trade.exitDate}</div>
                          <div className="text-muted-foreground">{trade.exitTime}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {trade.entryMode === "pnl" ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        trade.shares.toLocaleString()
                      )}
                    </TableCell>
                    <TableCell>
                      {trade.entryMode === "pnl" ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        formatPrice(trade.entryPrice)
                      )}
                    </TableCell>
                    <TableCell>
                      {trade.entryMode === "pnl" ? (
                        <span className="text-muted-foreground">-</span>
                      ) : trade.exitPrice ? (
                        formatPrice(trade.exitPrice)
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {trade.pnl !== undefined ? (
                        <div
                          className={`flex items-center gap-1 ${trade.pnl >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {trade.pnl >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {formatPrice(trade.pnl)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={trade.status === "Open" ? "default" : "secondary"}>{trade.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {trade.emotion && (
                          <div className="flex items-center gap-1">
                            <Brain className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{EMOTIONS.find((e) => e.value === trade.emotion)?.label}</span>
                          </div>
                        )}
                        {trade.mistakes && trade.mistakes.length > 0 && (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-600">
                              {trade.mistakes.length} error{trade.mistakes.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                        {!trade.emotion && (!trade.mistakes || trade.mistakes.length === 0) && (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(trade)}>
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Trade</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this trade? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTrade(trade.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No trades recorded yet. Add your first trade to get started!</p>
              {!user && (
                <p className="text-sm text-gray-400 mt-2">Sign in to save your trades permanently across devices</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Trade Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add New Trade</DialogTitle>
            <DialogDescription>Enter the details of your trade</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-symbol">Symbol *</Label>
                  <Input
                    id="add-symbol"
                    placeholder="AAPL"
                    value={formData.symbol || ""}
                    onChange={(e) => handleInputChange("symbol", e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <Label htmlFor="add-type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Long">Long</SelectItem>
                      <SelectItem value="Short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="add-entryMode">Entry Mode</Label>
                  <Select value={entryMode} onValueChange={(value: "detailed" | "pnl") => setEntryMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detailed">Detailed (Shares & Prices)</SelectItem>
                      <SelectItem value="pnl">P&L Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-entryDate">Entry Date *</Label>
                  <Input
                    id="add-entryDate"
                    type="date"
                    value={formData.entryDate || ""}
                    onChange={(e) => handleInputChange("entryDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="add-entryTime">Entry Time *</Label>
                  <Input
                    id="add-entryTime"
                    type="time"
                    value={formData.entryTime || ""}
                    onChange={(e) => handleInputChange("entryTime", e.target.value)}
                  />
                </div>
              </div>

              {formData.status === "Closed" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="add-exitDate">Exit Date</Label>
                    <Input
                      id="add-exitDate"
                      type="date"
                      value={formData.exitDate || ""}
                      onChange={(e) => handleInputChange("exitDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-exitTime">Exit Time</Label>
                    <Input
                      id="add-exitTime"
                      type="time"
                      value={formData.exitTime || ""}
                      onChange={(e) => handleInputChange("exitTime", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {entryMode === "detailed" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="add-shares">Shares *</Label>
                      <Input
                        id="add-shares"
                        type="number"
                        placeholder="100"
                        value={formData.shares || ""}
                        onChange={(e) => handleInputChange("shares", Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-entryPrice">Entry Price *</Label>
                      <Input
                        id="add-entryPrice"
                        type="number"
                        step="0.01"
                        placeholder="150.00"
                        value={formData.entryPrice || ""}
                        onChange={(e) => handleInputChange("entryPrice", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {formData.status === "Closed" && (
                    <div>
                      <Label htmlFor="add-exitPrice">Exit Price</Label>
                      <Input
                        id="add-exitPrice"
                        type="number"
                        step="0.01"
                        placeholder="155.00"
                        value={formData.exitPrice || ""}
                        onChange={(e) => handleInputChange("exitPrice", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  )}
                </>
              ) : (
                formData.status === "Closed" && (
                  <div>
                    <Label htmlFor="add-pnl">P&L *</Label>
                    <Input
                      id="add-pnl"
                      type="number"
                      step="0.01"
                      placeholder="325.00"
                      value={formData.pnl || ""}
                      onChange={(e) => handleInputChange("pnl", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )
              )}

              <div>
                <Label htmlFor="add-strategy">Strategy</Label>
                <Input
                  id="add-strategy"
                  placeholder="Swing Trade, Day Trade, etc."
                  value={formData.strategy || ""}
                  onChange={(e) => handleInputChange("strategy", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="add-notes">Notes</Label>
                <Textarea
                  id="add-notes"
                  placeholder="Trade reasoning, setup, lessons learned..."
                  value={formData.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </div>

              {/* Psychology Tracking with Dropdowns */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">Trading Psychology (Optional)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmotionsMistakes(!showEmotionsMistakes)}
                  >
                    {showEmotionsMistakes ? "Hide" : "Show"} Psychology Tracking
                  </Button>
                </div>

                {showEmotionsMistakes && (
                  <div className="space-y-4">
                    {/* Emotion Dropdown */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">How did you feel during this trade?</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between bg-transparent">
                            <div className="flex items-center gap-2">
                              <Brain className="h-4 w-4" />
                              {selectedEmotion
                                ? EMOTIONS.find((e) => e.value === selectedEmotion)?.label
                                : "Select emotion"}
                            </div>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          {EMOTIONS.map((emotion) => (
                            <DropdownMenuItem
                              key={emotion.value}
                              onClick={() => handleEmotionSelect(emotion.value)}
                              className="flex items-center gap-2"
                            >
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emotion.color }} />
                              {emotion.label}
                              {selectedEmotion === emotion.value && <span className="ml-auto">✓</span>}
                            </DropdownMenuItem>
                          ))}
                          {selectedEmotion && (
                            <DropdownMenuItem onClick={() => setSelectedEmotion("")} className="text-red-600">
                              Clear selection
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Mistakes Dropdown */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        What mistakes were made? (Select multiple)
                      </Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between bg-transparent">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              {selectedMistakes.length > 0
                                ? `${selectedMistakes.length} mistake${selectedMistakes.length !== 1 ? "s" : ""} selected`
                                : "Select mistakes"}
                            </div>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                          {MISTAKES.map((mistake) => (
                            <DropdownMenuItem
                              key={mistake}
                              onClick={() => handleMistakeToggle(mistake)}
                              className="flex items-center gap-2"
                            >
                              <div className="w-4 h-4 flex items-center justify-center">
                                {selectedMistakes.includes(mistake) && <span className="text-orange-600">✓</span>}
                              </div>
                              <span className="text-xs">{mistake}</span>
                            </DropdownMenuItem>
                          ))}
                          {selectedMistakes.length > 0 && (
                            <DropdownMenuItem onClick={() => setSelectedMistakes([])} className="text-red-600">
                              Clear all selections
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {selectedMistakes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {selectedMistakes.map((mistake) => (
                            <Badge key={mistake} variant="destructive" className="text-xs">
                              {mistake}
                              <button
                                type="button"
                                onClick={() => handleMistakeToggle(mistake)}
                                className="ml-1 hover:bg-red-700 rounded-full w-3 h-3 flex items-center justify-center"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={closeDialogs}>
              Cancel
            </Button>
            <Button onClick={handleAddTrade}>Add Trade</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Trade Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Trade</DialogTitle>
            <DialogDescription>Update trade details</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-symbol">Symbol *</Label>
                  <Input
                    id="edit-symbol"
                    placeholder="AAPL"
                    value={formData.symbol || ""}
                    onChange={(e) => handleInputChange("symbol", e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Long">Long</SelectItem>
                      <SelectItem value="Short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-entryMode">Entry Mode</Label>
                  <Select value={entryMode} onValueChange={(value: "detailed" | "pnl") => setEntryMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detailed">Detailed (Shares & Prices)</SelectItem>
                      <SelectItem value="pnl">P&L Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-entryDate">Entry Date *</Label>
                  <Input
                    id="edit-entryDate"
                    type="date"
                    value={formData.entryDate || ""}
                    onChange={(e) => handleInputChange("entryDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-entryTime">Entry Time *</Label>
                  <Input
                    id="edit-entryTime"
                    type="time"
                    value={formData.entryTime || ""}
                    onChange={(e) => handleInputChange("entryTime", e.target.value)}
                  />
                </div>
              </div>

              {formData.status === "Closed" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-exitDate">Exit Date</Label>
                    <Input
                      id="edit-exitDate"
                      type="date"
                      value={formData.exitDate || ""}
                      onChange={(e) => handleInputChange("exitDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-exitTime">Exit Time</Label>
                    <Input
                      id="edit-exitTime"
                      type="time"
                      value={formData.exitTime || ""}
                      onChange={(e) => handleInputChange("exitTime", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {entryMode === "detailed" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-shares">Shares *</Label>
                      <Input
                        id="edit-shares"
                        type="number"
                        placeholder="100"
                        value={formData.shares || ""}
                        onChange={(e) => handleInputChange("shares", Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-entryPrice">Entry Price *</Label>
                      <Input
                        id="edit-entryPrice"
                        type="number"
                        step="0.01"
                        placeholder="150.00"
                        value={formData.entryPrice || ""}
                        onChange={(e) => handleInputChange("entryPrice", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {formData.status === "Closed" && (
                    <div>
                      <Label htmlFor="edit-exitPrice">Exit Price</Label>
                      <Input
                        id="edit-exitPrice"
                        type="number"
                        step="0.01"
                        placeholder="155.00"
                        value={formData.exitPrice || ""}
                        onChange={(e) => handleInputChange("exitPrice", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  )}
                </>
              ) : (
                formData.status === "Closed" && (
                  <div>
                    <Label htmlFor="edit-pnl">P&L *</Label>
                    <Input
                      id="edit-pnl"
                      type="number"
                      step="0.01"
                      placeholder="325.00"
                      value={formData.pnl || ""}
                      onChange={(e) => handleInputChange("pnl", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )
              )}

              <div>
                <Label htmlFor="edit-strategy">Strategy</Label>
                <Input
                  id="edit-strategy"
                  placeholder="Swing Trade, Day Trade, etc."
                  value={formData.strategy || ""}
                  onChange={(e) => handleInputChange("strategy", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Trade reasoning, setup, lessons learned..."
                  value={formData.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </div>

              {/* Psychology Tracking with Dropdowns */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">Trading Psychology (Optional)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmotionsMistakes(!showEmotionsMistakes)}
                  >
                    {showEmotionsMistakes ? "Hide" : "Show"} Psychology Tracking
                  </Button>
                </div>

                {showEmotionsMistakes && (
                  <div className="space-y-4">
                    {/* Emotion Dropdown */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">How did you feel during this trade?</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between bg-transparent">
                            <div className="flex items-center gap-2">
                              <Brain className="h-4 w-4" />
                              {selectedEmotion
                                ? EMOTIONS.find((e) => e.value === selectedEmotion)?.label
                                : "Select emotion"}
                            </div>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          {EMOTIONS.map((emotion) => (
                            <DropdownMenuItem
                              key={emotion.value}
                              onClick={() => handleEmotionSelect(emotion.value)}
                              className="flex items-center gap-2"
                            >
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emotion.color }} />
                              {emotion.label}
                              {selectedEmotion === emotion.value && <span className="ml-auto">✓</span>}
                            </DropdownMenuItem>
                          ))}
                          {selectedEmotion && (
                            <DropdownMenuItem onClick={() => setSelectedEmotion("")} className="text-red-600">
                              Clear selection
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Mistakes Dropdown */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        What mistakes were made? (Select multiple)
                      </Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between bg-transparent">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              {selectedMistakes.length > 0
                                ? `${selectedMistakes.length} mistake${selectedMistakes.length !== 1 ? "s" : ""} selected`
                                : "Select mistakes"}
                            </div>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                          {MISTAKES.map((mistake) => (
                            <DropdownMenuItem
                              key={mistake}
                              onClick={() => handleMistakeToggle(mistake)}
                              className="flex items-center gap-2"
                            >
                              <div className="w-4 h-4 flex items-center justify-center">
                                {selectedMistakes.includes(mistake) && <span className="text-orange-600">✓</span>}
                              </div>
                              <span className="text-xs">{mistake}</span>
                            </DropdownMenuItem>
                          ))}
                          {selectedMistakes.length > 0 && (
                            <DropdownMenuItem onClick={() => setSelectedMistakes([])} className="text-red-600">
                              Clear all selections
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {selectedMistakes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {selectedMistakes.map((mistake) => (
                            <Badge key={mistake} variant="destructive" className="text-xs">
                              {mistake}
                              <button
                                type="button"
                                onClick={() => handleMistakeToggle(mistake)}
                                className="ml-1 hover:bg-red-700 rounded-full w-3 h-3 flex items-center justify-center"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={closeDialogs}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTrade}>Update Trade</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
