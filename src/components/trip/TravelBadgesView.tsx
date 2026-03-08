import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Check, Trophy, Share2, Sparkles } from "lucide-react";
import { TRAVEL_BADGES } from "@/lib/featureData";
import { toast } from "sonner";

interface TravelBadgesViewProps {
  onBack: () => void;
  savedTripsCount: number;
  visitedCategories: string[];
}

export default function TravelBadgesView({ onBack, savedTripsCount, visitedCategories }: TravelBadgesViewProps) {
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  const isUnlocked = (badge: typeof TRAVEL_BADGES[0]): boolean => {
    if (badge.id === "trip_master") return savedTripsCount >= 5;
    if (badge.id === "food_connoisseur") return visitedCategories.filter(c => c === "food").length >= 5;
    if (badge.id === "temple_explorer") return visitedCategories.filter(c => c === "heritage" || c === "spiritual").length >= 3;
    if (badge.id === "mountain_traveler") return visitedCategories.filter(c => c === "nature" || c === "adventure").length >= 3;
    return savedTripsCount >= 1;
  };

  const getProgress = (badge: typeof TRAVEL_BADGES[0]): number => {
    if (badge.id === "trip_master") return Math.min(savedTripsCount / 5, 1);
    if (badge.id === "food_connoisseur") return Math.min(visitedCategories.filter(c => c === "food").length / 5, 1);
    if (badge.id === "temple_explorer") return Math.min(visitedCategories.filter(c => c === "heritage" || c === "spiritual").length / 3, 1);
    if (badge.id === "mountain_traveler") return Math.min(visitedCategories.filter(c => c === "nature" || c === "adventure").length / 3, 1);
    return savedTripsCount >= 1 ? 1 : 0;
  };

  const unlockedCount = TRAVEL_BADGES.filter(b => isUnlocked(b)).length;
  const level = unlockedCount <= 2 ? "Beginner" : unlockedCount <= 5 ? "Explorer" : "Master";
  const levelEmoji = unlockedCount <= 2 ? "🌱" : unlockedCount <= 5 ? "🧭" : "👑";

  const shareBadges = () => {
    const text = `I've earned ${unlockedCount}/${TRAVEL_BADGES.length} Travel Badges on TripSaarthi! Level: ${level} ${levelEmoji}`;
    if (navigator.share) navigator.share({ text });
    else { navigator.clipboard.writeText(text); toast.success("Copied to clipboard! 📋"); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-xl transition"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">Travel Badges 🏅</h2>
            <p className="text-[10px] text-muted-foreground font-medium">{unlockedCount}/{TRAVEL_BADGES.length} unlocked</p>
          </div>
        </div>
        <button onClick={shareBadges} className="p-2 hover:bg-muted rounded-xl transition">
          <Share2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Level card */}
      <div className="px-5 pb-4">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
          className="ts-gradient-hero rounded-2xl p-4 ts-shadow-elevated relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_20%,white_0%,transparent_60%)]" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-primary-foreground/20 p-3 rounded-2xl">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-primary-foreground/60 text-[10px] font-bold">YOUR LEVEL</p>
              <p className="text-primary-foreground text-base font-bold">{levelEmoji} {level} Traveler</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-foreground">{unlockedCount}</p>
              <p className="text-[9px] text-primary-foreground/50">badges</p>
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <div className="w-full bg-primary-foreground/20 rounded-full h-2">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(unlockedCount / TRAVEL_BADGES.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="bg-primary-foreground h-2 rounded-full" />
            </div>
            <p className="text-[9px] text-primary-foreground/50 mt-1">{Math.round((unlockedCount / TRAVEL_BADGES.length) * 100)}% complete</p>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24 ts-scrollbar-hide">
        <div className="grid grid-cols-2 gap-3">
          {TRAVEL_BADGES.map((badge, i) => {
            const unlocked = isUnlocked(badge);
            const progress = getProgress(badge);
            return (
              <motion.div
                key={badge.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.06, type: "spring", bounce: 0.3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedBadge(selectedBadge === badge.id ? null : badge.id)}
                className={`bg-card rounded-2xl ts-shadow-card border border-border p-4 text-center relative cursor-pointer transition ${!unlocked ? "opacity-60" : ""}`}
              >
                {unlocked ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.06, type: "spring" }}
                    className="absolute top-2 right-2 bg-ts-green/10 p-1 rounded-full">
                    <Check className="w-3 h-3 text-ts-green" />
                  </motion.div>
                ) : (
                  <div className="absolute top-2 right-2 bg-muted p-1 rounded-full">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}

                <motion.p
                  className="text-3xl mb-2"
                  animate={unlocked ? { rotate: [0, -10, 10, -5, 5, 0] } : {}}
                  transition={{ delay: 0.5 + i * 0.06 }}
                >
                  {badge.emoji}
                </motion.p>
                <p className="text-xs font-bold text-foreground">{badge.name}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{badge.description}</p>

                {/* Progress bar */}
                {!unlocked && (
                  <div className="mt-2">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                        className="bg-ts-saffron h-1.5 rounded-full"
                      />
                    </div>
                    <p className="text-[8px] text-muted-foreground mt-1">{Math.round(progress * 100)}%</p>
                  </div>
                )}

                {unlocked && (
                  <div className={`text-[8px] mt-2 font-bold px-2 py-1 rounded-lg ${badge.bg} ${badge.color} flex items-center justify-center gap-1`}>
                    <Sparkles className="w-2.5 h-2.5" /> Unlocked!
                  </div>
                )}

                {/* Expanded detail */}
                <AnimatePresence>
                  {selectedBadge === badge.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2 pt-2 border-t border-border">
                      <p className="text-[9px] text-muted-foreground">{badge.requirement}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
