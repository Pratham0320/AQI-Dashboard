"use client"

import type { AQIData } from "../lib/api"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface AQICardProps {
  data: AQIData | null
}

export default function AQICard({ data }: AQICardProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="text-center text-gray-500">
          <p>Enter a city name to check air quality</p>
        </div>
      </div>
    )
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Good":
        return "bg-green-100 text-green-800 border-green-200"
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Unhealthy for Sensitive Groups":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Unhealthy":
        return "bg-red-100 text-red-800 border-red-200"
      case "Very Unhealthy":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Hazardous":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Good":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "Moderate":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{data.city}</h2>
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getCategoryColor(data.category)}`}
        >
          {getCategoryIcon(data.category)}
          <span className="font-semibold">{data.category}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">{data.aqi}</div>
          <div className="text-sm text-gray-600">AQI</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">{data.pm25}</div>
          <div className="text-sm text-gray-600">PM2.5 (μg/m³)</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-1">{data.pm10}</div>
          <div className="text-sm text-gray-600">PM10 (μg/m³)</div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Health Advisory</h3>
        <p className="text-blue-700">{data.healthAdvice}</p>
      </div>
    </div>
  )
}
