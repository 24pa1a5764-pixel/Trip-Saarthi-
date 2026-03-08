import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Clock, Star, Heart, Share2 } from "lucide-react";
import { PHOTO_SPOTS } from "@/lib/featureData";
import { toast } from "sonner";

interface PhotoSpotFinderViewProps {
  onBack: () => void;
}

const typeIcons: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  sunrise: { icon: "🌅", label: "Sunrise", color: "text-ts-saffron", bg: "bg-ts-saffron/10" },
  sunset: { icon: "🌇", label: "Sunset", color: "text-ts-rose", bg: "bg-ts-rose/10" },
  golden_hour: { icon: "✨", label: "Golden Hour", color: "text-ts-saffron", bg: "bg-ts-saffron/10" },
  night: { icon: "🌙", label: "Night", color: "text-ts-purple", bg: "bg-ts-purple/10" },
  anytime: { icon: "📸", label: "Anytime", color: "text-ts-sky", bg: "bg-ts-sky/10" },
};

const FILTERS = ["all", "sunrise", "sunset", "golden_hour", "night"] as const;

export default function PhotoSpotFinderView({ onBack }: PhotoSpotFinderViewProps) {
  const [filter, setFilter] = useState<string>("all");
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const filtered = filter === "all" ? PHOTO_SPOTS : PHOTO_SPOTS.filter(s => s.type === filter);

  const toggleSave = (name: string) => {
    setSaved(prev => {
      const n = new Set(prev);
      if (n.has(name)) { n.delete(name); toast("Removed from saved"); }
      else { n.add(name); toast.success("Saved to photo list! 📷"); }
      return n;
    });
  };

  const shareSpot = (spot: typeof PHOTO_SPOTS[0]) => {
    const text = `📸 ${spot.name} in ${spot.loc} — Best time: ${spot.bestTime}. Tip: ${spot.tip}`;
    if (navigator.share) navigator.share({ text });
    else { navigator.clipboard.writeText(text); toast.success("Copied! 📋"); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-xl transition"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
        <div className="flex-1">
          <h2 className="text-lg font-display font-bold text-foreground">Photo Spots 📸</h2>
          <p className="text-[10px] text-muted-foreground font-medium">{filtered.length} spots • {saved.size} saved</p>
        </div>
      </div>

      {/* Type filter */}
      <div className="px-5 pb-3 flex gap-2 overflow-x-auto ts-scrollbar-hide">
        {FILTERS.map(f => {
          const info = f === "all" ? { icon: "🗺️", label: "All" } : typeIcons[f];
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1 ${filter === f ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
              <span>{info.icon}</span> {info.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-3 ts-scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {filtered.map((spot, i) => {
            const typeInfo = typeIcons[spot.type];
            const isSaved = saved.has(spot.name);
            return (
              <motion.div
                key={spot.name}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-2xl ts-shadow-card border border-border overflow-hidden"
              >
                <div className="relative">
                  <img src={spot.img} alt={spot.name} className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />

                  {/* Top badges */}
                  <div className={`absolute top-2 left-2 ${typeInfo.bg} backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1`}>
                    <span className="text-sm">{typeInfo.icon}</span>
                    <span className={`text-[9px] font-bold ${typeInfo.color}`}>{typeInfo.label}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button onClick={() => toggleSave(spot.name)}
                      className="p-2 rounded-xl bg-foreground/30 backdrop-blur-sm active:scale-90 transition">
                      <Heart className={`w-3.5 h-3.5 transition ${isSaved ? "fill-ts-rose text-ts-rose" : "text-primary-foreground"}`} />
                    </button>
                    <button onClick={() => shareSpot(spot)}
                      className="p-2 rounded-xl bg-foreground/30 backdrop-blur-sm active:scale-90 transition">
                      <Share2 className="w-3.5 h-3.5 text-primary-foreground" />
                    </button>
                  </div>

                  {/* Bottom overlay info */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="text-sm font-bold text-primary-foreground">{spot.name}</p>
                      <p className="text-[10px] text-primary-foreground/70">{spot.loc}</p>
                    </div>
                    <div className="bg-foreground/40 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star className="w-3 h-3 text-ts-saffron fill-ts-saffron" />
                      <span className="text-[10px] font-bold text-primary-foreground">{spot.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 bg-ts-saffron/5 rounded-xl px-3 py-2.5 border border-ts-saffron/10">
                    <Clock className="w-3.5 h-3.5 text-ts-saffron" />
                    <span className="text-[10px] font-bold text-foreground">Best Time: {spot.bestTime}</span>
                  </div>
                  <div className="flex items-start gap-1.5 bg-ts-sky/5 rounded-xl px-3 py-2.5 border border-ts-sky/10">
                    <Camera className="w-3.5 h-3.5 text-ts-sky mt-0.5 shrink-0" />
                    <span className="text-[10px] text-muted-foreground">{spot.tip}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">📷</p>
            <p className="text-sm font-bold text-foreground">No spots for this filter</p>
            <p className="text-[10px] text-muted-foreground mt-1">Try selecting a different time</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
