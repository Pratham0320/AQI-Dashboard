"use client"

import { useRef } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"
import type { ForecastData } from "../lib/api"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface ForecastChartProps {
  data: ForecastData[]
  city: string
}

export default function ForecastChart({ data, city }: ForecastChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null)

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Air Quality Index - ${city}`,
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "AQI Value",
        },
        min: 0,
        max: 300,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  }

  const chartData = {
    labels: data.map((item) => {
      const date = new Date(item.date)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }),
    datasets: [
      {
        label: "Forecast",
        data: [...Array(data.length - 3).fill(null), ...data.slice(-4).map((item) => item.aqi)],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        pointBackgroundColor: "rgb(16, 185, 129)",
        pointBorderColor: "rgb(16, 185, 129)",
        pointRadius: 4,
        borderDash: [5, 5],
      },
    ],
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="text-center text-gray-500">
          <p>No forecast data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="h-80">
        <Line ref={chartRef} options={options} data={chartData} />
      </div>
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>Forecast (3 days)</p>
      </div>
    </div>
  )
}
