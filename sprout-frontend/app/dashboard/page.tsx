"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Leaf, 
  Sparkles, 
  TrendingUp, 
  Wind, 
  Waves, 
  Trees, 
  Activity, 
  BookOpen, 
  Hourglass, 
  Zap, 
  Smile, 
  Award, 
  Plus, 
  Navigation,
  Footprints,
  Car,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Lock,
  Globe,
  Loader2,
  Check,
  Flame,
  X,
  Target
} from "lucide-react";
import API from "@/services/api";

// Animates a number counting up from 0 to `value` whenever `value` changes.
function CountUp({
  value,
  decimals = 0,
  duration = 1.2,
  className,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const from = 0;
    const to = value;

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic for a natural, decelerating count-up
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <span className={className}>
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}
    </span>
  );
}

interface Pet {
  name: string;
  energy: number;
  happiness: number;
  level: number;
}

interface World {
  forest: number;
  river: number;
  air: number;
  wildlife: number;
}

interface Streak {
  current_streak: number;
  longest_streak: number;
}

// Evolution Milestones — static stage definitions used to render the
// horizontal evolution journey timeline. Each stage maps 1:1 to a pet level.
const EVOLUTION_STAGES = [
  {
    level: 1,
    emoji: "🌱",
    title: "Sprout Initiator",
    gradient: "from-emerald-400/20 to-emerald-500/10",
    border: "border-emerald-500/30 dark:border-emerald-500/20",
    text: "text-emerald-500",
    solidBadge: "bg-emerald-500",
    label: "text-emerald-600 dark:text-emerald-400",
    glow: "shadow-emerald-500/20",
    ring: "ring-emerald-400/50",
  },
  {
    level: 2,
    emoji: "🌿",
    title: "Canopy Protector",
    gradient: "from-teal-400/20 to-teal-500/10",
    border: "border-teal-500/30 dark:border-teal-500/20",
    text: "text-teal-500",
    solidBadge: "bg-teal-500",
    label: "text-teal-600 dark:text-teal-400",
    glow: "shadow-teal-500/20",
    ring: "ring-teal-400/50",
  },
  {
    level: 3,
    emoji: "🪴",
    title: "Habitat Weaver",
    gradient: "from-amber-400/20 to-amber-500/10",
    border: "border-amber-500/30 dark:border-amber-500/20",
    text: "text-amber-500",
    solidBadge: "bg-amber-500",
    label: "text-amber-600 dark:text-amber-400",
    glow: "shadow-amber-500/20",
    ring: "ring-amber-400/50",
  },
  {
    level: 4,
    emoji: "🌳",
    title: "Planet Guardian",
    gradient: "from-violet-400/20 to-violet-500/10",
    border: "border-violet-500/30 dark:border-violet-500/20",
    text: "text-violet-500",
    solidBadge: "bg-violet-500",
    label: "text-violet-600 dark:text-violet-400",
    glow: "shadow-violet-500/20",
    ring: "ring-violet-400/50",
  },
];

