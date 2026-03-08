import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { FESTIVALS } from "@/lib/featureData";
import { toast } from "sonner";

interface FestivalEventsViewProps {
  onBack: () => void;
}

const MONTHS = ["All", "Jan", "Feb", "Mar", "Oct", "Nov", "Dec"];

export default function FestivalEventsView({ onBack }: FestivalEventsViewProps) {
  const [monthFilter, setMonthFilter] = useState("All");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<"all" | "festival" | "event" | "fair">("all");

  const filtered = FESTIVALS.filter(f => {
    if (monthFilter !== "All" && !f.month.startsWith(monthFilter === "Jan" ? "January" : monthFilter === "Feb" ? "February" : monthFilter === "Mar" ? "March" : monthFilter === "Oct" ? "October" : monthFilter === "Nov" ? "November" : "December")) return false;
    if (typeFilter !== "all" && f.type !== typeFilter) return false;
    return true;
  });

  const toggleSave = (name: string) => {
    setSaved(prev => {
      const n = new Set(prev);
      if (n.has(name)) { n.delete(name); toast("Removed from saved"); }
      else { n.add(name); toast.success("Saved to your list! 📌"); }
      return n;
    });
  };

  // Simple countdown (mock - days until the event month)
  const getCountdown = (month: string): string => {
    const monthMap: Record<string, number> = { January: 0, February: 1, March: 2, October: 9, November: 10, December: 11 };
    const now = new Date();
    const targetMonth = monthMap[month] ?? 0;
    let months = targetMonth - now.getMonth();
    if (months < 0) months += 12;
    if (months === 0) return "🔴 Happening now!";
    if (months === 1) return "🟡 Next month!";
    return `📅 In ~${months} months`;
  };

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-xl transition"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
        <div className="flex-1">
          <h2 className="text-lg font-display font-bold text-foreground">Festivals & Events 🎉</h2>
          <p className="text-[10px] text-muted-foreground font-medium">{filtered.length} events • {saved.size} saved</p>
        </div>
      </div>

      {/* Month filter */}
      <div className="px-5 pb-2 flex gap-2 overflow-x-auto ts-scrollbar-hide">
        {MONTHS.map(m => (
          <button key={m} onClick={() => setMonthFilter(m)}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap ${monthFilter === m ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>{m}</button>
        ))}
      </div>

      {/* Type filter */}
      <div className="px-5 pb-3 flex gap-2">
        {(["all", "festival", "event", "fair"] as const).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`text-[9px] font-bold px-2.5 py-1 rounded-lg transition capitalize ${typeFilter === t ? "bg-ts-saffron/10 text-ts-saffron" : "bg-muted text-muted-foreground"}`}>
            {t === "all" ? "All Types" : t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-3 ts-scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {filtered.map((fest, i) => (
            <motion.div
              key={fest.name}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card rounded-2xl ts-shadow-card border border-border overflow-hidden"
            >
              <div className="relative">
                <img src={fest.img} alt={fest.name} className="w-full h-36 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{fest.icon}</span>
                    <p className="text-sm font-bold text-primary-foreground">{fest.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSave(fest.name)}
                  className="absolute top-2 right-2 p-2 rounded-xl bg-foreground/30 backdrop-blur-sm active:scale-90 transition"
                >
                  {saved.has(fest.name) ? (
                    <BookmarkCheck className="w-4 h-4 text-ts-saffron" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-primary-foreground" />
                  )}
                </button>
                <span className={`absolute top-2 left-2 text-[8px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm ${fest.type === "festival" ? "bg-ts-saffron/80 text-primary-foreground" : fest.type === "fair" ? "bg-ts-purple/80 text-primary-foreground" : "bg-ts-sky/80 text-primary-foreground"}`}>
                  {fest.type.toUpperCase()}
                </span>
              </div>
              <div className="p-4">
                <p className="text-[11px] text-muted-foreground mb-2">{fest.description}</p>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {fest.loc}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> {fest.date}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/50 rounded-xl px-3 py-2">
                  <Clock className="w-3 h-3 text-ts-saffron" />
                  <span className="text-[10px] font-bold text-foreground">{getCountdown(fest.month)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">🎭</p>
            <p className="text-sm font-bold text-foreground">No events in this period</p>
            <p className="text-[10px] text-muted-foreground mt-1">Try selecting a different month</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
