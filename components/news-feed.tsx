"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Newspaper,
  Search,
  Filter,
  ExternalLink,
  Clock,
  TrendingUp,
  RefreshCw,
  Globe,
  Building,
  DollarSign,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Rss,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface NewsArticle {
  id: string
  headline: string
  summary: string
  source: string
  category: string
  datetime: number
  image?: string
  url: string
  related?: string
  sentiment?: "positive" | "negative" | "neutral"
  provider: "rss" | "demo"
}

interface MarketNews {
  general: NewsArticle[]
  company: NewsArticle[]
  crypto: NewsArticle[]
  forex: NewsArticle[]
  technology: NewsArticle[]
  business: NewsArticle[]
}

interface RSSResponse {
  status: string
  totalResults: number
  articles: Array<{
    title: string
    description: string
    link: string
    pubDate: string
    source: string
    category: string
    image?: string
  }>
  sources: string[]
  feedsAttempted?: number
  feedsSuccessful?: number
}

interface NotificationState {
  show: boolean
  message: string
  type: "success" | "error" | "info" | "warning"
}

export default function NewsFeed() {
  const [news, setNews] = useState<MarketNews>({
    general: [],
    company: [],
    crypto: [],
    forex: [],
    technology: [],
    business: [],
  })
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("general")

  // RSS Configuration
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // minutes
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [connectedSources, setConnectedSources] = useState<string[]>([])
  const [feedStats, setFeedStats] = useState<{ attempted: number; successful: number }>({ attempted: 0, successful: 0 })
  const [configOpen, setConfigOpen] = useState(false)

  // Notification system
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: "",
    type: "info",
  })

  const showNotification = (message: string, type: NotificationState["type"] = "info") => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }))
    }, 5000)
  }

  // Sample news data for demo/fallback
  const sampleNews: MarketNews = {
    general: [
      {
        id: "demo-1",
        headline: "Federal Reserve Signals Potential Rate Cuts in 2024",
        summary:
          "Fed officials hint at possible interest rate reductions as inflation shows signs of cooling, potentially boosting market sentiment.",
        source: "Reuters",
        category: "Economy",
        datetime: Date.now() - 3600000,
        url: "#",
        sentiment: "positive",
        provider: "demo",
      },
      {
        id: "demo-2",
        headline: "Tech Stocks Rally on AI Optimism",
        summary:
          "Major technology companies see significant gains as investors remain bullish on artificial intelligence developments and adoption.",
        source: "Bloomberg",
        category: "Technology",
        datetime: Date.now() - 7200000,
        url: "#",
        sentiment: "positive",
        provider: "demo",
      },
    ],
    company: [
      {
        id: "demo-3",
        headline: "Apple Reports Strong iPhone Sales in Q4",
        summary:
          "Apple Inc. beats earnings expectations with robust iPhone 15 sales, driving revenue growth despite economic headwinds.",
        source: "MarketWatch",
        category: "Earnings",
        datetime: Date.now() - 14400000,
        url: "#",
        related: "AAPL",
        sentiment: "positive",
        provider: "demo",
      },
    ],
    crypto: [
      {
        id: "demo-4",
        headline: "Bitcoin Breaks Above $45,000 Resistance",
        summary:
          "Bitcoin surges past key resistance level as institutional adoption continues and regulatory clarity improves.",
        source: "CoinDesk",
        category: "Cryptocurrency",
        datetime: Date.now() - 21600000,
        url: "#",
        sentiment: "positive",
        provider: "demo",
      },
    ],
    forex: [
      {
        id: "demo-5",
        headline: "Dollar Weakens Against Major Currencies",
        summary:
          "US Dollar index falls as investors anticipate potential Fed policy changes, benefiting EUR and GBP pairs.",
        source: "ForexLive",
        category: "Forex",
        datetime: Date.now() - 25200000,
        url: "#",
        sentiment: "neutral",
        provider: "demo",
      },
    ],
    technology: [
      {
        id: "demo-6",
        headline: "Microsoft Unveils New AI-Powered Office Features",
        summary:
          "Microsoft announces integration of advanced AI capabilities across Office suite, enhancing productivity tools.",
        source: "TechCrunch",
        category: "Technology",
        datetime: Date.now() - 28800000,
        url: "#",
        sentiment: "positive",
        provider: "demo",
      },
    ],
    business: [
      {
        id: "demo-7",
        headline: "Global Supply Chain Disruptions Ease",
        summary:
          "International shipping costs decline as supply chain bottlenecks show signs of improvement worldwide.",
        source: "Wall Street Journal",
        category: "Business",
        datetime: Date.now() - 32400000,
        url: "#",
        sentiment: "positive",
        provider: "demo",
      },
    ],
  }

  useEffect(() => {
    // Load initial data
    refreshNews()
  }, [])

  useEffect(() => {
    // Set up auto-refresh interval
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(
        () => {
          refreshNews()
        },
        refreshInterval * 60 * 1000,
      ) // Convert minutes to milliseconds

      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const fetchRSSNews = async (category: string) => {
    try {
      const response = await fetch(`/api/rss-news?category=${category}&limit=40`)
      const data: RSSResponse = await response.json()

      if (response.ok && data.status === "ok") {
        return {
          articles: data.articles.map((article, index) => ({
            id: `rss-${category}-${index}-${Date.now()}`,
            headline: article.title,
            summary: article.description,
            source: article.source,
            category: category.charAt(0).toUpperCase() + category.slice(1),
            datetime: new Date(article.pubDate).getTime(),
            image: article.image,
            url: article.link,
            sentiment: "neutral" as const,
            provider: "rss" as const,
          })),
          stats: {
            attempted: data.feedsAttempted || 0,
            successful: data.feedsSuccessful || 0,
          },
        }
      } else {
        console.error(`RSS fetch error for ${category}:`, data)
      }
    } catch (error) {
      console.error(`Error fetching RSS news for ${category}:`, error)
    }
    return { articles: [], stats: { attempted: 0, successful: 0 } }
  }

  const refreshNews = async () => {
    setLoading(true)
    try {
      const categories = ["general", "company", "crypto", "forex", "technology", "business"]
      const newNews: MarketNews = {
        general: [],
        company: [],
        crypto: [],
        forex: [],
        technology: [],
        business: [],
      }

      let hasRealData = false
      const allSources: string[] = []
      let totalAttempted = 0
      let totalSuccessful = 0

      // Fetch RSS data for each category
      for (const category of categories) {
        const result = await fetchRSSNews(category)

        if (result.articles.length > 0) {
          newNews[category as keyof MarketNews] = result.articles
          hasRealData = true
          allSources.push(...result.articles.map((article) => article.source))
          totalAttempted += result.stats.attempted
          totalSuccessful += result.stats.successful
        } else {
          // Use sample data as fallback
          newNews[category as keyof MarketNews] = sampleNews[category as keyof MarketNews] || []
        }

        // Small delay to be respectful to RSS servers
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      setNews(newNews)
      setConnectedSources([...new Set(allSources)])
      setFeedStats({ attempted: totalAttempted, successful: totalSuccessful })
      setLastUpdate(new Date().toLocaleTimeString())

      if (hasRealData) {
        const uniqueSources = [...new Set(allSources)]
        showNotification(
          `News updated! ${uniqueSources.length} sources active (${totalSuccessful}/${totalAttempted} feeds working)`,
          "success",
        )
      } else {
        showNotification("Showing demo data. RSS feeds may be temporarily unavailable.", "info")
      }
    } catch (error) {
      console.error("Error refreshing RSS news:", error)
      showNotification("Error refreshing news. Using cached data.", "error")
      // Keep existing data on error
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ago`
    } else if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return "Just now"
    }
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-50 dark:bg-green-950"
      case "negative":
        return "text-red-600 bg-red-50 dark:bg-red-950"
      default:
        return "text-blue-600 bg-blue-50 dark:bg-blue-950"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "general":
        return <Globe className="h-4 w-4" />
      case "company":
      case "business":
        return <Building className="h-4 w-4" />
      case "crypto":
        return <DollarSign className="h-4 w-4" />
      case "forex":
        return <TrendingUp className="h-4 w-4" />
      case "technology":
        return <Settings className="h-4 w-4" />
      default:
        return <Newspaper className="h-4 w-4" />
    }
  }

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case "rss":
        return (
          <Badge variant="outline" className="text-orange-600">
            <Rss className="h-3 w-3 mr-1" />
            RSS
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-gray-600">
            Demo
          </Badge>
        )
    }
  }

  const getNotificationIcon = (type: NotificationState["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "error":
        return <XCircle className="h-4 w-4" />
      case "warning":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: NotificationState["type"]) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
      case "error":
        return "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200"
      default:
        return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
    }
  }

  const currentNews = news[selectedCategory as keyof MarketNews] || []
  const filteredNews = currentNews.filter(
    (article) =>
      article.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.source.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const hasLiveData = connectedSources.length > 0

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification.show && (
        <Alert className={`${getNotificationColor(notification.type)} transition-all duration-300`}>
          {getNotificationIcon(notification.type)}
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Newspaper className="h-8 w-8" />
            Market News Feed
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time financial news from 50+ RSS feeds - completely free and unlimited
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${hasLiveData ? "bg-green-500" : "bg-gray-400"}`} />
            <span className="text-sm">
              {hasLiveData ? `Live RSS (${connectedSources.length} sources)` : "Demo Mode"}
              {lastUpdate && <span className="text-muted-foreground ml-2">({lastUpdate})</span>}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={refreshNews} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* RSS Configuration - Now Collapsible */}
      <Card>
        <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Rss className="h-5 w-5" />
                  <CardTitle>RSS Feed Configuration</CardTitle>
                  <Badge variant="outline" className="text-green-600">
                    {feedStats.successful}/{feedStats.attempted} Active
                  </Badge>
                </div>
                {configOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
              <CardDescription>
                Configure automatic news updates from 50+ RSS feeds - no API keys required!
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Auto Refresh Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                    <Label htmlFor="auto-refresh" className="font-medium">
                      Auto Refresh News
                    </Label>
                    {autoRefresh ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {autoRefresh ? `Every ${refreshInterval} minutes` : "Manual only"}
                  </span>
                </div>

                {autoRefresh && (
                  <div className="flex items-center gap-4">
                    <Label htmlFor="refresh-interval" className="text-sm">
                      Refresh Interval:
                    </Label>
                    <Select
                      value={refreshInterval.toString()}
                      onValueChange={(value) => setRefreshInterval(Number.parseInt(value))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* RSS Feed Statistics */}
              <div className="space-y-2">
                <Label className="font-medium">RSS Feed Status:</Label>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-blue-600">
                      {feedStats.attempted} Feeds Attempted
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      {feedStats.successful} Working
                    </Badge>
                    {feedStats.attempted > 0 && (
                      <Badge variant="outline" className="text-orange-600">
                        {Math.round((feedStats.successful / feedStats.attempted) * 100)}% Success Rate
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* RSS Sources Status */}
              <div className="space-y-2">
                <Label className="font-medium">Active RSS Sources ({connectedSources.length}):</Label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {connectedSources.length > 0 ? (
                    connectedSources.map((source) => (
                      <Badge key={source} variant="outline" className="text-green-600">
                        <Rss className="h-3 w-3 mr-1" />
                        {source}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-gray-600">
                      No live sources (using demo data)
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 50+ RSS feeds from major financial news sources</p>
                <p>• Sources include: Reuters, Bloomberg, MarketWatch, CoinDesk, TechCrunch, and many more</p>
                <p>• Each category targets 25+ articles from multiple specialized feeds</p>
                <p>• Completely free with no API limits or restrictions</p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search news by headline, content, or source..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Market</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="company">Company News</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                <SelectItem value="forex">Forex</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* News Categories Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="technology" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Tech
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Companies
          </TabsTrigger>
          <TabsTrigger value="crypto" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Crypto
          </TabsTrigger>
          <TabsTrigger value="forex" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Forex
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(selectedCategory)}
                {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} News
              </CardTitle>
              <CardDescription>
                {filteredNews.length} of {currentNews.length} articles shown
                {hasLiveData && <span className="ml-2">• Live RSS feeds from {connectedSources.length} sources</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredNews.length === 0 ? (
                <div className="text-center py-12">
                  <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {currentNews.length === 0
                      ? `No ${selectedCategory} news available. RSS feeds may be loading...`
                      : "No articles match your search criteria."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNews.map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline">{article.source}</Badge>
                              <Badge variant="outline">{article.category}</Badge>
                              {getProviderBadge(article.provider)}
                              {article.related && <Badge variant="secondary">{article.related}</Badge>}
                              {article.sentiment && (
                                <Badge className={getSentimentColor(article.sentiment)}>{article.sentiment}</Badge>
                              )}
                            </div>

                            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{article.headline}</h3>

                            <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{article.summary}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {formatTimeAgo(article.datetime)}
                              </div>

                              <Button variant="outline" size="sm" asChild>
                                <a href={article.url} target="_blank" rel="noopener noreferrer">
                                  Read More
                                  <ExternalLink className="h-4 w-4 ml-2" />
                                </a>
                              </Button>
                            </div>
                          </div>

                          {article.image && (
                            <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0">
                              <img
                                src={article.image || "/placeholder.svg"}
                                alt=""
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
