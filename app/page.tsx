"use client";

import { useEffect, useState, useCallback } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import styles from "./page.module.css";

// ── WMO weather code → emoji + German label ────────────────────────────────
const WMO: Record<number, [string, string]> = {
  0:  ["☀️",  "Klarer Himmel"],
  1:  ["🌤️", "Überwiegend klar"],
  2:  ["⛅",  "Teilweise bewölkt"],
  3:  ["☁️",  "Bedeckt"],
  45: ["🌫️", "Nebel"],
  48: ["🌫️", "Raureifnebel"],
  51: ["🌦️", "Leichter Nieselregen"],
  53: ["🌦️", "Nieselregen"],
  55: ["🌧️", "Starker Nieselregen"],
  61: ["🌧️", "Leichter Regen"],
  63: ["🌧️", "Regen"],
  65: ["🌧️", "Starker Regen"],
  71: ["🌨️", "Leichter Schnee"],
  73: ["🌨️", "Schnee"],
  75: ["❄️",  "Starker Schnee"],
  80: ["🌦️", "Regenschauer"],
  81: ["🌧️", "Starke Schauer"],
  82: ["⛈️", "Heftige Schauer"],
  95: ["⛈️", "Gewitter"],
  96: ["⛈️", "Gewitter mit Hagel"],
  99: ["⛈️", "Heftiges Gewitter"],
};
function wmo(code: number): [string, string] {
  return WMO[code] ?? ["🌡️", "Unbekannt"];
}

const DAYS_FULL = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const DAY_LABELS = (i: number) =>
  i === 0 ? "Heute" : i === 1 ? "Morgen" : i === 2 ? "Übermorgen" : DAYS_FULL[new Date().getDay()];

// ── Types ───────────────────────────────────────────────────────────────────
interface Location { lat: number; lon: number; city: string; country: string; }
interface WeatherDay {
  label: string;
  icon: string;
  desc: string;
  tmax: number;
  tmin: number;
  rain: number;
  wind: number;
  isToday: boolean;
}
interface WeatherData {
  curTemp: number;
  curDesc: string;
  curIcon: string;
  days: WeatherDay[];
  sunrise: string;
  sunset: string;
}

// ── Location helpers ────────────────────────────────────────────────────────
async function reverseGeocode(lat: number, lon: number): Promise<{city:string;country:string}|null> {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
      headers: { "Accept-Language": "de" },
    });
    const d = await r.json();
    const a = d.address ?? {};
    return {
      city:    a.city ?? a.town ?? a.village ?? a.county ?? "Ihr Standort",
      country: (a.country_code as string)?.toUpperCase() ?? "",
    };
  } catch { return null; }
}

async function ipLocation(): Promise<Location> {
  const r = await fetch("https://ipapi.co/json/");
  const d = await r.json();
  if (!d.latitude) throw new Error("IP-Standort nicht verfügbar");
  return { lat: d.latitude, lon: d.longitude, city: d.city ?? "Ihr Standort", country: d.country_code ?? "" };
}

async function getLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      ipLocation().then(resolve).catch(reject);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const geo = await reverseGeocode(lat, lon);
        resolve(geo ? { lat, lon, ...geo } : { lat, lon, city: "Ihr Standort", country: "" });
      },
      async () => {
        try { resolve(await ipLocation()); }
        catch { reject(new Error("Standort konnte nicht ermittelt werden.")); }
      },
      { timeout: 8000 }
    );
  });
}

