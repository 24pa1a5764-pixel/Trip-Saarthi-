import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, Droplets, Wind, Eye, Shirt } from "lucide-react";
import { getWeatherAlerts } from "@/lib/featureData";

interface WeatherAlertsViewProps {
  onBack: () => void;
}

const CITIES = ["Delhi", "Mumbai", "Goa", "Ladakh"];

const packingSuggestions: Record<string, { items: string[]; icon: string }> = {
  heat: { items: ["Sunscreen SPF 50+", "Light cotton clothes", "Wide hat", "ORS packets", "Electrolyte water"], icon: "☀️" },
  rain: { items: ["Raincoat/umbrella", "Waterproof bags", "Quick-dry clothes", "Waterproof shoes", "Dry bags for electronics"], icon: "🌧️" },
  cold: { items: ["Heavy jacket", "Thermal innerwear", "Woolen socks", "Gloves & muffler", "Hand warmers"], icon: "❄️" },
  storm: { items: ["Emergency flashlight", "Power bank", "First aid kit", "Waterproof jacket", "Emergency contacts card"], icon: "⛈️" },
};

export default function WeatherAlertsView({ onBack }: WeatherAlertsViewProps) {
  const [selectedCity, setSelectedCity] = useState("Delhi");
  const weather = getWeatherAlerts(selectedCity);

  const alertColors: Record<string, string> = {
    rain: "bg-ts-sky/10 border-ts-sky/30 text-ts-sky",
    heat: "bg-destructive/10 border-destructive/30 text-destructive",
    storm: "bg-ts-purple/10 border-ts-purple/30 text-ts-purple",
    cold: "bg-ts-sky/10 border-ts-sky/30 text-ts-sky",
  };

  const packing = weather.alertType ? packingSuggestions[weather.alertType] : null;

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-xl transition"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
        <div>
          <h2 className="text-lg font-display font-bold text-foreground">Weather Alerts 🌦️</h2>
          <p className="text-[10px] text-muted-foreground font-medium">Plan around the weather</p>
        </div>
      </div>

      {/* City selector */}
      <div className="px-5 pb-3 flex gap-2 overflow-x-auto ts-scrollbar-hide">
        {CITIES.map(c => (
          <button key={c} onClick={() => setSelectedCity(c)}
            className={`text-[10px] font-bold px-4 py-2 rounded-xl transition whitespace-nowrap ${selectedCity === c ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>{c}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24 ts-scrollbar-hide space-y-4">
        {/* Current weather - hero card */}
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="ts-gradient-hero rounded-3xl ts-shadow-elevated p-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_20%,white_0%,transparent_60%)]" />
          <div className="relative z-10">
            <motion.p
              key={weather.icon}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-6xl mb-2"
            >
              {weather.icon}
            </motion.p>
            <motion.p
              key={weather.temp}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl font-bold text-primary-foreground"
            >
              {weather.temp}
            </motion.p>
            <p className="text-sm text-primary-foreground/70">{weather.condition}</p>
            <p className="text-xs text-primary-foreground/50 mt-1">{weather.city}</p>

            {/* Mini stats */}
            <div className="flex justify-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-primary-foreground/60">
                <Droplets className="w-3 h-3" />
                <span className="text-[10px]">65%</span>
              </div>
              <div className="flex items-center gap-1 text-primary-foreground/60">
                <Wind className="w-3 h-3" />
                <span className="text-[10px]">12 km/h</span>
              </div>
              <div className="flex items-center gap-1 text-primary-foreground/60">
                <Eye className="w-3 h-3" />
                <span className="text-[10px]">8 km</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alert */}
        {weather.alert && weather.alertType && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className={`rounded-2xl border p-4 flex items-start gap-3 ${alertColors[weather.alertType]}`}>
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold">⚠️ Weather Alert</p>
              <p className="text-[11px] mt-0.5">{weather.alert}</p>
            </div>
          </motion.div>
        )}

        {/* 5-day forecast */}
        <div>
          <h3 className="text-sm font-display font-bold text-foreground mb-3">5-Day Forecast</h3>
          <div className="flex gap-2">
            {weather.forecast.map((f, i) => (
              <motion.div key={f.day} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.05 }}
                className="flex-1 bg-card rounded-2xl ts-shadow-card border border-border p-3 text-center">
                <p className="text-[10px] text-muted-foreground font-bold">{f.day}</p>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05, type: "spring" }}
                  className="text-xl my-1"
                >
                  {f.icon}
                </motion.p>
                <p className="text-xs font-bold text-foreground">{f.temp}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Packing suggestion */}
        {packing && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}
            className="bg-card rounded-2xl ts-shadow-card border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shirt className="w-4 h-4 text-ts-purple" />
              <h3 className="text-sm font-display font-bold text-foreground">What to Pack {packing.icon}</h3>
            </div>
            <div className="space-y-1.5">
              {packing.items.map((item, i) => (
                <motion.div key={item} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-ts-purple" />
                  <span className="text-[11px] text-muted-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Travel tip */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="bg-ts-saffron/10 rounded-2xl p-4 border border-ts-saffron/20">
          <p className="text-xs font-bold text-foreground mb-1">💡 Travel Tip</p>
          <p className="text-[11px] text-muted-foreground">{weather.tip}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
