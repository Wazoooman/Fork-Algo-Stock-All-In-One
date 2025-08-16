import { type NextRequest, NextResponse } from "next/server"

interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  category: string
  image?: string
}

interface RSSFeed {
  url: string
  source: string
  category: string[]
}

// Comprehensive RSS feed list organized by category
const RSS_FEEDS: RSSFeed[] = [
  // General Financial News
  { url: "https://feeds.reuters.com/reuters/businessNews", source: "Reuters", category: ["general", "business"] },
  { url: "https://feeds.bloomberg.com/markets/news.rss", source: "Bloomberg", category: ["general", "business"] },
  {
    url: "https://feeds.marketwatch.com/marketwatch/topstories/",
    source: "MarketWatch",
    category: ["general", "company"],
  },
  {
    url: "https://feeds.finance.yahoo.com/rss/2.0/headline",
    source: "Yahoo Finance",
    category: ["general", "company"],
  },
  { url: "http://rss.cnn.com/rss/money_latest.rss", source: "CNN Money", category: ["general", "business"] },
  {
    url: "https://feeds.wsj.com/wsj/xml/rss/3_7085.xml",
    source: "Wall Street Journal",
    category: ["general", "business"],
  },
  { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", source: "CNBC", category: ["general", "business"] },
  { url: "https://feeds.feedburner.com/zerohedge/feed", source: "ZeroHedge", category: ["general", "business"] },
  { url: "https://feeds.feedburner.com/benzinga", source: "Benzinga", category: ["general", "company"] },
  {
    url: "https://feeds.feedburner.com/InvestingcomAnalysis",
    source: "Investing.com",
    category: ["general", "company"],
  },

  // Business News
  { url: "https://fortune.com/feed/", source: "Fortune", category: ["business"] },
  {
    url: "https://feeds.feedburner.com/fastcompany/headlines",
    source: "Fast Company",
    category: ["business", "technology"],
  },
  { url: "https://feeds.feedburner.com/entrepreneur/latest", source: "Entrepreneur", category: ["business"] },
  {
    url: "http://feeds.businessinsider.com/~r/businessinsider/~3",
    source: "Business Insider",
    category: ["business", "technology"],
  },
  { url: "https://hbr.org/feed", source: "Harvard Business Review", category: ["business"] },
  { url: "https://feeds.feedburner.com/inc/headlines", source: "Inc.com", category: ["business"] },
  { url: "https://feeds.feedburner.com/venturebeat/SZYF", source: "VentureBeat", category: ["business", "technology"] },
  { url: "https://feeds.feedburner.com/crunchbase-news", source: "Crunchbase", category: ["business", "technology"] },

  // Technology News
  { url: "https://feeds.feedburner.com/TechCrunch/", source: "TechCrunch", category: ["technology"] },
  { url: "http://feeds.arstechnica.com/arstechnica/index/", source: "Ars Technica", category: ["technology"] },
  { url: "https://feeds.feedburner.com/venturebeat/SZYF", source: "VentureBeat", category: ["technology"] },
  { url: "http://feeds.mashable.com/Mashable", source: "Mashable", category: ["technology"] },
  { url: "https://www.wired.com/feed/rss", source: "Wired", category: ["technology"] },
  { url: "https://feeds.feedburner.com/TheNextWeb", source: "The Next Web", category: ["technology"] },
  {
    url: "https://feeds.feedburner.com/techcrunch/startups",
    source: "TechCrunch Startups",
    category: ["technology", "business"],
  },
  { url: "https://feeds.feedburner.com/TechCrunchIT", source: "TechCrunch Main", category: ["technology"] },

  // Company/Stock News
  { url: "https://www.fool.com/feeds/index.aspx", source: "Motley Fool", category: ["company"] },
  { url: "https://investorplace.com/feed/", source: "InvestorPlace", category: ["company"] },
  { url: "https://www.thestreet.com/.rss/full/", source: "TheStreet", category: ["company"] },
  { url: "https://feeds.barrons.com/public/rss/barrons_news", source: "Barrons", category: ["company"] },
  { url: "https://feeds.feedburner.com/seekingalpha/feed", source: "Seeking Alpha", category: ["company"] },
  { url: "https://feeds.feedburner.com/GuruFocus", source: "GuruFocus", category: ["company"] },
  { url: "https://feeds.feedburner.com/StockNews", source: "StockNews", category: ["company"] },
  { url: "https://feeds.feedburner.com/247wallst", source: "24/7 Wall St", category: ["company"] },

  // Cryptocurrency News
  { url: "https://feeds.feedburner.com/CoinDesk", source: "CoinDesk", category: ["crypto"] },
  { url: "https://cointelegraph.com/rss", source: "CoinTelegraph", category: ["crypto"] },
  { url: "https://bitcoinmagazine.com/.rss/full/", source: "Bitcoin Magazine", category: ["crypto"] },
  { url: "https://www.newsbtc.com/feed/", source: "NewsBTC", category: ["crypto"] },
  { url: "https://cryptoslate.com/feed/", source: "CryptoSlate", category: ["crypto"] },
  { url: "https://decrypt.co/feed", source: "Decrypt", category: ["crypto"] },
  { url: "https://coingape.com/feed/", source: "CoinGape", category: ["crypto"] },
  { url: "https://coinjournal.net/feed/", source: "CoinJournal", category: ["crypto"] },
  { url: "https://cryptonews.com/news/feed/", source: "CryptoNews", category: ["crypto"] },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", source: "CoinDesk Markets", category: ["crypto"] },

  // Forex News
  { url: "https://www.forexlive.com/feed/news", source: "ForexLive", category: ["forex"] },
  { url: "https://www.fxstreet.com/rss/news", source: "FXStreet", category: ["forex"] },
  { url: "https://www.dailyfx.com/feeds/market-news", source: "DailyFX", category: ["forex"] },
  { url: "https://www.babypips.com/feed", source: "BabyPips", category: ["forex"] },
  { url: "https://www.forexfactory.com/rss.php", source: "Forex Factory", category: ["forex"] },
  { url: "https://www.forex.com/en/rss/market-news/", source: "Forex.com", category: ["forex"] },
  { url: "https://www.forexcrunch.com/feed/", source: "Forex Crunch", category: ["forex"] },
  { url: "https://www.actionforex.com/rss/", source: "Action Forex", category: ["forex"] },
]

async function fetchWithRedirect(url: string, opts: RequestInit = {}, maxRedirects = 3): Promise<Response> {
  let currentUrl = url
  let redirects = 0

  while (redirects <= maxRedirects) {
    const res = await fetch(currentUrl, { redirect: "manual", ...opts })

    // Normal success
    if (res.status < 300 || res.status > 399) return res

    // Handle redirect
    const location = res.headers.get("location")
    if (!location) return res // no Location header – give up

    currentUrl = location.startsWith("http") ? location : new URL(location, currentUrl).href
    redirects++
  }

  // Exceeded redirects – return last response
  return await fetch(currentUrl, { ...opts, redirect: "manual" })
}

async function fetchRSSFeed(feed: RSSFeed, timeout = 10000): Promise<RSSItem[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    /* CHANGED: use fetchWithRedirect instead of fetch */
    const response = await fetchWithRedirect(feed.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsAggregator/1.0)",
        Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const xmlText = await response.text()
    const items = parseRSSXML(xmlText, feed.source)

    return items.map((item) => ({
      ...item,
      source: feed.source,
      category: feed.category[0],
    }))
  } catch (error) {
    console.error(`Failed to fetch RSS from ${feed.source}:`, error)
    return []
  }
}

