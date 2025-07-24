"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface Trade {
  id: string
  entryDate: string
  status: string
}

interface TradingHeatmapProps {
  trades: Trade[]
}

interface DayData {
  date: string
  count: number
  level: number
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Orange color levels - darker = more trades
const COLOR_LEVELS = [
  "#FEF3E2", // Level 0 - very light orange (no trades)
  "#FED7AA", // Level 1 - light orange (1-2 trades)
  "#FDBA74", // Level 2 - medium light orange (3-4 trades)
  "#FB923C", // Level 3 - medium orange (5-6 trades)
  "#F97316", // Level 4 - bright orange (7-8 trades)
  "#EA580C", // Level 5 - dark orange (9+ trades)
]

export default function TradingHeatmap({ trades }: TradingHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Get current year
    const currentYear = new Date().getFullYear()

    // Count trades per day
    const tradeCounts: Record<string, number> = {}
    trades.forEach((trade) => {
      const tradeDate = new Date(trade.entryDate)
      if (tradeDate.getFullYear() === currentYear) {
        const dateKey = trade.entryDate
        tradeCounts[dateKey] = (tradeCounts[dateKey] || 0) + 1
      }
    })

    // Generate all days for the current year
    const startDate = new Date(currentYear, 0, 1)
    const endDate = new Date(currentYear, 11, 31)
    const days: DayData[] = []

    // Find the Sunday before the start date to align the grid
    const firstSunday = new Date(startDate)
    firstSunday.setDate(startDate.getDate() - startDate.getDay())

    // Generate weeks until we cover the entire year
    const currentDate = new Date(firstSunday)
    while (currentDate <= endDate || days.length < 371) {
      const dateString = currentDate.toISOString().split("T")[0]
      const count = tradeCounts[dateString] || 0

      // Determine color level based on trade count
      let level = 0
      if (count === 0) level = 0
      else if (count <= 2) level = 1
      else if (count <= 4) level = 2
      else if (count <= 6) level = 3
      else if (count <= 8) level = 4
      else level = 5

      days.push({
        date: dateString,
        count,
        level,
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }, [trades])

  // Group days into weeks
  const weeks = useMemo(() => {
    const weekGroups: DayData[][] = []
    for (let i = 0; i < heatmapData.length; i += 7) {
      weekGroups.push(heatmapData.slice(i, i + 7))
    }
    return weekGroups
  }, [heatmapData])

  // Calculate total trades for current year
  const totalTrades = useMemo(() => {
    return heatmapData.reduce((sum, day) => sum + day.count, 0)
  }, [heatmapData])

  // Get month labels for the grid
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = []
    const currentYear = new Date().getFullYear()

    for (let month = 0; month < 12; month++) {
      const firstDayOfMonth = new Date(currentYear, month, 1)
      const firstSunday = new Date(currentYear, 0, 1)
      firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay())

      const daysDiff = Math.floor((firstDayOfMonth.getTime() - firstSunday.getTime()) / (1000 * 60 * 60 * 24))
      const weekIndex = Math.floor(daysDiff / 7)

      if (weekIndex >= 0 && weekIndex < weeks.length) {
        labels.push({
          month: MONTHS[month],
          weekIndex,
        })
      }
    }

    return labels
  }, [weeks])

  const formatTooltip = (day: DayData) => {
    const date = new Date(day.date)
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    if (day.count === 0) {
      return `No trades on ${dateStr}`
    } else if (day.count === 1) {
      return `1 trade on ${dateStr}`
    } else {
      return `${day.count} trades on ${dateStr}`
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-600" />
          Trading Activity
        </CardTitle>
        <CardDescription>
          {totalTrades} trades in {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Month labels */}
          <div className="flex items-start">
            <div className="w-8"></div> {/* Space for day labels */}
            <div className="flex-1 relative">
              <div className="flex" style={{ gap: "2px" }}>
                {monthLabels.map((label, index) => (
                  <div
                    key={index}
                    className="text-xs text-muted-foreground font-medium"
                    style={{
                      position: "absolute",
                      left: `${label.weekIndex * 12}px`,
                      minWidth: "24px",
                    }}
                  >
                    {label.month}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="flex items-start gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] pt-4">
              {DAYS.map((day, index) => (
                <div key={day} className="text-xs text-muted-foreground h-[10px] flex items-center">
                  {index === 1 || index === 3 || index === 5 ? day : ""}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-[2px] pt-4">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="w-[10px] h-[10px] rounded-sm cursor-pointer hover:ring-1 hover:ring-orange-400 transition-all"
                      style={{
                        backgroundColor: COLOR_LEVELS[day.level],
                      }}
                      title={formatTooltip(day)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span>Less</span>
            <div className="flex items-center gap-1">
              {COLOR_LEVELS.map((color, index) => (
                <div key={index} className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: color }} />
              ))}
            </div>
            <span>More</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Most active day: {Math.max(...heatmapData.map((d) => d.count))} trades</span>
            <span>
              Trading days: {heatmapData.filter((d) => d.count > 0).length} of {heatmapData.length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
