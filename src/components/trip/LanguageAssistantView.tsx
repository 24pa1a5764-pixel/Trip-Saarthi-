import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Copy, Star, BookOpen } from "lucide-react";
import { TRAVEL_PHRASES, type PhraseTranslation } from "@/lib/featureData";
import { toast } from "sonner";

interface LanguageAssistantViewProps {
  onBack: () => void;
}

const LANGUAGES = ["hindi", "telugu", "tamil", "bengali", "marathi"] as const;
type Language = typeof LANGUAGES[number];

const LANG_INFO: Record<Language, { flag: string; script: string }> = {
  hindi: { flag: "🇮🇳", script: "देवनागरी" },
  telugu: { flag: "🇮🇳", script: "తెలుగు" },
  tamil: { flag: "🇮🇳", script: "தமிழ்" },
  bengali: { flag: "🇮🇳", script: "বাংলা" },
  marathi: { flag: "🇮🇳", script: "मराठी" },
};

const CATEGORIES = ["all", "greeting", "essential", "shopping", "food", "travel", "emergency"];
const CAT_ICONS: Record<string, string> = {
  all: "📋", greeting: "🙏", essential: "⚡", shopping: "🛍️", food: "🍛", travel: "✈️", emergency: "🚨",
};

export default function LanguageAssistantView({ onBack }: LanguageAssistantViewProps) {
  const [language, setLanguage] = useState<Language>("hindi");
  const [category, setCategory] = useState("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filtered = category === "all" ? TRAVEL_PHRASES : TRAVEL_PHRASES.filter(p => p.category === category);

  const copyPhrase = (phrase: PhraseTranslation) => {
    navigator.clipboard.writeText(phrase[language]);
    toast.success("Copied! 📋");
  };

  const toggleFavorite = (english: string) => {
    setFavorites(prev => {
      const n = new Set(prev);
      if (n.has(english)) n.delete(english);
      else n.add(english);
      return n;
    });
  };

  // Sort favorites to top
  const sorted = [...filtered].sort((a, b) => {
    const aFav = favorites.has(a.english) ? -1 : 0;
    const bFav = favorites.has(b.english) ? -1 : 0;
    return aFav - bFav;
  });

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-xl transition"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
        <div className="flex-1">
          <h2 className="text-lg font-display font-bold text-foreground">Language Assistant 🌍</h2>
          <p className="text-[10px] text-muted-foreground font-medium">Speak like a local • {favorites.size} saved</p>
        </div>
      </div>

      {/* Language selector with script info */}
      <div className="px-5 pb-2 flex gap-2 overflow-x-auto ts-scrollbar-hide">
        {LANGUAGES.map(l => (
          <button key={l} onClick={() => setLanguage(l)}
            className={`text-[10px] font-bold px-3 py-2 rounded-xl transition capitalize whitespace-nowrap flex items-center gap-1.5 ${language === l ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
            <span className="text-xs">{LANG_INFO[l].flag}</span>
            {l}
          </button>
        ))}
      </div>

      {/* Script info */}
      <div className="px-5 pb-2">
        <div className="flex items-center gap-2 bg-ts-saffron/5 rounded-xl px-3 py-2 border border-ts-saffron/10">
          <BookOpen className="w-3.5 h-3.5 text-ts-saffron" />
          <span className="text-[10px] text-muted-foreground">Script: <strong className="text-foreground">{LANG_INFO[language].script}</strong></span>
        </div>
      </div>

      {/* Category filter */}
      <div className="px-5 pb-3 flex gap-2 overflow-x-auto ts-scrollbar-hide">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition capitalize whitespace-nowrap flex items-center gap-1 ${category === c ? "bg-ts-saffron/10 text-ts-saffron" : "bg-muted text-muted-foreground"}`}>
            <span>{CAT_ICONS[c]}</span>
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-3 ts-scrollbar-hide">
        {sorted.map((phrase, i) => {
          const isFav = favorites.has(phrase.english);
          return (
            <motion.div key={phrase.english} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`bg-card rounded-2xl ts-shadow-card border p-4 transition ${isFav ? "border-ts-saffron/30" : "border-border"}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-foreground flex-1">{phrase.english}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleFavorite(phrase.english)} className="p-1 rounded-lg hover:bg-muted transition">
                    <Star className={`w-3.5 h-3.5 transition ${isFav ? "fill-ts-saffron text-ts-saffron" : "text-muted-foreground"}`} />
                  </button>
                  <span className="text-[8px] bg-muted text-muted-foreground px-2 py-0.5 rounded capitalize">{CAT_ICONS[phrase.category]} {phrase.category}</span>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-ts-saffron shrink-0" />
                <p className="text-sm font-bold text-foreground flex-1">{phrase[language]}</p>
                <button
                  onClick={() => copyPhrase(phrase)}
                  className="p-1.5 bg-card rounded-lg hover:bg-muted border border-border active:scale-90 transition"
                >
                  <Copy className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
              <p className="text-[9px] text-muted-foreground/60 mt-1.5 italic">💡 Tip: Pronounce it slowly, locals will appreciate the effort!</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
