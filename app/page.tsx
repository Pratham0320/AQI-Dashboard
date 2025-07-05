"use client";

import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import AQICard from "../components/AQICard";
import ForecastChart from "../components/ForecastChart";
import MapView from "../components/MapView";
import Footer from "../components/Footer";
import {
  fetchAQIData,
  fetchForecastDataWithCoords,
  getStationSuggestions,
} from "../lib/api";
import type { AQIData, ForecastData, StationSuggestion } from "../lib/api";

export default function Home() {
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Default Delhi data on load
  useEffect(() => {
    const loadDefault = async () => {
      const suggestions = await getStationSuggestions("Delhi");
      if (suggestions.length > 0) {
        handleSearch(suggestions[0]);
      }
    };
    loadDefault();
  }, []);

  const handleSearch = async (station: StationSuggestion) => {
    setIsLoading(true);
    setError(null);

    try {
      const aqi = await fetchAQIData(station);
      const forecast = await fetchForecastDataWithCoords(aqi.coordinates);

      setAqiData(aqi);
      setForecastData(forecast);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch air quality data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Air Quality Visualizer & Forecast App
            </h1>
            <p className="text-lg text-gray-600">Powered by WAQI + OpenWeather</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">
              Loading air quality data...
            </span>
          </div>
        ) : (
          <>
            <AQICard data={aqiData} />

            {forecastData.length > 0 && aqiData && (
              <ForecastChart data={forecastData} city={aqiData.city} />
            )}

            <MapView data={aqiData} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