function parseRSSXML(xmlText: string, source: string): RSSItem[] {
  const items: RSSItem[] = []

  try {
    // Clean up the XML text more thoroughly
    const cleanXML = xmlText
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[a-fA-F0-9]+);)/g, "&amp;")

    // Extract items using regex (more reliable than XML parsing in edge runtime)
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
    const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi

    let matches = [...cleanXML.matchAll(itemRegex)]
    if (matches.length === 0) {
      matches = [...cleanXML.matchAll(entryRegex)]
    }

    for (const match of matches.slice(0, 8)) {
      const itemXML = match[1]

      const title = extractTextContent(itemXML, ["title"])
      let description = extractTextContent(itemXML, ["description", "summary", "content", "content:encoded"])

      // If description is empty or too short, try to extract from content
      if (!description || description.length < 50) {
        const contentMatch = itemXML.match(/<content[^>]*>([\s\S]*?)<\/content>/i)
        if (contentMatch) {
          description = contentMatch[1]
        }
      }

      const link = extractTextContent(itemXML, ["link", "guid"])
      const pubDate = extractTextContent(itemXML, ["pubDate", "published", "updated"])

      // Extract image
      let image = extractTextContent(itemXML, ["media:thumbnail", "enclosure"])
      if (!image) {
        const imgMatch = itemXML.match(/<img[^>]+src=["']([^"']+)["']/i)
        if (imgMatch) image = imgMatch[1]
      }

      if (title && link) {
        // Clean and validate description
        const cleanedDescription = cleanText(description)
        const finalDescription = cleanedDescription.length > 20 ? cleanedDescription : cleanText(title)

        items.push({
          title: cleanText(title),
          description: finalDescription,
          link: cleanText(link),
          pubDate: pubDate || new Date().toISOString(),
          source,
          category: "",
          image: image ? cleanText(image) : undefined,
        })
      }
    }
  } catch (error) {
    console.error(`Error parsing RSS XML from ${source}:`, error)
  }

  return items
}