// ── Open-Meteo ──────────────────────────────────────────────────────────────
async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,sunrise,sunset` +
    `&current_weather=true&timezone=auto&forecast_days=4`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Wetterdienst nicht erreichbar");
  const d = await r.json();
  const { daily, current_weather: cur } = d;

  const fmtTime = (s: string) =>
    new Date(s + ":00").toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  const days: WeatherDay[] = Array.from({ length: 4 }, (_, i) => {
    const [icon, desc] = wmo(daily.weathercode[i]);
    return {
      label:   DAY_LABELS(i),
      icon,  desc,
      tmax:  Math.round(daily.temperature_2m_max[i]),
      tmin:  Math.round(daily.temperature_2m_min[i]),
      rain:  daily.precipitation_probability_max[i],
      wind:  Math.round(daily.windspeed_10m_max[i]),
      isToday: i === 0,
    };
  });

  const [curIcon, curDesc] = wmo(cur.weathercode);
  return {
    curTemp: Math.round(cur.temperature),
    curDesc, curIcon, days,
    sunrise: fmtTime(daily.sunrise[0]),
    sunset:  fmtTime(daily.sunset[0]),
  };
}

// ── Component ───────────────────────────────────────────────────────────────
type Phase = "idle" | "loading" | "done" | "error";

export default function WeatherApp() {
  const [phase, setPhase]       = useState<Phase>("idle");
  const [loaderText, setLoader] = useState("Standort wird ermittelt…");
  const [error, setError]       = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather]   = useState<WeatherData | null>(null);
  const [updatedAt, setUpdated] = useState("");

  // ── Farcaster SDK: call ready() as soon as component mounts ──────────────
  useEffect(() => {
    sdk.actions.ready().catch(console.error);
  }, []);

  const loadWeather = useCallback(async () => {
    setPhase("loading");
    setError("");
    setLoader("Standort wird ermittelt…");
    try {
      const loc = await getLocation();
      setLocation(loc);
      setLoader("Wetterdaten werden geladen…");
      const w = await fetchWeather(loc.lat, loc.lon);
      setWeather(w);
      setUpdated(
        new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
      );
      setPhase("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
      setPhase("error");
    }
  }, []);

  return (
    <div className={styles.wrap}>
      {/* ── Header ─────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⛅</span>
          Weather-Farcaster
        </div>
        <p className={styles.sub}>Live Wettervorhersage · 3-Tages-Übersicht</p>
        <div className={styles.badge}>⬡ Farcaster Mini App</div>
      </header>

      {/* ── Idle: CTA ──────────────────────────────────── */}
      {phase === "idle" && (
        <div className={styles.cta}>
          <button className={styles.btnPrimary} onClick={loadWeather}>
            <span>🌤️</span> Show Weather Forecast
          </button>
          <button className={styles.btnSecondary} onClick={loadWeather}>
            📍 Standort automatisch ermitteln
          </button>
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────── */}
      {phase === "loading" && (
        <div className={styles.loader}>
          <div className={styles.spinner} />
          <p className={styles.loaderText}>{loaderText}</p>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────── */}
      {phase === "error" && (
        <div className={styles.errorWrap}>
          <div className={styles.errorBox}>⚠️ {error}</div>
          <button className={styles.btnSecondary} onClick={loadWeather}>
            🔄 Erneut versuchen
          </button>
        </div>
      )}

      {/* ── Weather result ──────────────────────────────── */}
      {phase === "done" && weather && (
        <>
          {/* Location bar */}
          <div className={styles.locationBar}>
            <span>📍</span>
            <strong>{location?.city}</strong>
            {location?.country && <span className={styles.country}>{location.country}</span>}
          </div>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Wettervorhersage</h2>
              <span className={styles.sectionSub}>Stand {updatedAt}</span>
            </div>

            {/* Cards grid */}
            <div className={styles.grid}>
              {weather.days.map((day, i) => (
                <div
                  key={i}
                  className={`${styles.card} ${day.isToday ? styles.cardToday : ""}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className={styles.cardDay}>{day.label}</span>
                  <span className={styles.cardIcon}>{day.icon}</span>

                  {day.isToday ? (
                    <>
                      <div className={styles.todayTemp}>
                        {weather.curTemp}°
                      </div>
                      <div className={styles.todayRange}>
                        <span className={styles.hi}>{day.tmax}°</span>
                        <span className={styles.divider}>/</span>
                        <span className={styles.lo}>{day.tmin}°</span>
                      </div>
                    </>
                  ) : (
                    <div className={styles.tempRange}>
                      <span className={styles.hi}>{day.tmax}°</span>
                      <span className={styles.divider}>/</span>
                      <span className={styles.lo}>{day.tmin}°</span>
                    </div>
                  )}

                  <p className={styles.desc}>{day.desc}</p>
                  <div className={styles.meta}>
                    <span className={styles.metaItem}>💧 {day.rain}%</span>
                    <span className={styles.metaItem}>💨 {day.wind} km/h</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sunrise / Sunset */}
            <div className={styles.sunStrip}>
              <div className={styles.sunItem}>
                <span className={styles.sunIcon}>🌅</span>
                <div>
                  <div className={styles.sunLabel}>Sonnenaufgang</div>
                  <div className={styles.sunTime}>{weather.sunrise}</div>
                </div>
              </div>
              <div className={styles.sunDivider} />
              <div className={styles.sunItem}>
                <span className={styles.sunIcon}>🌇</span>
                <div>
                  <div className={styles.sunLabel}>Sonnenuntergang</div>
                  <div className={styles.sunTime}>{weather.sunset}</div>
                </div>
              </div>
            </div>

            {/* Refresh */}
            <button className={styles.btnSecondary} onClick={loadWeather} style={{ marginTop: 8 }}>
              🔄 Aktualisieren
            </button>
          </section>
        </>
      )}
    </div>
  );
}
