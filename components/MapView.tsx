"use client";

import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import type { AQIData } from "../lib/api";

interface MapViewProps {
  data: AQIData | null;
}

// Use your reliable GeoJSON URL:
const INDIA_TOPOJSON =
  "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@bcbcba3/geojson/india.geojson";

export default function MapView({ data }: MapViewProps) {
  const [zoomLevel, setZoomLevel] = useState(3);

  const markerCoordinates = data
    ? [data.coordinates[1], data.coordinates[0]]
    : [78.9629, 20.5937];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Location Map {data ? `- ${data.city}` : ""}
      </h3>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 1000 }}
        width={800}
        height={500}
      >
        <ZoomableGroup
          center={markerCoordinates}
          zoom={data ? 5 : 3}
          onMoveEnd={({ zoom }: { zoom: number }) => setZoomLevel(zoom)}
          disablePanning={false} // default
          zoomSensitivity={0.5} // smooth pinch zoom
        >
          <Geographies geography={INDIA_TOPOJSON}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#E2E8F0"
                  stroke="#CBD5E0"
                  strokeWidth={0.5}
                />
              ))
            }
          </Geographies>

          {data && (
            <Marker coordinates={markerCoordinates}>
              <circle
                r={6 / zoomLevel}
                fill="#EF4444"
                stroke="#fff"
                strokeWidth={1.5}
              />
              <text
                textAnchor="middle"
                y={-12 / zoomLevel}
                style={{
                  fontFamily: "system-ui",
                  fill: "#333",
                  fontSize: `${12 / zoomLevel}px`,
                }}
              >
                AQI {data.aqi}
              </text>
            </Marker>
          )}
        </ZoomableGroup>
      </ComposableMap>

      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>Interactive India map with zoomable AQI marker</p>
        <p className="text-xs text-gray-500 mt-1">
          Pinch or scroll to zoom, drag to move.
        </p>
      </div>
    </div>
  );
}
