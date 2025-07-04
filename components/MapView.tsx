"use client"

import { useEffect, useRef } from "react"
import type { AQIData } from "../lib/api"

interface MapViewProps {
  data: AQIData | null
}

export default function MapView({ data }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    const initMap = async () => {
      try {
        // Dynamically import Leaflet and CSS
        const L = (await import("leaflet")).default

        // Import Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        })

        if (mapRef.current && !mapInstanceRef.current) {
          // Initialize map
          mapInstanceRef.current = L.map(mapRef.current, {
            center: [20.5937, 78.9629],
            zoom: 5,
            zoomControl: true,
            scrollWheelZoom: true,
          })

          // Add tile layer with better error handling
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
            tileSize: 256,
            zoomOffset: 0,
          }).addTo(mapInstanceRef.current)

          // Force map to resize after a short delay
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize()
            }
          }, 100)
        }
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      if (markerRef.current) {
        markerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (data && mapInstanceRef.current) {
      const updateMarker = async () => {
        try {
          const L = (await import("leaflet")).default

          // Remove existing marker
          if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current)
          }

          // Create custom icon based on AQI level
          const getMarkerColor = (aqi: number) => {
            if (aqi <= 50) return "#10B981" // Green
            if (aqi <= 100) return "#F59E0B" // Yellow
            if (aqi <= 150) return "#F97316" // Orange
            if (aqi <= 200) return "#EF4444" // Red
            if (aqi <= 300) return "#8B5CF6" // Purple
            return "#6B7280" // Gray
          }

          const markerHtml = `
            <div style="
              background-color: ${getMarkerColor(data.aqi)};
              width: 30px;
              height: 30px;
              border-radius: 50%;
              border: 3px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: white;
              font-size: 12px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${data.aqi}
            </div>
          `

          const customIcon = L.divIcon({
            html: markerHtml,
            className: "custom-aqi-marker",
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          })

          // Add new marker
          markerRef.current = L.marker(data.coordinates, { icon: customIcon }).addTo(mapInstanceRef.current)

          // Create popup content
          const popupContent = `
            <div style="text-align: center; min-width: 150px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${data.city}</h3>
              <div style="margin: 4px 0;">
                <span style="font-weight: 600;">AQI:</span> 
                <span style="color: ${getMarkerColor(data.aqi)}; font-weight: bold;">${data.aqi}</span>
              </div>
              <div style="margin: 4px 0; font-size: 14px; color: #666;">
                ${data.category}
              </div>
              <div style="margin: 8px 0 4px 0; font-size: 12px; color: #888;">
                PM2.5: ${data.pm25} μg/m³<br>
                PM10: ${data.pm10} μg/m³
              </div>
            </div>
          `

          markerRef.current
            .bindPopup(popupContent, {
              maxWidth: 200,
              className: "custom-popup",
            })
            .openPopup()

          // Center map on the marker with animation
          mapInstanceRef.current.setView(data.coordinates, 10, {
            animate: true,
            duration: 1,
          })

          // Invalidate size to ensure proper rendering
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize()
            }
          }, 100)
        } catch (error) {
          console.error("Error updating marker:", error)
        }
      }

      updateMarker()
    }
  }, [data])

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Location Map</h3>
        <div className="h-80 w-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Select a city to view location on map</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Location Map - {data.city}</h3>
      <div
        ref={mapRef}
        className="h-80 w-full rounded-lg border border-gray-200 relative z-0"
        style={{ minHeight: "320px" }}
      />
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>Interactive map showing air quality monitoring location</p>
        <p className="text-xs text-gray-500 mt-1">
          Marker color indicates AQI level: Green (Good) → Yellow (Moderate) → Red (Unhealthy)
        </p>
      </div>
    </div>
  )
}