export default function Home() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [world, setWorld] = useState<World | null>(null);
  const [message, setMessage] = useState("");
  const [memory, setMemory] = useState("");
  const [memories, setMemories] = useState<string[]>([]);
  const [completedGoals, setCompletedGoals] = useState<number[]>([]);
  const [diary, setDiary] = useState("");
  
  // Custom states for production UX
  const [isDiaryLoading, setIsDiaryLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [isGoalsLoading, setIsGoalsLoading] = useState(false);
  const [goalSuccess, setGoalSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  // NOTE: the initial history load on mount fetches a 30-day window
  // (see `loadHistory(30)` below). This default must match that window,
  // otherwise the very first call that re-fetches history using this state
  // (e.g. after logging an action) silently shrinks the dataset from 30
  // days down to 7 — which is exactly the kind of stale-state mismatch
  // that caused the streak figures to drift from the rest of the
  // dashboard's progress data.
  const [historyDays, setHistoryDays] = useState(30);
  const [historyActions, setHistoryActions] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [showStreakModal, setShowStreakModal] = useState(false);
  const [comingSoonLabel, setComingSoonLabel] = useState<string | null>(null);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  // Companion popup notification state (replaces the old Live Companion Feed card)
  const [companionPopups, setCompanionPopups] = useState<
    { id: number; action: string; text: string }[]
  >([]);

  //Celebration popup
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  // Achievement popup — queue-based so simultaneous unlocks display one after
  // another without any being silently dropped. `achievementQueue` holds every
  // achievement waiting to be shown; `currentAchievement` is the one actively
  // displayed; `shownAchievements` guards against re-showing the same badge.
  const [achievementQueue, setAchievementQueue] = useState<any[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  // Keep newAchievement as an alias so any other references in the file still compile.
  const newAchievement = currentAchievement;
  const [shownAchievements, setShownAchievements] = useState<string[]>([]);

  // --- Carbon Impact: derived from the same historyActions data the
  // History modal and Achievements already use, so nothing is duplicated.
  // Each logged eco action is assumed to save an average of 0.6 kg of CO2 —
  // a transparent, conservative estimate applied consistently across all
  // action types, used purely to translate "actions taken" into a relatable
  // carbon figure.
  const CO2_PER_ACTION_KG = 0.6;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  const startOfMonth = new Date(startOfToday);
  startOfMonth.setDate(startOfMonth.getDate() - 29);

  const countSince = (cutoff: Date) =>
    historyActions.filter((a: any) => new Date(a.timestamp) >= cutoff).length;


  const impact = {
    today: Math.round(countSince(startOfToday) * CO2_PER_ACTION_KG * 10) / 10,
    week: Math.round(countSince(startOfWeek) * CO2_PER_ACTION_KG * 10) / 10,
    month: Math.round(countSince(startOfMonth) * CO2_PER_ACTION_KG * 10) / 10,
  };

  // Real-world equivalents, derived from the month's CO2 figure using
  // commonly cited conversion benchmarks:
  // ~21 kg CO2 absorbed per young tree per year (scaled down to a monthly share)
  // ~0.12 kg CO2 emitted per km of average car travel
  // ~0.4 kg CO2 emitted per kWh of grid electricity
  const impactEquivalents = {
    trees: Math.max(1, Math.round((impact.month / 21) * 12)),
    car_km: Math.round(impact.month / 0.12),
    electricity: Math.round(impact.month / 0.4),
  };

  // A short, encouraging insight generated from the user's real impact data.
  const getImpactInsight = () => {
    if (impact.month <= 0) {
      return "Log your first eco action to start seeing your real-world impact here.";
    }
    if (impact.week >= 5) {
      return `If every person made choices like yours this week, thousands of kilograms of CO₂ could be avoided.`;
    }
    if (impactEquivalents.electricity >= 5) {
      return `Your sustainable actions this month have saved enough carbon to power an average home for nearly a day.`;
    }
    return `Small actions add up. Your impact this month is equivalent to planting ${impactEquivalents.trees} young tree${impactEquivalents.trees === 1 ? "" : "s"}.`;
  };

  // Mon–Sun breakdown of this week's CO2 impact, derived from the same
  // historyActions data and CO2_PER_ACTION_KG estimate used above.
  const weeklyDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyImpactBreakdown = weeklyDayLabels.map((label, idx) => {
    const date = new Date(startOfToday);
    // JS getDay(): 0=Sun..6=Sat. We want Monday-first, so map idx 0..6 -> Mon..Sun.
    const todayDow = startOfToday.getDay(); // 0=Sun..6=Sat
    const todayMonFirst = todayDow === 0 ? 6 : todayDow - 1;
    const offset = todayMonFirst - idx;
    date.setDate(date.getDate() - offset);

    const dayActions = historyActions.filter((a: any) => {
      const t = new Date(a.timestamp);
      return (
        t.getFullYear() === date.getFullYear() &&
        t.getMonth() === date.getMonth() &&
        t.getDate() === date.getDate()
      );
    }).length;

    const kg = Math.round(dayActions * CO2_PER_ACTION_KG * 10) / 10;
    const level: "high" | "medium" | "none" = kg >= 2 ? "high" : kg > 0 ? "medium" : "none";

    return { label, kg, level, isFuture: date > startOfToday };
  });
  const weeklyImpactTotal =
    Math.round(weeklyImpactBreakdown.reduce((sum, d) => sum + d.kg, 0) * 10) / 10;

  // --- Streak: single source of truth, derived from the SAME
  // historyActions array (and the same local day-boundary / startOfToday
  // reference) used to power Carbon Impact above. This used to be fetched
  // from a separate `/streak` endpoint with its own independent refresh
  // timing — exactly the kind of duplicate state that let the navbar
  // streak drift out of sync with the rest of the dashboard's progress
  // data. Computing it client-side here means streak and Carbon Impact can
  // never disagree about what "happened": they read the same data, kept
  // fresh by the same loadHistory() calls (on mount, after every logged
  // action, and whenever the history window is refreshed).
  const getLocalDayKey = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  // activeDayKeys is THE canonical answer to "did the user log at least one
  // eco action on this calendar day" — grouped using the exact same local
  // Year/Month/Date components that Weekly Carbon Impact's day-by-day
  // breakdown (weeklyImpactBreakdown, above) uses to bucket historyActions.
  // Every streak-related UI element (current streak, longest streak,
  // milestone progress, AND the 7-day streak calendar) is derived from this
  // single Set, so none of them can ever disagree with each other — or with
  // Weekly Carbon Impact — about which specific days were active.
  const activeDayKeys = new Set(
    historyActions.map((a: any) => getLocalDayKey(new Date(a.timestamp)))
  );

  const computeStreakFromHistory = (activeDays: Set<string>): Streak => {
    // Current streak: walk backward from today, counting consecutive
    // active days. If no action has been logged yet today, the streak
    // isn't broken until the day actually ends, so counting starts from
    // yesterday in that case instead of zeroing out the streak the instant
    // the clock rolls over to a new day.
    let current = 0;
    const cursor = new Date(startOfToday);
    if (!activeDays.has(getLocalDayKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (activeDays.has(getLocalDayKey(cursor))) {
      current += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Longest streak: the longest run of consecutive active days anywhere
    // within the fetched history window.
    const oneDay = 86400000;
    const sortedTimes = [...activeDays]
      .map((key) => {
        const [y, m, d] = key.split("-").map(Number);
        return new Date(y, m, d).getTime();
      })
      .sort((a, b) => a - b);

    let longest = 0;
    let run = 0;
    let prevTime: number | null = null;
    for (const t of sortedTimes) {
      run = prevTime !== null && t - prevTime === oneDay ? run + 1 : 1;
      longest = Math.max(longest, run);
      prevTime = t;
    }

    return {
      current_streak: current,
      longest_streak: Math.max(longest, current),
    };
  };

  const streak = computeStreakFromHistory(activeDayKeys);

  const loadPet = async () => {
    try {
      const petRes = await API.get("/pet");
      const worldRes = await API.get("/world");
      setPet(petRes.data);
      setWorld(worldRes.data);
    } catch (error) {
      console.error("Failed to load pet and world data", error);
    }
  };

  const loadDiary = async () => {
    setIsDiaryLoading(true);
    try {
      const res = await API.get("/diary");
      setDiary(res.data.entry);
    } catch (error) {
      console.error("Failed to generate diary", error);
    } finally {
      setIsDiaryLoading(false);
    }
  };

  const loadMemories = async () => {
    try {
      const res = await API.get("/memory");
      setMemories(res.data.memories);
    } catch (error) {
      console.error("Failed to load goals", error);
    }
  };

  const toggleGoalCompletion = (index: number) => {
    setCompletedGoals((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const totalGoals = memories.length;
  const completedCount = completedGoals.length;

  const goalPercentage =
    totalGoals > 0
      ? (completedCount / totalGoals) * 100
      : 0;

  const climateChampion =
    totalGoals > 0 &&
    completedCount === totalGoals;
  
  const checkGoalCompletion = (action: string) => {
    const matchingGoalIndices: number[] = [];

    memories.forEach((goal, index) => {
      const lowerGoal = goal.toLowerCase();

      // Walk / Cycle Goals
      if (
        action === "walk_cycle" &&
        (
          lowerGoal.includes("cycle") ||
          lowerGoal.includes("cycling") ||
          lowerGoal.includes("bike") ||
          lowerGoal.includes("bicycle") ||
          lowerGoal.includes("walk") ||
          lowerGoal.includes("walking") ||
          lowerGoal.includes("commute") ||
          lowerGoal.includes("travel sustainably")
        )
      ) {
        matchingGoalIndices.push(index);
      }

      // Public Transport Goals
      if (
        action === "public_transport" &&
        (
          lowerGoal.includes("public transport") ||
          lowerGoal.includes("bus") ||
          lowerGoal.includes("train") ||
          lowerGoal.includes("metro") ||
          lowerGoal.includes("subway") ||
          lowerGoal.includes("tram") ||
          lowerGoal.includes("commute") ||
          lowerGoal.includes("transport")
        )
      ) {
        matchingGoalIndices.push(index);
      }

      // Save Energy Goals
      if (
        action === "save_energy" &&
        (
          lowerGoal.includes("light") ||
          lowerGoal.includes("lights") ||
          lowerGoal.includes("electric") ||
          lowerGoal.includes("electricity") ||
          lowerGoal.includes("energy") ||
          lowerGoal.includes("power") ||
          lowerGoal.includes("switch off") ||
          lowerGoal.includes("turn off") ||
          lowerGoal.includes("fan") ||
          lowerGoal.includes("fans") ||
          lowerGoal.includes("ac") ||
          lowerGoal.includes("air conditioner") ||
          lowerGoal.includes("air conditioning") ||
          lowerGoal.includes("cooling") ||
          lowerGoal.includes("heater") ||
          lowerGoal.includes("heating") ||
          lowerGoal.includes("appliance") ||
          lowerGoal.includes("appliances") ||
          lowerGoal.includes("charging") ||
          lowerGoal.includes("charger") ||
          lowerGoal.includes("plug") ||
          lowerGoal.includes("unplug") ||
          lowerGoal.includes("reduce electricity") ||
          lowerGoal.includes("save electricity") ||
          lowerGoal.includes("reduce energy") ||
          lowerGoal.includes("energy efficient")
        )
      ) {
        matchingGoalIndices.push(index);
      }

      // Recycling Goals
      if (
        action === "recycle" &&
        (
          lowerGoal.includes("recycle") ||
          lowerGoal.includes("recycling") ||
          lowerGoal.includes("waste") ||
          lowerGoal.includes("trash") ||
          lowerGoal.includes("garbage") ||
          lowerGoal.includes("plastic") ||
          lowerGoal.includes("paper") ||
          lowerGoal.includes("cardboard") ||
          lowerGoal.includes("glass") ||
          lowerGoal.includes("metal") ||
          lowerGoal.includes("aluminium") ||
          lowerGoal.includes("aluminum") ||
          lowerGoal.includes("segregate") ||
          lowerGoal.includes("segregation") ||
          lowerGoal.includes("reuse waste") ||
          lowerGoal.includes("waste management") ||
          lowerGoal.includes("reduce waste") ||
          lowerGoal.includes("sorting waste") ||
          lowerGoal.includes("eco waste") ||
          lowerGoal.includes("compost") ||
          lowerGoal.includes("composting")
        )
      ) {
        matchingGoalIndices.push(index);
      }

      // Reusable Products Goals
      if (
        action === "reusable_products" &&
        (
          lowerGoal.includes("reusable") ||
          lowerGoal.includes("reuse") ||
          lowerGoal.includes("plastic") ||
          lowerGoal.includes("single use") ||
          lowerGoal.includes("single-use") ||
          lowerGoal.includes("bottle") ||
          lowerGoal.includes("water bottle") ||
          lowerGoal.includes("bag") ||
          lowerGoal.includes("shopping bag") ||
          lowerGoal.includes("cloth bag") ||
          lowerGoal.includes("tote bag") ||
          lowerGoal.includes("cup") ||
          lowerGoal.includes("mug") ||
          lowerGoal.includes("container") ||
          lowerGoal.includes("lunch box") ||
          lowerGoal.includes("straw") ||
          lowerGoal.includes("cutlery") ||
          lowerGoal.includes("utensils") ||
          lowerGoal.includes("eco-friendly products") ||
          lowerGoal.includes("sustainable products") ||
          lowerGoal.includes("reduce plastic") ||
          lowerGoal.includes("avoid plastic") ||
          lowerGoal.includes("zero waste") ||
          lowerGoal.includes("eco products")
        )
      ) {
        matchingGoalIndices.push(index);
      }

      // Plant-Based Goals
      if (
        action === "plant_based" &&
        (
          lowerGoal.includes("plant") ||
          lowerGoal.includes("plant-based") ||
          lowerGoal.includes("vegetarian") ||
          lowerGoal.includes("vegan") ||
          lowerGoal.includes("meat") ||
          lowerGoal.includes("less meat") ||
          lowerGoal.includes("healthy eating") ||
          lowerGoal.includes("sustainable food")
        )
      ) {
        matchingGoalIndices.push(index);
      }
    });

    setCompletedGoals((prev) => [
      ...new Set([...prev, ...matchingGoalIndices])
    ]);
  };

  // NOTE: streak data used to be fetched from a separate `/streak` endpoint
  // here via its own loadStreak() call. That gave the app two independent
  // sources of "progress" truth — historyActions (driving Carbon Impact)
  // and a separately-fetched streak record — which could trivially drift
  // out of sync (different refresh timing, different day-boundary/timezone
  // logic server-side, etc). Streak is now derived directly from
  // historyActions (see computeStreakFromHistory, defined alongside the
  // Carbon Impact calculation below) so there is exactly one source of
  // truth for both.

  // Action-specific companion popup copy (replaces the old Live Companion Feed card)
  const companionPopupMessages: Record<string, string> = {
    walk_cycle: "🚶 Great job! You avoided unnecessary emissions today.",
    public_transport: "🚌 Awesome choice! Public transport helps reduce traffic and pollution.",
    save_energy: "⚡ Energy saved! Every watt counts toward a greener future.",
    plant_based: "🥗 Nice! Plant-based meals help lower carbon emissions.",
    recycle: "♻️ Recycling keeps valuable resources in circulation.",
    reusable: "👜 Reusables for the win! Small habits create big impact.",
    reusable_products: "👜 Reusables for the win! Small habits create big impact.",
  };

  const dismissCompanionPopup = (id: number) => {
    setCompanionPopups((prev) => prev.filter((p) => p.id !== id));
  };

  const pushCompanionPopup = (action: string) => {
    const text = companionPopupMessages[action];
    if (!text) return;
    const id = Date.now() + Math.random();
    setCompanionPopups((prev) => [...prev, { id, action, text }]);
    setTimeout(() => dismissCompanionPopup(id), 5000);
  };

  // Closes the achievement popup and clears currentAchievement so the queue-
  // drain useEffect can immediately pick up the next item (if any).
  const dismissAchievementPopup = () => {
    setShowAchievementPopup(false);
    // Delay clearing the current item until after AnimatePresence exit (~350 ms)
    // so the exit animation isn't cut short.
    setTimeout(() => setCurrentAchievement(null), 400);
  };

  useEffect(() => {
    loadPet();
    loadMemories();
    loadHistory(30);
  }, []);

  // Close any open navbar popup on Escape key press
  useEffect(() => {
    const anyOpen = showStreakModal || showHistory || showAchievementsModal || showImpactModal || showGoalsModal;
    if (!anyOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowStreakModal(false);
        setShowHistory(false);
        setShowAchievementsModal(false);
        setShowImpactModal(false);
        setShowGoalsModal(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showStreakModal, showHistory, showAchievementsModal, showImpactModal, showGoalsModal]);

  const performAction = async (action: string) => {
    setIsActionLoading(action);

    try {
      const token = localStorage.getItem("token");
      const previousLevel = pet?.level ?? 1;
      const res = await API.post(
        `/action/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPet(res.data.pet);
      const updatedLevel = res.data.pet.level;
      if (updatedLevel > previousLevel) {
        setNewLevel(updatedLevel);
        setShowLevelUp(true);
      }
      setWorld(res.data.world);
      setMessage(res.data.message);
      checkGoalCompletion(action);
      // Re-fetching history alone is sufficient to keep every derived metric
      // in sync — Carbon Impact AND Streak both read from historyActions,
      // so there is no separate streak refresh to run here anymore.
      await Promise.all([
        loadHistory(historyDays),
        loadPet(),
      ]);
      pushCompanionPopup(action);

    } catch (error) {
      console.error("Failed to perform action", error);

    } finally {
      setIsActionLoading(null);
    }
  };

  const loadHistory = async (days: number) => {
    setHistoryLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await API.get(
        `/history/${days}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistoryActions(response.data.actions);
      setHistoryDays(days);

    } catch (error) {
      console.error("Failed to load history", error);

    } finally {
      setHistoryLoading(false);
    }
  };

  const saveMemory = async () => {
    if (!memory.trim()) return;
    setIsGoalsLoading(true);
    try {
      await API.post(`/memory?text=${encodeURIComponent(memory)}`);
      await loadMemories();
      setMemory("");
      setGoalSuccess(true);
      setTimeout(() => setGoalSuccess(false), 4000);
    } catch (error) {
      console.error("Failed to save memory", error);
    } finally {
      setIsGoalsLoading(false);
    }
  };

  const getPetEmoji = () => {
    if (!pet) return "🌱";
    if (pet.level >= 4) return "🌳";
    if (pet.level >= 3) return "🪴";
    if (pet.level >= 2) return "🌿";
    return "🌱";
  };

  const getPetTitle = () => {
    if (!pet) return "Seedling Explorer";
    if (pet.level >= 4) return "Ancient Climate Guardian";
    if (pet.level >= 3) return "Growing Ecosystem";
    if (pet.level >= 2) return "Young Forest";
    return "Seedling Explorer";
  };

  // Evolution thresholds info for progress calculation
  const getEvolutionProgress = () => {
    if (!pet) return { percentage: 0, nextLevel: "Young Forest", target: 120, current: 0 };
    if (pet.level >= 4) return { percentage: 100, nextLevel: "Max Level Reached", target: 200, current: pet.energy };
    if (pet.level === 3) return { percentage: Math.min(100, Math.max(0, ((pet.energy - 150) / 50) * 100)), nextLevel: "Ancient Climate Guardian", target: 200, current: pet.energy };
    if (pet.level === 2) return { percentage: Math.min(100, Math.max(0, ((pet.energy - 120) / 30) * 100)), nextLevel: "Growing Ecosystem", target: 150, current: pet.energy };
    return { percentage: Math.min(100, Math.max(0, (pet.energy / 120) * 100)), nextLevel: "Young Forest", target: 120, current: pet.energy };
  };

  // Get background gradient based on level
  const getPetGradient = () => {
    if (!pet) return "from-emerald-500/10 to-teal-500/10 border-emerald-500/20";
    if (pet.level >= 4) return "from-violet-500/20 via-emerald-500/10 to-indigo-500/20 border-violet-500/30 dark:border-violet-500/20 shadow-violet-500/10";
    if (pet.level >= 3) return "from-amber-500/20 via-emerald-500/10 to-teal-500/20 border-amber-500/30 dark:border-amber-500/20 shadow-amber-500/10";
    if (pet.level >= 2) return "from-teal-500/20 via-emerald-500/10 to-emerald-500/20 border-teal-500/30 dark:border-teal-500/20 shadow-teal-500/10";
    return "from-emerald-500/15 via-green-500/5 to-emerald-500/15 border-emerald-500/30 dark:border-emerald-500/20 shadow-emerald-500/5";
  };

  // Determine the next streak milestone above the user's current streak
  const getNextMilestone = (current: number) => {
    const milestones = [1, 3, 7, 10, 14, 30, 50, 100];
    const next = milestones.find((m) => m > current);
    return next ?? milestones[milestones.length - 1];
  };

  //Leveling up
  const levelTitles: Record<number, string> = {
    1: "Seedling Explorer",
    2: "Young Forest",
    3: "Growing Ecosystem",
    4: "Ancient Climate Guardian",
  };

  const levelEmoji: Record<number, string> = {
    2: "🌿",
    3: "🌳",
    4: "🏆",
  };

  const levelRewards: Record<number, string> = {
    2: "+10 Growth XP",
    3: "+20 Growth XP",
    4: "Final Evolution Achieved",
  };


  // Dynamic calculations for the game-inspired sustainability achievements card
  const achievements = [
    {
    id: "first_step",
    title: "First Step",
    desc: "Every forest starts with a single seed. Complete your first eco action.",
    icon: "🌱",
    current: Math.min(historyActions.length, 1),
    target: 1,
    unlocked: historyActions.length >= 1,
  },

  {
    id: "green_explorer",
    title: "Green Explorer",
    desc: "Small choices create big change. Complete 10 eco-friendly actions.",
    icon: "🚶",
    current: Math.min(historyActions.length, 10),
    target: 10,
    unlocked: historyActions.length >= 10,
  },

  {
    id: "transit_champion",
    title: "Transit Champion",
    desc: "Less traffic, cleaner skies. Choose public transport 10 times.",
    icon: "🚌",
    current: Math.min(
      historyActions.filter(
        (a: any) => a.action === "public_transport"
      ).length,
      10
    ),
    target: 10,
    unlocked:
      historyActions.filter(
        (a: any) => a.action === "public_transport"
      ).length >= 10,
  },

  {
    id: "pedal_power",
    title: "Pedal Power",
    desc: "Two wheels, zero emissions. Walk or cycle 10 times.",
    icon: "🚲",
    current: Math.min(
      historyActions.filter(
        (a: any) => a.action === "walk_cycle"
      ).length,
      10
    ),
    target: 10,
    unlocked:
      historyActions.filter(
        (a: any) => a.action === "walk_cycle"
      ).length >= 10,
  },

  {
    id: "energy_saver",
    title: "Energy Saver",
    desc: "Bright ideas save power. Reduce electricity usage 10 times.",
    icon: "💡",
    current: Math.min(
      historyActions.filter(
        (a: any) => a.action === "save_energy"
      ).length,
      10
    ),
    target: 10,
    unlocked:
      historyActions.filter(
        (a: any) => a.action === "save_energy"
      ).length >= 10,
  },

  {
    id: "recycling_hero",
    title: "Recycling Hero",
    desc: "Give waste a second life. Recycle 10 times.",
    icon: "♻️",
    current: Math.min(
      historyActions.filter(
        (a: any) => a.action === "recycle"
      ).length,
      10
    ),
    target: 10,
    unlocked:
      historyActions.filter(
        (a: any) => a.action === "recycle"
      ).length >= 10,
  },

  {
    id: "conscious_consumer",
    title: "Conscious Consumer",
    desc: "Reuse today, protect tomorrow. Use reusable products 10 times.",
    icon: "🛍️",
    current: Math.min(
      historyActions.filter(
        (a: any) => a.action === "reusable"
      ).length,
      10
    ),
    target: 10,
    unlocked:
      historyActions.filter(
        (a: any) => a.action === "reusable"
      ).length >= 10,
  },

  {
    id: "green_plate",
    title: "Green Plate",
    desc: "Good for you, good for Earth. Choose plant-based meals 10 times.",
    icon: "🥗",
    current: Math.min(
      historyActions.filter(
        (a: any) => a.action === "plant_based"
      ).length,
      10
    ),
    target: 10,
    unlocked:
      historyActions.filter(
        (a: any) => a.action === "plant_based"
      ).length >= 10,
  },

  {
    id: "earth_protector",
    title: "Earth Protector",
    desc: "A true force for sustainability. Complete 50 eco actions.",
    icon: "🌍",
    current: Math.min(historyActions.length, 50),
    target: 50,
    unlocked: historyActions.length >= 50,
  },

  {
    id: "climate_guardian",
    title: "Climate Guardian",
    desc: "Sprout has fully evolved thanks to your efforts. Reach Level 4.",
    icon: "🏆",
    current: Math.min((pet?.level ?? 1), 4),
    target: 4,
    unlocked: (pet?.level ?? 1) >= 4,
  },
  {
    id: "daily_climate_champion",
    title: "Daily Climate Champion",
    desc: "Earn the Daily Climate Champion title.",
    icon: "🏅",

    current: Math.min(
      climateChampion ? 1 : 0,
      1
    ),

    target: 1,

    unlocked: climateChampion,
  },

  {
    id: "streak_starter",
    title: "Streak Starter",
    desc: "Maintain a 3-day eco streak.",
    icon: "🔥",

    current: Math.min(
      streak?.current_streak??0,
      3
    ),

    target: 3,

    unlocked: (streak?.current_streak??0) >= 3,
  },

  {
    id: "consistency_hero",
    title: "Consistency Hero",
    desc: "Maintain a 7-day eco streak.",
    icon: "⭐",

    current: Math.min(
      streak?.current_streak??0,
      7
    ),

    target: 7,

    unlocked: (streak?.current_streak??0) >= 7,
  },

  {
    id: "carbon_crusher",
    title: "Carbon Crusher",
    desc: "Save 50 kg of CO₂ through sustainable actions.",
    icon: "🌿",

    current: Math.min(
      weeklyImpactTotal,
      50
    ),

    target: 50,

    unlocked: weeklyImpactTotal >= 50,
  },

  {
    id: "planet_legend",
    title: "Planet Legend",
    desc: "Reach 100 kg of cumulative CO₂ savings.",
    icon: "🏆",

    current: Math.min(
      weeklyImpactTotal,
      100
    ),

    target: 100,

    unlocked: weeklyImpactTotal >= 100,
  },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  // Stage 1 — enqueue any newly-unlocked achievements that haven't been shown yet.
  // We only touch shownAchievements here (add IDs immediately so that rapid
  // re-renders of `achievements` don't double-enqueue the same badge).
  useEffect(() => {
    const newlyUnlocked = achievements.filter(
      (a) => a.unlocked && !shownAchievements.includes(a.id)
    );

    if (newlyUnlocked.length === 0) return;

    setShownAchievements((prev) => [...prev, ...newlyUnlocked.map((a) => a.id)]);
    setAchievementQueue((prev) => [...prev, ...newlyUnlocked]);
  }, [achievements]);

  // Stage 2 — drain the queue one entry at a time.  We only start the next
  // popup once the current one has fully exited (showAchievementPopup === false
  // AND currentAchievement has been cleared), which prevents two modals
  // stacking on top of each other.
  useEffect(() => {
    if (showAchievementPopup || currentAchievement) return; // one showing already
    if (achievementQueue.length === 0) return;

    const [next, ...rest] = achievementQueue;
    setAchievementQueue(rest);
    setCurrentAchievement(next);
    setShowAchievementPopup(true);
  }, [achievementQueue, showAchievementPopup, currentAchievement]);

  // Variants typed securely using Framer Motion's exported type interface to protect layout rendering compilation
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 300, damping: 24 } 
    }
  };

  if (!pet || !world) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-6"
        >
          <Leaf className="w-10 h-10 text-emerald-500" />
        </motion.div>
        <div className="h-2 w-48 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full bg-emerald-500"
          />
        </div>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-4 font-medium animate-pulse">
          Nurturing Sprout...
        </p>
      </div>
    );
  }

  // Calculate composite Sustainability Score
  const sustainabilityScore = Math.round((world.forest + world.river + world.air + world.wildlife) / 4);
  const evoProgress = getEvolutionProgress();

  // Evolution Milestones — how far the connecting timeline should fill,
  // accounting for both completed stages and in-progress percentage toward
  // the next one (4 stages = 3 gaps between nodes).
  const evolutionStageCount = EVOLUTION_STAGES.length;
  const timelineFillPercent = pet
    ? Math.min(
        100,
        Math.max(
          0,
          (((pet.level - 1) + evoProgress.percentage / 100) /
            (evolutionStageCount - 1)) *
            100
        )
      )
    : 0;

  const currentStreak = streak?.current_streak ?? 0;
  const longestStreak = streak?.longest_streak ?? 0;
  const nextMilestone = getNextMilestone(currentStreak);
  const milestoneProgress = Math.min(100, Math.round((currentStreak / nextMilestone) * 100));

  // Last 7 days for the streak calendar — "today" is the rightmost circle.
  //
  // BUG FIX: this used to mark a day "completed" via `offset < currentStreak`
  // — i.e. it just lit up the most recent N circles, where N is the
  // *aggregate* streak count. That assumes the streak is always an unbroken
  // run ending today, which silently highlights the wrong days the moment
  // there's a gap (e.g. actions logged Wed+Thu but not today: currentStreak
  // is correctly 2, but this formula would highlight "today" and
  // "yesterday" instead of the Wed/Thu that actually happened — exactly the
  // mismatch against Weekly Carbon Impact that was reported).
  //
  // Fixed: each day now looks itself up in activeDayKeys, the same per-day
  // active-day dataset (built from historyActions) that both
  // computeStreakFromHistory and Weekly Carbon Impact's day-by-day
  // breakdown are grounded in. So "completed" here means exactly the same
  // thing it means everywhere else: at least one eco action was logged on
  // that calendar date.
  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const streakCalendarDays = [...Array(7)].map((_, i) => {
    const offset = 6 - i; // i=0 -> 6 days ago, i=6 -> today
    const date = new Date(startOfToday);
    date.setDate(date.getDate() - offset);
    const isToday = offset === 0;
    const completed = activeDayKeys.has(getLocalDayKey(date));
    return {
      label: weekdayLabels[date.getDay()],
      completed,
      isToday,
    };
  });

  

  // Friendly icon + label for each logged action, reused by the History popup.
  const actionIconMap: Record<string, { icon: string; label: string }> = {
    walk_cycle: { icon: "🚶", label: "Walk/Cycle" },
    public_transport: { icon: "🚌", label: "Public Transport" },
    save_energy: { icon: "⚡", label: "Energy Saved" },
    recycle: { icon: "♻️", label: "Recycled" },
    reusable: { icon: "👜", label: "Reusable Products" },
    reusable_products: { icon: "👜", label: "Reusable Products" },
    plant_based: { icon: "🥗", label: "Plant-Based Meal" },
  };
  const getActionDisplay = (action: string) =>
    actionIconMap[action] ?? { icon: "🌱", label: action.replace(/_/g, " ") };

  // Friendly relative-day label: "Today, 8:42 AM" / "Yesterday, 4:15 PM" / full date otherwise.
  const formatHistoryTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now2 = new Date();
    const startToday = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate());
    const startThat = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((startToday.getTime() - startThat.getTime()) / 86400000);
    const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (diffDays === 0) return `Today, ${time}`;
    if (diffDays === 1) return `Yesterday, ${time}`;
    return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 pb-16 font-sans">
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border-b border-slate-200/50 dark:border-zinc-800/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Sprout</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-full">v1.2 Production</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Feature Icon Row */}
            <div className="flex items-center gap-1.5">
              {/* Streaks — functional */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowStreakModal(true)}
                className="relative flex items-center gap-1.5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-200/70 dark:border-orange-500/20 rounded-xl px-2.5 py-1.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                title="Streaks"
              >
                <motion.span
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="text-base leading-none"
                >
                  🔥
                </motion.span>
                <span className="text-sm font-black text-orange-600 dark:text-orange-400 leading-none">
                  {historyLoading && historyActions.length === 0 ? "–" : currentStreak}
                </span>
              </motion.button>

              {/* Achievements */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowAchievementsModal(true)}
                className="relative flex items-center gap-1.5 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10 border border-amber-200/70 dark:border-amber-500/20 rounded-xl px-2.5 py-1.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                title="Achievements"
              >
                <span className="text-base leading-none">🏆</span>
                <span className="hidden sm:inline text-sm font-black text-amber-600 dark:text-amber-400 leading-none">
                  {unlockedCount}/{totalCount}
                </span>
              </motion.button>

              {/* History */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  setShowHistory(true);
                  loadHistory(historyDays || 7);
                }}
                className="relative hidden sm:flex items-center justify-center h-9 w-9 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60 rounded-xl text-base hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="History"
              >
                📜
              </motion.button>

              {/* Impact */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowImpactModal(true)}
                className="relative flex items-center gap-1.5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200/70 dark:border-emerald-500/20 rounded-xl px-2.5 py-1.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                title="Impact"
              >
                <span className="text-base leading-none">🌍</span>
                <span className="hidden sm:inline text-sm font-black text-emerald-600 dark:text-emerald-400 leading-none">
                  {impact.week}kg
                </span>
              </motion.button>

              {/* Goals */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowGoalsModal(true)}
                className="relative hidden sm:flex items-center justify-center h-9 w-9 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60 rounded-xl text-base hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Goals"
              >
                🎯
              </motion.button>

              {/* Energy */}

              <div

                className="relative flex items-center gap-1.5 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10 border border-amber-200/70 dark:border-amber-500/20 rounded-xl px-2.5 py-1.5 shadow-sm"

                title="Energy"

              >

                <motion.div

                  animate={{ scale: [1, 1.15, 1] }}

                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}

                  className="flex items-center justify-center"

                >

                  <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />

                </motion.div>

                <span className="text-sm font-black text-amber-600 dark:text-amber-400 leading-none tabular-nums">

                  {pet.energy}

                </span>

              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400 font-medium">
              <Globe className="w-4 h-4 text-emerald-500" />
              <span>Sustainability Rating:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">{sustainabilityScore}%</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs text-slate-400 dark:text-zinc-500 font-semibold leading-3">Companion Level</div>
                <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">{getPetTitle()}</span>
              </div>
              <div className="h-9 w-9 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl flex items-center justify-center font-bold text-sm">
                Lvl {pet.level}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Hero and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Animated Pet Sphere Card */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden transition-all duration-300">
            {/* Subtle Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-50" />
            
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 max-w-sm z-10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                Your AI Climate Companion
              </span>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {getPetTitle()}
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
                  Growing greener together. Track sustainable habits, reduce your carbon footprint and help Sprout transform into a Climate Guardian. 🌱🌳
                </p>
              </div>

              {/* Stats Bar */}
              <div className="w-full space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/80 rounded-xl p-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold leading-3">Energy</div>
                      <div className="text-sm font-black text-slate-800 dark:text-zinc-200">{pet.energy} XP</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/80 rounded-xl p-3 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold leading-3">Happiness</div>
                      <div className="text-sm font-black text-slate-800 dark:text-zinc-200">{pet.happiness}%</div>
                    </div>
                  </div>
                </div>

                {/* Level Up progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    <span>Evolves into {evoProgress.nextLevel}</span>
                    <span>{evoProgress.current} / {evoProgress.target}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${evoProgress.percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Glowing Pet Orb Container */}
            <div className="flex-shrink-0 flex items-center justify-center relative w-56 h-56 z-10">
              {/* Outer pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-emerald-500/5 blur-xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <motion.div 
                className={`w-48 h-48 rounded-full bg-gradient-to-br ${getPetGradient()} border flex items-center justify-center relative shadow-2xl overflow-hidden`}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Dashed outer orbital ring */}
                <motion.div
                  className="absolute inset-2 border border-dashed border-emerald-500/20 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                />

                {/* Floating ecosystem particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full opacity-65"
                      style={{
                        top: `${25 + i * 13}%`,
                        left: `${15 + (i * 22) % 65}%`,
                      }}
                      animate={{
                        y: [0, -18, 0],
                        opacity: [0.3, 0.9, 0.3],
                        scale: [0.8, 1.2, 0.8]
                      }}
                      transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.5
                      }}
                    />
                  ))}
                </div>

                <span className="text-7xl select-none filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.25)]">
                  {getPetEmoji()}
                </span>
              </motion.div>
            </div>
          </div>

          {/* World Health Visualization Card */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-500" />
                  Ecosystem Health
                </h2>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-zinc-800 dark:text-zinc-500 px-2 py-1 rounded-md">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6">
                Help Sprout restore balance to its world one eco-action at a time. 🌍✨
              </p>
              
              <div className="space-y-4">
                {/* Forest */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5"><Trees className="w-3.5 h-3.5 text-emerald-500" /> Forest Cover</span>
                    <span>{world.forest}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${world.forest}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>

                {/* River */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5"><Waves className="w-3.5 h-3.5 text-blue-500" /> River Purity</span>
                    <span>{world.river}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${world.river}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Air */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-sky-400" /> Air Quality</span>
                    <span>{world.air}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${world.air}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-sky-400 rounded-full"
                    />
                  </div>
                </div>

                {/* Wildlife */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-rose-500" /> Wildlife Density</span>
                    <span>{world.wildlife}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${world.wildlife}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-rose-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-4 mt-6 flex justify-between items-center text-xs text-slate-400 dark:text-zinc-500 font-semibold">
              <span>Overall Planetary Balance</span>
              <span className="text-slate-700 dark:text-zinc-300">{sustainabilityScore}%</span>
            </div>
          </div>
        </div>

        {/* Evolution Milestones — Horizontal Journey Timeline */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 shadow-sm rounded-3xl p-6 md:p-8 relative overflow-hidden transition-all duration-300">
          {/* Ambient glows, consistent with hero card styling */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-300/15 dark:bg-emerald-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-teal-300/10 dark:bg-teal-500/5 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header row: title + next-stage progress indicator */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-3 h-3" />
                  Evolution Journey
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Evolution Milestones
                </h2>
                <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1 max-w-md">
                  Increase Sprout's level through carbon positive actions to unlock badges.
                </p>
              </div>

              {/* Progress to next stage */}
              <div className="w-full lg:w-72 flex-shrink-0">
                <div className="flex justify-between items-center text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1.5">
                  <span>
                    {evoProgress.nextLevel === "Max Level Reached"
                      ? "Max evolution reached"
                      : `Next: ${evoProgress.nextLevel}`}
                  </span>
                  <span className="font-bold text-slate-700 dark:text-zinc-300">
                    {Math.round(evoProgress.percentage)}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    role="progressbar"
                    aria-label="Evolution progress towards next stage"
                    aria-valuenow={Math.round(evoProgress.percentage)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    initial={{ width: 0 }}
                    animate={{ width: `${evoProgress.percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shine_2.5s_infinite] bg-[length:200%_100%]" />
                  </motion.div>
                </div>
                <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5 text-right">
                  {evoProgress.current} / {evoProgress.target} XP
                </div>
              </div>
            </div>

            {/* Horizontal timeline (stacks vertically on mobile) */}
            <div className="relative">
              {/* Connecting line track — only meaningful once nodes are laid out horizontally */}
              <div className="hidden sm:block absolute top-7 left-[12.5%] right-[12.5%] h-1 bg-slate-100 dark:bg-zinc-800 rounded-full" />
              <motion.div
                className="hidden sm:block absolute top-7 left-[12.5%] h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(timelineFillPercent / 100) * 75}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />

              <div
                className="grid grid-cols-1 sm:grid-cols-4 gap-5 sm:gap-4 relative"
                role="list"
                aria-label="Evolution milestones"
              >
                {EVOLUTION_STAGES.map((stage) => {
                  const status =
                    pet.level > stage.level
                      ? "unlocked"
                      : pet.level === stage.level
                      ? "current"
                      : "locked";

                  return (
                    <motion.div
                      key={stage.level}
                      whileHover={{ y: -3 }}
                      className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-0 text-left sm:text-center relative z-10 rounded-2xl sm:p-2 transition-all duration-300 hover:bg-slate-50/70 dark:hover:bg-zinc-800/30"
                    >
                      {/* Badge node */}
                      <motion.div
                        animate={
                          status === "current"
                            ? { scale: [1, 1.06, 1] }
                            : { scale: 1 }
                        }
                        transition={
                          status === "current"
                            ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                            : { duration: 0.2 }
                        }
                        className={`h-14 w-14 flex-shrink-0 rounded-2xl flex items-center justify-center text-2xl relative shadow-md border transition-all duration-300 ${
                          status === "unlocked"
                            ? `bg-gradient-to-br ${stage.gradient} ${stage.border} ${stage.text}`
                            : status === "current"
                            ? `bg-gradient-to-br ${stage.gradient} ${stage.border} ${stage.text} shadow-lg ${stage.glow} ring-4 ${stage.ring}`
                            : "bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-300 dark:text-zinc-600 grayscale"
                        }`}
                      >
                        {stage.emoji}

                        {status === "unlocked" && (
                          <div className={`absolute -bottom-1 -right-1 ${stage.solidBadge} text-white rounded-full p-0.5 border-2 border-white dark:border-zinc-900`}>
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        {status === "current" && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 border-2 border-white dark:border-zinc-900"
                          >
                            <Target className="w-2.5 h-2.5" />
                          </motion.div>
                        )}
                        {status === "locked" && (
                          <div className="absolute -bottom-1 -right-1 bg-slate-300 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400 rounded-full p-0.5 border-2 border-white dark:border-zinc-900">
                            <Lock className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </motion.div>

                      {/* Label */}
                      <div className="sm:mt-3 min-w-0">
                        <h4 className={`font-bold text-sm ${status === "locked" ? "text-slate-400 dark:text-zinc-500" : "text-slate-800 dark:text-zinc-200"}`}>
                          {stage.title}
                        </h4>
                        <p
                          className={`text-[11px] font-semibold mt-0.5 ${
                            status === "unlocked"
                              ? stage.label
                              : status === "current"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-slate-400 dark:text-zinc-500"
                          }`}
                        >
                          {status === "unlocked"
                            ? `Unlocked · Lvl ${stage.level}`
                            : status === "current"
                            ? `You are here · Lvl ${stage.level}`
                            : `Unlocks at Lvl ${stage.level}`}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Public Transport */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
                🚌
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-zinc-200">
                  Public Transport
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  More seats, fewer emissions! 🚌✨
                  Let's share the ride and give the skies a little breathing room.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t flex items-center justify-between">
              <div className="text-[10px] font-bold text-emerald-600">
                +3 Energy • +3 Air
              </div>

              <button
                aria-label="Log Public Transport Action"
                disabled={isActionLoading !== null}
                onClick={() => performAction("public_transport")}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                {isActionLoading === "public_transport" ? "..." : "Log Action"}
              </button>
            </div>
          </motion.div>

          {/* Walk / Cycle */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl">
                🚶
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-zinc-200">
                  Walk / Cycle
                </h3>

                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Powered by legs, not fuel! 🚶🍃
                  Every step and pedal helps keep the planet moving in the right direction.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t flex items-center justify-between">
              <div className="text-[10px] font-bold text-blue-600">
                +4 Energy • +2 Forest
              </div>

              <button
                aria-label="Log Walk or Cycle Action"
                disabled={isActionLoading !== null}
                onClick={() => performAction("walk_cycle")}
                className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold"
              >
                {isActionLoading === "walk_cycle" ? "..." : "Log Action"}
              </button>
            </div>
          </motion.div>

          {/* Recycle */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center text-xl">
                ♻️
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-zinc-200">
                  Recycle
                </h3>

                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Not everything belongs in a landfill! ♻️✨
                  Let's give old things a second chance and make nature smile.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t flex items-center justify-between">
              <div className="text-[10px] font-bold text-green-600">
                +5 Energy • +3 River
              </div>

              <button
                aria-label="Log Recycle Action"
                disabled={isActionLoading !== null}
                onClick={() => performAction("recycle")}
                className="px-3.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold"
              >
                {isActionLoading === "recycle" ? "..." : "Log Action"}
              </button>
            </div>
          </motion.div>

          {/* Save Energy */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center text-xl">
                💡
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-zinc-200">
                  Save Electricity
                </h3>

                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  A tiny switch can make a big difference! 💡🌿
                  Let's save a little energy today and a lot of emissions tomorrow.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t flex items-center justify-between">
              <div className="text-[10px] font-bold text-yellow-600">
                +3 Energy • +2 Air
              </div>

              <button
                aria-label="Log Save Electricity Action"
                disabled={isActionLoading !== null}
                onClick={() => performAction("save_energy")}
                className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-bold"
              >
                {isActionLoading === "save_energy" ? "..." : "Log Action"}
              </button>
            </div>
          </motion.div>

          {/* Reusable Products */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center text-xl">
                🥤
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-zinc-200">
                  Reusable Products
                </h3>

                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  One reusuable bottle, hundreds of good choices! 🥤🐢
                  Let's ditch the disposables and keep our rivers happy.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t flex items-center justify-between">
              <div className="text-[10px] font-bold text-cyan-600">
                +5 Energy • +2 Wildlife
              </div>

              <button
                aria-label="Log Reusable Products Action"
                disabled={isActionLoading !== null}
                onClick={() => performAction("reusable")}
                className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold"
              >
                {isActionLoading === "reusable" ? "..." : "Log Action"}
              </button>
            </div>
          </motion.div>

          {/* Plant Based Meal */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-lime-500/10 text-lime-500 flex items-center justify-center text-xl">
                🥗
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-zinc-200">
                  Plant-Based Meal
                </h3>

                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Delicious for the plate and gentler on the planet. 🥗🌎
                  Every meal is a chance to make a greener choice.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t flex items-center justify-between">
              <div className="text-[10px] font-bold text-lime-600">
                +4 Energy • +2 Forest
              </div>

              <button
                aria-label="Log Plant Based Meal Action"
                disabled={isActionLoading !== null}
                onClick={() => performAction("plant_based")}
                className="px-3.5 py-1.5 bg-lime-500 hover:bg-lime-600 text-white rounded-lg text-xs font-bold"
              >
                {isActionLoading === "plant_based" ? "..." : "Log Action"}
              </button>
            </div>
          </motion.div>

        </div>

        {/* Row 1: Climate Goals & Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Goals memory manager */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 shadow-sm rounded-3xl p-6 md:p-8 space-y-6">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                Climate Goals Memory
              </h3>
              <span className="text-xs bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-500 dark:text-zinc-400 font-bold">
                {memories.length} Stored
              </span>
            </div>

            {/* Goals tags area */}
            <div className="min-h-24 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-wrap gap-2 items-center justify-start content-start">
              <AnimatePresence>
                {memories.length === 0 ? (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-slate-400 dark:text-zinc-500 italic w-full text-center"
                  >
                    My memory garden is empty. Plant a goal below and let's grow together. 🌿
                  </motion.p>
                ) : (
                  memories.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => toggleGoalCompletion(i)}
                      className={`cursor-pointer px-3 py-2 rounded-full text-xs font-semibold shadow-sm flex items-center gap-2 transition ${
                        completedGoals.includes(i)
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
                      }`}
                    >
                      {completedGoals.includes(i) ? "✅" : "⭕"}
                      <span className={
                        completedGoals.includes(i)
                          ? "line-through"
                          : ""
                      }>
                        {m}
                      </span>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Goal Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Today's Progress</span>
                <span>
                  {completedCount}/{totalGoals}
                </span>
              </div>

              <div className="w-full h-3 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${goalPercentage}%`,
                  }}
                />
              </div>
            </div>

            {climateChampion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-xl p-3 text-sm font-bold flex items-center gap-2"
              >
                ⭐ Daily Climate Champion Unlocked!
              </motion.div>
            )}

            {/* Goal Input form */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    aria-label="Climate Goal"
                    type="text"
                    value={memory}
                    onChange={(e) => setMemory(e.target.value)}
                    placeholder="I want to live more sustainably..."
                    className="w-full pl-3 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveMemory();
                    }}
                  />
                </div>
                <button
                  aria-label="Add Climate Goal"
                  disabled={isGoalsLoading || !memory.trim()}
                  onClick={saveMemory}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 dark:disabled:bg-zinc-800 disabled:text-slate-400 text-white rounded-xl text-sm font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  {isGoalsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Goal
                </button>
              </div>

              {/* Success Notification Alert */}
              <AnimatePresence>
                {goalSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950 rounded-xl p-3 text-xs flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Goal added to Sprout's core memory bank!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Gamified Sprout Achievements Card - Premium Layout Drop-in Replacement */}
          <div className="bg-gradient-to-br from-white via-slate-50/60 to-emerald-50/20 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/20 border border-slate-200/60 dark:border-zinc-800/80 shadow-md rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 min-h-[520px]">
            {/* Ambient Background Glow Particles */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

            <div className="space-y-6 z-10 w-full flex-1 flex flex-col">
              {/* Card Header Structure */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    >
                      <Award className="w-5 h-5 text-amber-500 fill-amber-500/10" />
                    </motion.div>
                    Sprout Achievements
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    Celebrate every eco-friendly step.
                  </p>
                </div>

                {/* Live Count Pill Indicator */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl text-xs font-black text-amber-600 dark:text-amber-400 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                  <span>{unlockedCount} Earned</span>
                </motion.div>
              </div>

              {/* Progress Tracker Layer */}
              <div className="bg-white/40 dark:bg-zinc-950/40 border border-slate-200/40 dark:border-zinc-800/40 backdrop-blur-md rounded-2xl p-4 space-y-2.5 shadow-inner">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider text-[10px]">Achievements Unlocked</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {unlockedCount} <span className="text-slate-400 font-medium text-[10px]">/ {totalCount}</span>
                  </span>
                </div>
                
                <div className="h-3 w-full bg-slate-100 dark:bg-zinc-800/80 rounded-full overflow-hidden p-0.5 border border-slate-200/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-500 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shine_2.5s_infinite] bg-[length:200%_100%]" />
                  </motion.div>
                </div>
              </div>

              {/* Staggered Row Rendering Segment */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex-1 max-h-[310px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-800"
              >
                {achievements.map((ach) => (
                  <motion.div
                    key={ach.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, x: 2 }}
                    className={`group flex items-start justify-between p-4 border rounded-2xl transition-all duration-300 relative overflow-hidden ${
                      ach.unlocked
                        ? "bg-gradient-to-r from-white to-emerald-50/20 dark:from-zinc-900 dark:to-emerald-950/10 border-emerald-500/20 dark:border-emerald-500/10 shadow-sm shadow-emerald-500/[0.02]"
                        : "bg-slate-50/50 dark:bg-zinc-900/30 border-slate-100 dark:border-zinc-800/60 opacity-60"
                    }`}
                  >

                    {ach.unlocked && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    )}

                    <div className="flex items-start gap-3.5 flex-1">

                      {/* Icon */}
                      <div
                        className={`h-11 w-11 rounded-xl text-xl flex items-center justify-center relative flex-shrink-0 font-sans transition-all shadow-sm ${
                          ach.unlocked
                            ? "bg-gradient-to-br from-yellow-100 to-amber-200 border border-amber-300 shadow-amber-500/20"
                            : "bg-slate-200 dark:bg-zinc-800 border border-slate-300/40 dark:border-zinc-700/50 grayscale"
                        }`}
                      >
                        {ach.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1">

                        <div className="flex items-start justify-between gap-3">

                          <div className="flex-1">

                            <h4
                              className={`text-sm font-bold tracking-tight ${
                                ach.unlocked
                                  ? "text-slate-800 dark:text-zinc-100"
                                  : "text-slate-500 dark:text-zinc-500"
                              }`}
                            >
                              {ach.title}
                            </h4>

                            <p className="text-[11px] text-slate-400 dark:text-zinc-500 leading-relaxed mt-0.5">
                              {ach.desc}
                            </p>

                          </div>

                          {ach.unlocked ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-lg flex-shrink-0"
                            >
                              🏆
                            </motion.div>
                          ) : (
                            <div className="h-6 w-6 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 rounded-full flex items-center justify-center border border-slate-200/50 dark:border-zinc-700/50 flex-shrink-0">
                              <Lock className="w-3 h-3" />
                            </div>
                          )}

                        </div>

                        <div className="mt-3 w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <motion.div
                            role="progressbar"
                            aria-label={`${ach.title} achievement progress`}
                            aria-valuenow={Math.round(
                              Math.min(ach.current / ach.target, 1) * 100
                            )}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                Math.min(
                                  ach.current / ach.target,
                                  1
                                ) * 100
                              }%`,
                            }}
                            transition={{
                              duration: 0.7,
                            }}
                            className={`h-full ${
                              ach.unlocked
                                ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                                : "bg-gradient-to-r from-emerald-400 to-green-500"
                            }`}
                          />

                        </div>

                        {/* Progress Text */}
                        <div className="flex justify-between items-center mt-1">

                          <span className="text-[10px] text-slate-500">
                            {ach.current}/{ach.target}
                          </span>

                          {ach.unlocked && (
                            <span className="text-[10px] font-bold text-amber-500">
                              Complete
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Row 2: Eco Diary & Carbon Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Notebook Styled Diary */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                  Sprout's Eco-Diary
                </h2>
                <span className="text-[10px] bg-emerald-550/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                  Daily Digest
                </span>
              </div>
              
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                From tiny sprouts to thriving forests, every action influences Sprout's progress. 📖🌳
              </p>

              {/* Notebook page container */}
              <div className="min-h-48 bg-amber-50/40 dark:bg-zinc-950 border border-amber-100/50 dark:border-zinc-800 rounded-2xl p-5 shadow-inner relative overflow-hidden">
                {/* Lined paper effect on light mode */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(229,224,216,0.35)_1px,transparent_1px)] bg-[size:100%_24px] pointer-events-none opacity-45 dark:hidden" />
                <div className="absolute left-6 top-0 bottom-0 w-px bg-red-200/50 dark:hidden" />
                
                <div className="relative pl-4 z-10 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-3">Diary Entry</span>
                  {diary ? (
                    <p className="text-sm font-serif text-slate-800 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                      {diary}
                    </p>
                  ) : (
                    <div className="py-12 text-center text-slate-400 dark:text-zinc-500 italic text-sm">
                      Wondering how Sprout's day went? Generate today's diary entry to find out. 🌱💚
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-zinc-800/60 mt-6 flex justify-end">
              <button
                aria-label="Generate Eco Diary Entry"
                disabled={isDiaryLoading}
                onClick={loadDiary}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-emerald-500/60 disabled:to-teal-500/60 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10"
              >
                {isDiaryLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Writing entry...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    <span>Generate Eco-Diary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Carbon Impact Card */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40 dark:from-zinc-900 dark:via-emerald-950/10 dark:to-teal-950/10 border border-emerald-200/50 dark:border-emerald-500/15 shadow-lg shadow-emerald-900/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-emerald-900/10"
          >
            {/* Ambient glassmorphic glows */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />

            {/* Floating ambient particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute text-emerald-400/30 dark:text-emerald-300/20 select-none"
                  style={{
                    top: `${8 + i * 15}%`,
                    left: `${6 + ((i * 27) % 90)}%`,
                    fontSize: `${6 + (i % 3) * 2}px`,
                  }}
                  animate={{ opacity: [0.15, 0.6, 0.15], y: [0, -8, 0] }}
                  transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                >
                  ✦
                </motion.span>
              ))}
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                  >
                    🌍
                  </motion.div>
                  Carbon Impact
                </h2>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 px-2 py-1 rounded-md">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5">
                See the difference your actions make.
              </p>

              {/* Primary Metrics */}
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <div className="bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-emerald-200/40 dark:border-emerald-500/15 rounded-2xl p-3 text-center shadow-sm">
                  <div className="text-base mb-0.5">🌍</div>
                  <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 leading-tight">
                    <CountUp value={impact.today} decimals={1} />
                  </div>
                  <div className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide leading-tight mt-0.5">
                    Today<br />kg CO₂ saved
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-emerald-200/40 dark:border-emerald-500/15 rounded-2xl p-3 text-center shadow-sm">
                  <div className="text-base mb-0.5">📅</div>
                  <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 leading-tight">
                    <CountUp value={impact.week} decimals={1} />
                  </div>
                  <div className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide leading-tight mt-0.5">
                    This Week<br />kg CO₂ saved
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-emerald-200/40 dark:border-emerald-500/15 rounded-2xl p-3 text-center shadow-sm">
                  <div className="text-base mb-0.5">📈</div>
                  <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 leading-tight">
                    <CountUp value={impact.month} decimals={1} />
                  </div>
                  <div className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide leading-tight mt-0.5">
                    This Month<br />kg CO₂ saved
                  </div>
                </div>
              </div>

              {/* Real-World Equivalents */}
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <motion.div
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50/60 dark:from-emerald-500/10 dark:to-teal-500/5 border border-emerald-200/50 dark:border-emerald-500/20 rounded-2xl p-3 flex flex-col items-center text-center shadow-sm"
                >
                  <Trees className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                    <CountUp value={impactEquivalents.trees} />
                  </span>
                  <span className="text-[8px] font-bold text-emerald-600/70 dark:text-emerald-400/60 uppercase tracking-wide leading-tight mt-0.5">
                    Trees<br />Equivalent
                  </span>
                </motion.div>
                <motion.div
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="bg-gradient-to-br from-sky-50 to-blue-50/60 dark:from-sky-500/10 dark:to-blue-500/5 border border-sky-200/50 dark:border-sky-500/20 rounded-2xl p-3 flex flex-col items-center text-center shadow-sm"
                >
                  <Car className="w-4 h-4 text-sky-600 dark:text-sky-400 mb-1" />
                  <span className="text-sm font-black text-sky-700 dark:text-sky-400">
                    <CountUp value={impactEquivalents.car_km} /> km
                  </span>
                  <span className="text-[8px] font-bold text-sky-600/70 dark:text-sky-400/60 uppercase tracking-wide leading-tight mt-0.5">
                    Car Travel<br />Avoided
                  </span>
                </motion.div>
                <motion.div
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="bg-gradient-to-br from-amber-50 to-yellow-50/60 dark:from-amber-500/10 dark:to-yellow-500/5 border border-amber-200/50 dark:border-amber-500/20 rounded-2xl p-3 flex flex-col items-center text-center shadow-sm"
                >
                  <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-1" />
                  <span className="text-sm font-black text-amber-700 dark:text-amber-400">
                    <CountUp value={impactEquivalents.electricity} /> kWh
                  </span>
                  <span className="text-[8px] font-bold text-amber-600/70 dark:text-amber-400/60 uppercase tracking-wide leading-tight mt-0.5">
                    Electricity<br />Saved
                  </span>
                </motion.div>
              </div>

              {/* Impact Insight panel */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-[0_0_22px_-8px_rgba(16,185,129,0.45)] relative overflow-hidden"
              >
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
                <div className="h-9 w-9 flex-shrink-0 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-base relative z-10">
                  🌱
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-0.5">
                    Impact Insight
                  </p>
                  <p className="text-xs text-emerald-800/90 dark:text-emerald-200/80 leading-snug font-medium">
                    {getImpactInsight()}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="border-t border-emerald-100/60 dark:border-emerald-500/10 pt-4 mt-6 flex justify-between items-center text-xs text-slate-400 dark:text-zinc-500 font-semibold relative z-10">
              <span>Every eco action nudges these numbers up.</span>
              <span className="text-slate-700 dark:text-zinc-300">{getPetTitle()}</span>
            </div>
          </motion.div>

        </div>

      </main>
      <AnimatePresence>
        {showLevelUp && (
          <>
            <Confetti
              recycle={false}
              numberOfPieces={250}
              gravity={0.18}
            />

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 18,
              }}
              className="fixed inset-0 flex items-center justify-center z-[1000] px-4"
            >
              <div className="relative overflow-hidden w-full max-w-[320px] rounded-[24px] bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900 shadow-[0_10px_40px_rgba(16,185,129,0.20)]">

                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-green-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/20" />

                {/* Top Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400" />

                <div className="relative p-5 text-center">

                  {/* Level Up Pill */}
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-4"
                  >
                    <div className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                      ✨ Level Up
                    </div>
                  </motion.div>

                  {/* Badge */}
                  <motion.div
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="relative mx-auto mb-4"
                  >
                    <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-emerald-400/25 blur-2xl" />

                    <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex flex-col items-center justify-center border-2 border-white dark:border-zinc-800 shadow-lg">

                      <motion.div
                        animate={{
                          rotate: [0, -5, 5, -5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                        className="text-3xl"
                      >
                        {levelEmoji[newLevel || 2]}
                      </motion.div>

                      <div className="text-white font-black text-xl leading-none">
                        {newLevel}
                      </div>
                    </div>
                  </motion.div>

                  {/* Title */}
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Sprout Evolved!
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 px-3">
                    Your eco actions helped Sprout grow.
                  </p>

                  {/* Evolution Card */}
                  <div className="mt-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-3">

                    <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                      New Evolution
                    </div>

                    <div className="text-xl font-black text-emerald-600">
                      {levelTitles[newLevel || 1]}
                    </div>

                  </div>

                  {/* Reward */}
                  <div className="mt-3 flex justify-center">
                    <div className="bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-3 py-2 rounded-xl font-bold text-xs">
                      🎁 Milestone Unlocked
                    </div>
                  </div>

                  {/* Decorative Row */}
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="mt-4 text-xl"
                  >
                    🌱 ✨ 🌳 ✨ 🌱
                  </motion.div>

                  {/* Continue Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowLevelUp(false)}
                    className="mt-5 w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-2.5 rounded-xl shadow-lg transition text-sm"
                  >
                    Continue Journey →
                  </motion.button>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Achievement Unlocked Popup ───────────────────────────────────────
          Same design language as the level-up modal above. Uses a queue so
          multiple simultaneous unlocks display sequentially, never on top of
          each other. Auto-dismisses after 5 s; also has a manual close button.
      ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAchievementPopup && currentAchievement && (
          <>
            {/* Lightweight confetti — fewer pieces than level-up so it feels
                distinct and slightly less dramatic, matching the hierarchy. */}
            <Confetti
              recycle={false}
              numberOfPieces={120}
              gravity={0.22}
              colors={["#f59e0b", "#10b981", "#6366f1", "#f43f5e", "#facc15"]}
            />

            {/* Backdrop — same opacity/blur as level-up */}
            <motion.div
              key="achievement-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]"
              onClick={dismissAchievementPopup}
            />

            {/* Modal card */}
            <motion.div
              key="achievement-modal"
              initial={{ scale: 0.72, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.82, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="fixed inset-0 flex items-center justify-center z-[999] px-4"
            >
              <div className="relative overflow-hidden w-full max-w-[320px] rounded-[24px] bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/60 shadow-[0_10px_40px_rgba(245,158,11,0.22)]">

                {/* Ambient gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-yellow-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-950/20 pointer-events-none" />

                {/* Top accent stripe — amber to distinguish from green level-up */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400" />

                {/* Subtle radial glow behind the badge */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-amber-300/20 dark:bg-amber-500/10 blur-2xl pointer-events-none" />

                {/* Close button */}
                <button
                  type="button"
                  aria-label="Dismiss achievement"
                  onClick={dismissAchievementPopup}
                  className="absolute top-3 right-3 z-10 h-7 w-7 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 dark:text-zinc-500 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="relative p-5 text-center">

                  {/* "Achievement Unlocked" pill — mirrors the "✨ Level Up" pill */}
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.08 }}
                    className="mb-4"
                  >
                    <div className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                      <Award className="w-3 h-3" />
                      Achievement Unlocked
                    </div>
                  </motion.div>

                  {/* Badge orb — floats + wobbles like the level-up badge */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="relative mx-auto mb-4"
                  >
                    {/* Glow ring */}
                    <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-amber-400/30 blur-2xl" />

                    {/* Orb */}
                    <motion.div
                      animate={{ rotate: [0, -4, 4, -4, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 dark:from-amber-500 dark:to-yellow-600 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-lg shadow-amber-500/30 text-4xl"
                    >
                      {currentAchievement.icon}
                    </motion.div>

                    {/* Sparkle ring of dots */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 w-20 h-20 mx-auto"
                    >
                      {[0, 60, 120, 180, 240, 300].map((deg) => (
                        <div
                          key={deg}
                          className="absolute w-1.5 h-1.5 rounded-full bg-amber-300"
                          style={{
                            top: "50%",
                            left: "50%",
                            transform: `rotate(${deg}deg) translateY(-36px) translate(-50%, -50%)`,
                          }}
                        />
                      ))}
                    </motion.div>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                    className="text-2xl font-black text-slate-900 dark:text-white leading-tight"
                  >
                    {currentAchievement.title}
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 px-3 leading-relaxed"
                  >
                    {currentAchievement.desc}
                  </motion.p>

                  {/* Info card — mirrors the "New Evolution" card in level-up */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.26, type: "spring", stiffness: 260, damping: 22 }}
                    className="mt-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-3"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-0.5">
                      Badge Earned
                    </div>
                    <div className="text-base font-black text-amber-600 dark:text-amber-400">
                      {currentAchievement.title}
                    </div>
                  </motion.div>

                  {/* Auto-dismiss progress bar */}
                  <div className="mt-3 h-1 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 5, ease: "linear" }}
                      onAnimationComplete={dismissAchievementPopup}
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"
                    />
                  </div>

                  {/* Decorative emoji row — mirrors "🌱 ✨ 🌳 ✨ 🌱" */}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="mt-3 text-xl"
                  >
                    🌿 ✨ 🏆 ✨ 🌿
                  </motion.div>

                  {/* CTA button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={dismissAchievementPopup}
                    className="mt-4 w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition text-sm"
                  >
                    Keep Going →
                  </motion.button>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowHistory(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={() => setShowHistory(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-emerald-900/10 border border-emerald-200/50 dark:border-emerald-500/15 p-6 sm:p-7 relative overflow-hidden"
              >
                {/* Ambient glows */}
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-emerald-300/20 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-teal-300/15 dark:bg-teal-500/10 blur-3xl pointer-events-none" />

                {/* Close button */}
                <button
                  type="button"
                  aria-label="Close history modal"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHistory(false);
                  }}
                  className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="relative z-10">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    📜 Activity History
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-0.5 mb-4">
                    Track your sustainability journey.
                  </p>

                  {/* Day filter buttons */}
                  <div className="flex gap-2 mb-4">
                    {[7, 14, 30].map((days) => (
                      <button
                        key={days}
                        onClick={() => loadHistory(days)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                          historyDays === days
                            ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>

                  {/* Activity list */}
                  <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 -mr-1">
                    {historyLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                      </div>
                    ) : historyActions.length === 0 ? (
                      <div className="text-center py-10 text-sm text-slate-400 dark:text-zinc-500">
                        No actions found 🌱
                      </div>
                    ) : (
                      historyActions.map((item: any, index: number) => {
                        const { icon, label } = getActionDisplay(item.action);
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: Math.min(index, 10) * 0.03 }}
                            className="flex items-center gap-3 bg-slate-50/70 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-3"
                          >
                            <div className="h-9 w-9 flex-shrink-0 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-base">
                              {icon}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate">
                                {label}
                              </div>
                              <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                                {formatHistoryTimestamp(item.timestamp)}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Streak Modal */}
      <AnimatePresence>
        {showStreakModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowStreakModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={() => setShowStreakModal(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-orange-900/10 border border-orange-200/50 dark:border-orange-500/15 p-6 sm:p-7 relative overflow-hidden"
              >

                {/* Ambient warm glows */}
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-orange-300/25 dark:bg-orange-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-emerald-300/20 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />

                {/* Close button */}
                <button
                  type="button"
                  aria-label="Close streak modal"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStreakModal(false);
                  }}
                  className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Big bouncing flame */}
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500 shadow-lg shadow-orange-500/30 flex items-center justify-center text-4xl mb-3"
                  >
                    🔥
                  </motion.div>

                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currentStreak} Day{currentStreak === 1 ? "" : "s"}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-0.5">
                    Current Streak
                  </p>

                  {/* Stat row: Longest + Next Milestone */}
                  <div className="grid grid-cols-2 gap-3 w-full mt-5">
                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-2xl p-3.5 flex flex-col items-center">
                      <span className="text-lg">🏆</span>
                      <span className="text-lg font-black text-amber-700 dark:text-amber-400 mt-0.5">
                        {longestStreak}
                      </span>
                      <span className="text-[10px] font-bold text-amber-600/80 dark:text-amber-400/70 uppercase tracking-wide">
                        Longest Streak
                      </span>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 rounded-2xl p-3.5 flex flex-col items-center">
                      <span className="text-lg">🎯</span>
                      <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {nextMilestone}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/70 uppercase tracking-wide">
                        Next Milestone
                      </span>
                    </div>
                  </div>

                  {/* Milestone progress bar */}
                  <div className="w-full mt-4">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1.5">
                      <span>Progress to {nextMilestone} days</span>
                      <span>{currentStreak} / {nextMilestone}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${milestoneProgress}%` }}
                        transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
                        className="h-full bg-gradient-to-r from-orange-400 via-amber-400 to-emerald-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* 7-day streak calendar */}
                  <div className="w-full mt-6">
                    <div className="flex items-center justify-between gap-1.5">
                      {streakCalendarDays.map((day, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 * idx, ease: "easeOut" }}
                          className="flex flex-col items-center gap-1"
                        >
                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                            {day.label}
                          </span>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`h-9 w-9 rounded-full flex items-center justify-center text-sm border-2 transition-colors ${
                              day.isToday
                                ? "bg-emerald-500/15 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                                : day.completed
                                ? "bg-orange-50 dark:bg-orange-500/10 border-orange-300/70 dark:border-orange-500/30"
                                : "bg-slate-50 dark:bg-zinc-800/60 border-slate-200/70 dark:border-zinc-700/60"
                            }`}
                          >
                            {day.isToday ? (
                              <motion.span
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                              >
                                {day.completed ? "🔥" : "🌱"}
                              </motion.span>
                            ) : day.completed ? (
                              "🔥"
                            ) : (
                              <span className="text-slate-300 dark:text-zinc-600">⚪</span>
                            )}
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Sprout companion speech bubble */}
                  <div className="w-full mt-6 flex items-start gap-2.5 bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 rounded-2xl p-3.5 text-left relative">
                    <div className="h-9 w-9 flex-shrink-0 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-base">
                      🌱
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-0.5">
                        Sprout says:
                      </p>
                      <p className="text-xs text-emerald-800/90 dark:text-emerald-200/80 leading-snug font-medium">
                        "You're on fire! Every sustainable action helps our world grow."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievementsModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowAchievementsModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAchievementsModal(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-amber-900/10 border border-amber-200/50 dark:border-amber-500/15 p-6 sm:p-7 relative overflow-hidden"
              >
                {/* Ambient warm glows */}
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-amber-300/25 dark:bg-amber-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-emerald-300/20 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />

                {/* Close button */}
                <button
                  type="button"
                  aria-label="Close achievements modal"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAchievementsModal(false);
                  }}
                  className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 shadow-lg shadow-amber-500/30 flex items-center justify-center text-3xl mb-2"
                  >
                    🏆
                  </motion.div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Achievements
                  </h2>

                  {/* Progress summary */}
                  <div className="w-full mt-4">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-zinc-300 mb-1.5">
                      <span>{unlockedCount} / {totalCount} Achievements Unlocked</span>
                      <span>{Math.round(progressPercentage)}% Complete</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
                        className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Unlocked badges only */}
                  <div className="w-full mt-5 text-left">
                    {unlockedCount === 0 ? (
                      <div className="text-center py-8 text-sm text-slate-400 dark:text-zinc-500">
                        No badges unlocked yet — log an eco action to earn your first! 🌱
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 -mr-1">
                        {achievements
                          .filter((a) => a.unlocked)
                          .map((a, idx) => (
                            <motion.div
                              key={a.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.05 * idx, ease: "easeOut" }}
                              className="flex items-center gap-3 bg-gradient-to-r from-amber-50 via-white to-emerald-50/40 dark:from-amber-500/10 dark:via-zinc-900 dark:to-emerald-500/5 border border-amber-300/50 dark:border-amber-500/25 rounded-2xl p-3 shadow-[0_0_18px_-6px_rgba(245,158,11,0.45)]"
                            >
                              <div className="h-11 w-11 flex-shrink-0 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-xl">
                                {a.icon}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                                  {a.title}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                                  {a.desc}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Impact Modal */}
      <AnimatePresence>
        {showImpactModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowImpactModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={() => setShowImpactModal(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-emerald-900/10 border border-emerald-200/50 dark:border-emerald-500/15 p-6 sm:p-7 relative overflow-hidden"
              >
                {/* Ambient glows */}
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-emerald-300/25 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-sky-300/20 dark:bg-sky-500/10 blur-3xl pointer-events-none" />

                {/* Close button */}
                <button
                  type="button"
                  aria-label="Close impact modal"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImpactModal(false);
                  }}
                  className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                    className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-3xl mb-2"
                  >
                    🌍
                  </motion.div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Weekly Carbon Impact
                  </h2>

                  {/* Daily indicators */}
                  <div className="w-full mt-5">
                    <div className="flex items-center justify-between gap-1">
                      {weeklyImpactBreakdown.map((day, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 * idx, ease: "easeOut" }}
                          className="flex flex-col items-center gap-1"
                        >
                          <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500">
                            {day.label}
                          </span>
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs border-2 ${
                              day.level === "high"
                                ? "bg-emerald-500/15 border-emerald-500"
                                : day.level === "medium"
                                ? "bg-amber-400/15 border-amber-400"
                                : "bg-slate-50 dark:bg-zinc-800/60 border-slate-200/70 dark:border-zinc-700/60"
                            }`}
                          >
                            {day.level === "high" ? "🟢" : day.level === "medium" ? "🟡" : "⚪"}
                          </div>
                          <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400">
                            {day.kg}kg
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly total */}
                  <div className="w-full mt-5 bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 rounded-2xl p-3.5 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80 uppercase tracking-wide">
                      Total This Week
                    </span>
                    <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                      {weeklyImpactTotal} kg CO₂
                    </span>
                  </div>

                  {/* Weekly summary */}
                  <div className="w-full mt-4 flex items-start gap-2.5 bg-white/60 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-3.5 text-left">
                    <div className="h-9 w-9 flex-shrink-0 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-base">
                      🌱
                    </div>
                    <p className="text-xs text-slate-700 dark:text-zinc-300 leading-snug font-medium">
                      Your actions this week saved {weeklyImpactTotal} kg of CO₂.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Goals Modal */}
      <AnimatePresence>
        {showGoalsModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowGoalsModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={() => setShowGoalsModal(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-emerald-900/10 border border-emerald-200/50 dark:border-emerald-500/15 p-6 sm:p-7 relative overflow-hidden"
              >
                {/* Ambient glows */}
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-emerald-300/25 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-yellow-300/15 dark:bg-yellow-500/10 blur-3xl pointer-events-none" />

                {/* Close button */}
                <button
                  type="button"
                  aria-label="Close goals modal"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGoalsModal(false);
                  }}
                  className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-3xl mb-2"
                  >
                    🎯
                  </motion.div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Today's Climate Goals
                  </h2>

                  {/* Progress summary */}
                  <div className="w-full mt-4">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-zinc-300 mb-1.5">
                      <span>{completedCount} / {totalGoals} Goals Completed</span>
                      <span>{Math.round(goalPercentage)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goalPercentage}%` }}
                        transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Goals list */}
                  <div className="w-full mt-5 text-left">
                    {totalGoals === 0 ? (
                      <div className="text-center py-8 text-sm text-slate-400 dark:text-zinc-500">
                        No goals saved yet — add one from the Climate Goals card. 🌿
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 -mr-1">
                        {memories.map((m, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.04 * i, ease: "easeOut" }}
                            onClick={() => toggleGoalCompletion(i)}
                            className={`cursor-pointer flex items-center gap-2.5 rounded-xl p-2.5 border transition ${
                              completedGoals.includes(i)
                                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300/60 dark:border-emerald-500/20"
                                : "bg-slate-50 dark:bg-zinc-950/40 border-slate-100 dark:border-zinc-800/80"
                            }`}
                          >
                            <span className="text-base flex-shrink-0">
                              {completedGoals.includes(i) ? "✅" : "⭕"}
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                completedGoals.includes(i)
                                  ? "line-through text-slate-500 dark:text-zinc-500"
                                  : "text-slate-700 dark:text-zinc-200"
                              }`}
                            >
                              {m}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Daily Climate Champion badge */}
                  <motion.div
                    animate={climateChampion ? { scale: [1, 1.04, 1] } : {}}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className={`w-full mt-5 rounded-2xl p-3.5 flex items-center justify-center gap-2 font-bold text-sm border ${
                      climateChampion
                        ? "bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-500/10 dark:via-yellow-500/10 dark:to-amber-500/10 border-amber-300/60 dark:border-amber-500/25 text-amber-700 dark:text-amber-400 shadow-[0_0_18px_-6px_rgba(245,158,11,0.5)]"
                        : "bg-slate-50 dark:bg-zinc-950/40 border-slate-100 dark:border-zinc-800/80 text-slate-400 dark:text-zinc-500"
                    }`}
                  >
                    {climateChampion ? (
                      <>⭐ Daily Climate Champion Unlocked!</>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        ⭐ Daily Climate Champion — Locked
                      </>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Companion Popup Notifications — replaces the old Live Companion Feed card */}
      <div className="fixed top-20 right-4 sm:right-6 z-[60] flex flex-col gap-3 pointer-events-none w-[calc(100%-2rem)] sm:w-80">
        <AnimatePresence>
          {companionPopups.map((popup) => (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.25 } }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="pointer-events-auto"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-emerald-200/60 dark:border-emerald-500/20 shadow-xl shadow-emerald-900/10 rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden"
              >
                {/* Ambient glow */}
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />

                {/* Sprout avatar */}
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-500/20 flex items-center justify-center text-xl relative z-10">
                  {getPetEmoji()}
                </div>

                {/* Message bubble */}
                <div className="flex-1 relative z-10 min-w-0">
                  <h4 className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider mb-0.5">
                    {getPetTitle()}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-snug font-medium">
                    {popup.text}
                  </p>
                </div>

                {/* Dismiss button */}
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => dismissCompanionPopup(popup.id)}
                  className="relative z-10 h-6 w-6 flex-shrink-0 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 dark:text-zinc-500 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
