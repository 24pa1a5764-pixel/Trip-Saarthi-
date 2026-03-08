import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Leaf, Drumstick, Filter, Heart, Search, MapPin, Share2, ExternalLink } from "lucide-react";
import { FOOD_SPOTS, type FoodSpot } from "@/lib/featureData";
import { toast } from "sonner";

interface FoodFinderViewProps {
  onBack: () => void;
}

export default function FoodFinderView({ onBack }: FoodFinderViewProps) {
  const [filter, setFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [priceFilter, setPriceFilter] = useState<"all" | "budget" | "mid" | "premium">("all");
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const filtered = FOOD_SPOTS.filter(f => {
    if (filter !== "all" && f.type !== filter && f.type !== "both") return false;
    if (priceFilter !== "all" && f.priceRange !== priceFilter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.dish.toLowerCase().includes(search.toLowerCase()) && !f.loc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleLike = (name: string) => {
    setLiked(prev => {
      const n = new Set(prev);
      if (n.has(name)) { n.delete(name); toast("Removed from favorites"); }
      else { n.add(name); toast.success("Added to favorites ❤️"); }
      return n;
    });
  };

  const shareFoodSpot = (food: FoodSpot) => {
    if (navigator.share) {
      navigator.share({ title: food.name, text: `Check out ${food.name} in ${food.loc} — famous for ${food.dish}! 🍲` });
    } else {
      navigator.clipboard.writeText(`${food.name} in ${food.loc} — ${food.dish}`);
      toast.success("Copied to clipboard! 📋");
    }
  };

  const hygieneBar = (n: number) => (
    <div className="flex items-center gap-1">
      <span className="text-[9px] text-muted-foreground">Hygiene:</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`w-3 h-1.5 rounded-full ${i <= n ? "bg-ts-green" : "bg-muted"}`} />
        ))}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-xl transition"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
        <div className="flex-1">
          <h2 className="text-lg font-display font-bold text-foreground">Smart Food Finder 🍲</h2>
          <p className="text-[10px] text-muted-foreground font-medium">{filtered.length} spots • {liked.size} favorites</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 pb-2">
        <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5 border border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search food, dish, or city..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 pb-3 space-y-2">
        <div className="flex gap-2">
          {(["all", "veg", "non-veg"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${filter === f ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
              {f === "veg" && <Leaf className="w-3 h-3" />}
              {f === "non-veg" && <Drumstick className="w-3 h-3" />}
              {f === "all" && <Filter className="w-3 h-3" />}
              {f === "all" ? "All" : f === "veg" ? "Veg" : "Non-Veg"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["all", "budget", "mid", "premium"] as const).map(p => (
            <button key={p} onClick={() => setPriceFilter(p)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${priceFilter === p ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
              {p === "all" ? "Any Price" : p === "budget" ? "₹ Budget" : p === "mid" ? "₹₹ Mid" : "₹₹₹ Premium"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-3 ts-scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {filtered.map((food, i) => (
            <motion.div
              key={food.name}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setExpandedCard(expandedCard === food.name ? null : food.name)}
              className="bg-card rounded-2xl ts-shadow-card border border-border overflow-hidden cursor-pointer active:scale-[0.98] transition"
            >
              <div className="flex">
                <div className="relative w-28 shrink-0">
                  <img src={food.img} alt={food.name} className="w-full h-full object-cover min-h-[100px]" />
                  <button
                    onClick={e => { e.stopPropagation(); toggleLike(food.name); }}
                    className="absolute top-1.5 left-1.5 p-1.5 rounded-full bg-foreground/30 backdrop-blur-sm active:scale-90 transition"
                  >
                    <Heart className={`w-3.5 h-3.5 transition ${liked.has(food.name) ? "fill-ts-rose text-ts-rose scale-110" : "text-primary-foreground"}`} />
                  </button>
                  <span className={`absolute bottom-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded ${food.type === "veg" ? "bg-ts-green/90 text-primary-foreground" : food.type === "non-veg" ? "bg-destructive/90 text-primary-foreground" : "bg-ts-saffron/90 text-primary-foreground"}`}>
                    {food.type === "veg" ? "🟢 VEG" : food.type === "non-veg" ? "🔴 NON-VEG" : "🟡 BOTH"}
                  </span>
                </div>
                <div className="flex-1 p-3">
                  <p className="text-xs font-bold text-foreground">{food.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground">{food.loc}</p>
                  </div>
                  <p className="text-[10px] text-ts-saffron font-bold mt-0.5">★ Famous: {food.dish}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] font-bold text-foreground bg-muted px-2 py-0.5 rounded-lg">{food.price}</span>
                    <span className="text-[10px] text-ts-saffron flex items-center gap-0.5 font-bold"><Star className="w-2.5 h-2.5 fill-ts-saffron" /> {food.rating}</span>
                  </div>
                  {hygieneBar(food.hygieneRating)}
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {expandedCard === food.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 pt-1 border-t border-border">
                      <p className="text-[10px] text-muted-foreground mb-2">{food.description}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); shareFoodSpot(food); }}
                          className="flex items-center gap-1.5 text-[10px] font-bold bg-muted px-3 py-2 rounded-xl active:scale-95 transition text-foreground"
                        >
                          <Share2 className="w-3 h-3" /> Share
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); toast.success("Opening directions... 🗺️"); }}
                          className="flex items-center gap-1.5 text-[10px] font-bold bg-ts-saffron/10 text-ts-saffron px-3 py-2 rounded-xl active:scale-95 transition"
                        >
                          <ExternalLink className="w-3 h-3" /> Directions
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">🍽️</p>
            <p className="text-sm font-bold text-foreground">No food spots found</p>
            <p className="text-[10px] text-muted-foreground mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
