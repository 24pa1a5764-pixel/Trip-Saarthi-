import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Zap, Wallet, Navigation, Info } from "lucide-react";
import { getLocalTransport, type TransportOption } from "@/lib/featureData";
import { toast } from "sonner";

interface TransportFinderViewProps {
  city: string;
  onBack: () => void;
}

const CITIES = ["Delhi", "Mumbai", "Jaipur", "Bangalore"];

export default function TransportFinderView({ city, onBack }: TransportFinderViewProps) {
  const [selectedCity, setSelectedCity] = useState(city || "Delhi");
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const options = getLocalTransport(selectedCity);

  const cheapest = options.find(o => o.isCheapest);
  const fastest = options.find(o => o.isFastest);

  const toggleSelect = (name: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(name)) n.delete(name);
      else if (n.size < 2) n.add(name);
      else toast("Select max 2 to compare");
      return n;
    });
  };

  const openDirections = (opt: TransportOption) => {
    toast.success(`Opening directions to ${opt.name} 🗺️`);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-xl transition"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">Transport Finder 🚕</h2>
            <p className="text-[10px] text-muted-foreground font-medium">{options.length} options nearby</p>
          </div>
        </div>
        <button
          onClick={() => { setCompareMode(!compareMode); setSelected(new Set()); }}
          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${compareMode ? "bg-ts-saffron/10 text-ts-saffron" : "bg-muted text-muted-foreground"}`}
        >
          Compare
        </button>
      </div>

      <div className="px-5 pb-3 flex gap-2 overflow-x-auto ts-scrollbar-hide">
        {CITIES.map(c => (
          <button key={c} onClick={() => { setSelectedCity(c); setSelected(new Set()); }}
            className={`text-[10px] font-bold px-4 py-2 rounded-xl transition whitespace-nowrap ${selectedCity === c ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>{c}</button>
        ))}
      </div>

      {/* Quick recommendation */}
      <div className="px-5 pb-3">
        <div className="flex gap-2">
          {cheapest && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="flex-1 bg-ts-green/10 rounded-xl p-3 border border-ts-green/20">
              <p className="text-[9px] text-ts-green font-bold">💰 CHEAPEST</p>
              <p className="text-xs font-bold text-foreground mt-0.5">{cheapest.icon} {cheapest.name}</p>
              <p className="text-[10px] text-muted-foreground">{cheapest.cost}</p>
            </motion.div>
          )}
          {fastest && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05 }}
              className="flex-1 bg-ts-saffron/10 rounded-xl p-3 border border-ts-saffron/20">
              <p className="text-[9px] text-ts-saffron font-bold">⚡ FASTEST</p>
              <p className="text-xs font-bold text-foreground mt-0.5">{fastest.icon} {fastest.name}</p>
              <p className="text-[10px] text-muted-foreground">{fastest.cost}</p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-3 ts-scrollbar-hide">
        {options.map((opt, i) => {
          const isSelected = selected.has(opt.name);
          return (
            <motion.div
              key={opt.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => compareMode && toggleSelect(opt.name)}
              className={`bg-card rounded-2xl ts-shadow-card border p-4 flex items-center gap-4 transition ${compareMode ? "cursor-pointer active:scale-[0.98]" : ""} ${isSelected ? "border-ts-saffron ring-1 ring-ts-saffron/30" : "border-border"}`}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-3xl shrink-0 bg-muted/50 w-12 h-12 rounded-xl flex items-center justify-center"
              >
                {opt.icon}
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-bold text-foreground">{opt.name}</p>
                  {opt.isCheapest && <span className="text-[8px] font-bold bg-ts-green/10 text-ts-green px-1.5 py-0.5 rounded flex items-center gap-0.5"><Wallet className="w-2.5 h-2.5" /> Cheapest</span>}
                  {opt.isFastest && <span className="text-[8px] font-bold bg-ts-saffron/10 text-ts-saffron px-1.5 py-0.5 rounded flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" /> Fastest</span>}
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {opt.distance}</span>
                  <span className="text-[10px] text-muted-foreground">⏱️ {opt.time}</span>
                  <span className="text-[11px] font-bold text-foreground bg-muted px-2 py-0.5 rounded-lg">{opt.cost}</span>
                </div>
              </div>
              {!compareMode && (
                <button onClick={() => openDirections(opt)} className="p-2 bg-muted rounded-xl active:scale-90 transition">
                  <Navigation className="w-4 h-4 text-foreground" />
                </button>
              )}
            </motion.div>
          );
        })}

        {/* Compare result */}
        {compareMode && selected.size === 2 && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-ts-sky/5 rounded-2xl border border-ts-sky/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-ts-sky" />
              <p className="text-xs font-bold text-foreground">Comparison</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from(selected).map(name => {
                const opt = options.find(o => o.name === name)!;
                return (
                  <div key={name} className="bg-card rounded-xl p-3 border border-border text-center">
                    <p className="text-2xl mb-1">{opt.icon}</p>
                    <p className="text-[10px] font-bold text-foreground">{opt.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">💰 {opt.cost}</p>
                    <p className="text-[10px] text-muted-foreground">📍 {opt.distance}</p>
                    <p className="text-[10px] text-muted-foreground">⏱️ {opt.time}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
