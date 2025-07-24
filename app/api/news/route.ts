import { type NextRequest, NextResponse } from "next/server"

interface NewsAPIResponse {
  status: string
  totalResults: number
  articles: Array<{
    source: {
      id: string | null
      name: string
    }
    author: string | null
    title: string
    description: string | null
    url: string
    urlToImage: string | null
    publishedAt: string
    content: string | null
  }>
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const apiKey = searchParams.get("apiKey")
  const category = searchParams.get("category")
  const query = searchParams.get("q")
  const country = searchParams.get("country") || "us"
  const pageSize = searchParams.get("pageSize") || "10"

  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 })
  }

  try {
    let url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&pageSize=${pageSize}`

    if (query) {
      // Use everything endpoint for search queries
      url = `https://newsapi.org/v2/everything?apiKey=${apiKey}&q=${encodeURIComponent(query)}&pageSize=${pageSize}&sortBy=publishedAt&language=en`
    } else if (category) {
      url += `&category=${category}&country=${country}`
    } else {
      url += `&country=${country}`
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "NewsAPI-Proxy/1.0",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.message || "Failed to fetch news" }, { status: response.status })
    }

    const data: NewsAPIResponse = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("NewsAPI proxy error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
