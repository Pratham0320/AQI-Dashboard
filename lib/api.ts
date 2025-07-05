export interface AQIData {
  city: string;
  aqi: number;
  pm25: number;
  pm10: number;
  coordinates: [number, number];
  category: string;
  healthAdvice: string;
  updatedAt: string;
}

export interface ForecastData {
  date: string;
  aqi: number;
}

export interface StationSuggestion {
  name: string;
  uid: number;      // 🔑 Now stores UID
  lat: number;
  lon: number;
}

const WAQI_TOKEN = process.env.NEXT_PUBLIC_WAQI_TOKEN!;
const OPENWEATHER_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY!;

// ✅ 1️⃣ Get LIVE AQI by UID
export async function fetchAQIData(
  station: { uid: number; name: string }
): Promise<AQIData> {
  let url = "";
  if (station.uid) {
    url = `https://api.waqi.info/feed/@${station.uid}/?token=${WAQI_TOKEN}`;
  } else {
    // fallback — ideally never used now
    url = `https://api.waqi.info/feed/${encodeURIComponent(
      station.name
    )}/?token=${WAQI_TOKEN}`;
  }

  const res = await fetch(url);
  const json = await res.json();

  if (json.status !== "ok") {
    throw new Error(`No AQI data for ${station.name}`);
  }

  const d = json.data;
  const aqi = d.aqi;
  const pm25 = d.iaqi.pm25?.v || 0;
  const pm10 = d.iaqi.pm10?.v || 0;

  const coords: [number, number] = [d.city.geo[0], d.city.geo[1]];
  const category = getAQICategory(aqi);

  return {
    city: d.city.name,
    aqi,
    pm25,
    pm10,
    coordinates: coords,
    category,
    healthAdvice: getHealthAdvice(category),
    updatedAt: d.time.s,
  };
}

// ✅ 2️⃣ Get FORECAST using OpenWeather — same
export async function fetchForecastDataWithCoords(
  coords: [number, number]
): Promise<ForecastData[]> {
  const [lat, lon] = coords;
  const today = new Date();

  const ow = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}`
  );
  const owJson = await ow.json();

  const dailyForecast: Record<string, number[]> = {};
  owJson.list.forEach((item: any) => {
    const day = new Date(item.dt * 1000).toISOString().slice(0, 10);
    dailyForecast[day] = dailyForecast[day] || [];
    dailyForecast[day].push(item.components.pm2_5);
  });

  const forecast: ForecastData[] = Object.entries(dailyForecast)
    .map(([date, values]) => ({
      date,
      aqi: calculateAQI(avg(values)),
    }))
    .filter((d) => new Date(d.date) > today)
    .slice(0, 3);

  return forecast;
}

export async function getStationSuggestions(
  query: string
): Promise<StationSuggestion[]> {
  const url = `https://api.waqi.info/search/?token=${WAQI_TOKEN}&keyword=${encodeURIComponent(
    query
  )}`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.status !== "ok" || !json.data) return [];

  return json.data.map((item: any) => ({
    name: item.station.name,
    uid: item.uid,
    lat: item.station.geo[0],
    lon: item.station.geo[1],
  }));
}

// ✅ Helpers
function avg(arr: number[]) {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calculateAQI(pm25: number) {
  if (pm25 <= 12) return Math.round((pm25 / 12) * 50);
  if (pm25 <= 35.4) return Math.round(50 + ((pm25 - 12) * (50 / 23.4)));
  if (pm25 <= 55.4) return Math.round(100 + ((pm25 - 35.4) * (50 / 20)));
  if (pm25 <= 150.4) return Math.round(150 + ((pm25 - 55.4) * (100 / 95)));
  return 300;
}

function getAQICategory(aqi: number) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function getHealthAdvice(category: string) {
  switch (category) {
    case "Good":
      return "Air quality is good. Enjoy outdoor activities!";
    case "Moderate":
      return "Air quality is acceptable. Sensitive groups should limit outdoor exertion.";
    case "Unhealthy for Sensitive Groups":
      return "Sensitive groups should avoid outdoor activities.";
    case "Unhealthy":
      return "Avoid prolonged outdoor exertion.";
    case "Very Unhealthy":
      return "Stay indoors if possible.";
    case "Hazardous":
      return "Stay indoors. Use air purifiers.";
    default:
      return "";
  }
}
