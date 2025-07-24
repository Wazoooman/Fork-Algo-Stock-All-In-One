"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface ChartData {
  name: string
  value: number
  color: string
}

interface ChartComponentsProps {
  data: ChartData[]
  type: "emotion" | "mistake"
  size?: {
    width: number
    height: number
    innerRadius: number
    outerRadius: number
  }
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-background border rounded-lg p-2 shadow-lg">
        <p className="text-sm font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {data.value} {data.value === 1 ? "trade" : "trades"}
        </p>
      </div>
    )
  }
  return null
}

export default function ChartComponents({ data, type, size }: ChartComponentsProps) {
  const defaultSize = {
    width: 200,
    height: 200,
    innerRadius: 40,
    outerRadius: 80,
  }

  const chartSize = size || defaultSize

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <p className="text-sm">No data available</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      <ResponsiveContainer width={chartSize.width} height={chartSize.height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={chartSize.innerRadius}
            outerRadius={chartSize.outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
