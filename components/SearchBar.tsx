"use client";

import { useState, useEffect } from "react";
import { getStationSuggestions, StationSuggestion } from "../lib/api";

interface SearchBarProps {
  onSearch: (station: StationSuggestion) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<StationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selected, setSelected] = useState<StationSuggestion | null>(null);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.length > 2) {
        getStationSuggestions(query).then((s) => setSuggestions(s));
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  const handleSelect = (s: StationSuggestion) => {
    setQuery(s.name);
    setSelected(s);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      onSearch(selected);
      setShowSuggestions(false);
    } else {
      alert("Please pick a station from suggestions!");
    }
  };

  return (
    <div className="relative max-w-md mx-auto mb-8">
      <form onSubmit={handleSubmit} className="flex">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          placeholder="Type city name..."
          className="w-full px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Check AQI"}
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-lg shadow-md">
          {suggestions.map((s) => (
            <li
              key={s.uid}
              onClick={() => handleSelect(s)}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50"
            >
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