function extractTextContent(xml: string, tags: string[]): string {
  for (const tag of tags) {
    // Try regular tags first
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i")
    const match = xml.match(regex)
    if (match && match[1].trim()) {
      return match[1].trim()
    }

    // Try self-closing tags with url attribute
    const selfClosingRegex = new RegExp(`<${tag}[^>]*url=["']([^"']+)["']`, "i")
    const selfClosingMatch = xml.match(selfClosingRegex)
    if (selfClosingMatch) {
      return selfClosingMatch[1]
    }

    // Try href attribute for links
    const hrefRegex = new RegExp(`<${tag}[^>]*href=["']([^"']+)["']`, "i")
    const hrefMatch = xml.match(hrefRegex)
    if (hrefMatch) {
      return hrefMatch[1]
    }
  }
  return ""
}

function cleanText(text: string): string {
  if (!text) return ""

  const cleaned = text
    // Remove CDATA sections
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    // Remove script and style tags completely
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/(script|style)>/gi, "")
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    // Decode HTML entities
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "...")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&#x([a-fA-F0-9]+);/g, (match, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .replace(/property=["'][^"']*["']/g, "")
    .replace(/class=["'][^"']*["']/g, "")
    .replace(/id=["'][^"']*["']/g, "")
    // Remove leading/trailing whitespace
    .trim()
    // Limit length to prevent overly long descriptions
    .substring(0, 500)

  if (cleaned.includes(">")) {
    return ""
  }

  return cleaned
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || "general"
  const limit = Number.parseInt(searchParams.get("limit") || "20")

  try {
    // Filter feeds by category
    const relevantFeeds = RSS_FEEDS.filter((feed) => feed.category.includes(category))

    console.log(`Fetching ${relevantFeeds.length} RSS feeds for category: ${category}`)

    // Fetch all feeds concurrently
    const feedPromises = relevantFeeds.map((feed) => fetchRSSFeed(feed))
    const feedResults = await Promise.all(feedPromises)

    // Combine and sort all articles
    const allArticles = feedResults.flat()
    const sortedArticles = allArticles
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, limit)

    // Get unique sources
    const sources = [...new Set(allArticles.map((article) => article.source))]

    const response = {
      status: "ok",
      totalResults: sortedArticles.length,
      articles: sortedArticles,
      sources,
      feedsAttempted: relevantFeeds.length,
      feedsSuccessful: feedResults.filter((result) => result.length > 0).length,
    }

    console.log(
      `Category: ${category}, Feeds: ${response.feedsAttempted}, Successful: ${response.feedsSuccessful}, Articles: ${response.totalResults}`,
    )

    return NextResponse.json(response)
  } catch (error) {
    console.error("RSS aggregation error:", error)
    return NextResponse.json(
      {
        status: "error",
        error: "Failed to fetch RSS feeds",
        articles: [],
        sources: [],
        feedsAttempted: 0,
        feedsSuccessful: 0,
      },
      { status: 500 },
    )
  }
}
