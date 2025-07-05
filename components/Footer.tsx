"use client"

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-lg mb-2">
            Data source: <span className="font-semibold">WAQI & OpenWeather</span>
          </p>
          <p className="text-gray-300">
            Team: <span className="font-semibold">Crusading Titans</span>
          </p>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              © 2025 Air Quality Visualizer & Forecast App. Built for environmental awareness.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
