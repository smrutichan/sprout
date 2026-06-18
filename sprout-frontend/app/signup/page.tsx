"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Globe,
  RefreshCw,
  Trees,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import API from "@/services/api";

// Adorable floating leaves animation rising up in the background
function FloatingLeaves() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            y: "110vh",
            x: `${6 + i * 12}%`,
            rotate: 0,
            scale: 0.6 + Math.random() * 0.4,
          }}
          animate={{
            opacity: [0, 0.45, 0.45, 0],
            y: "-10vh",
            x: [
              `${6 + i * 12}%`,
              `${6 + i * 12 + (i % 2 === 0 ? 6 : -6)}%`,
              `${6 + i * 12}%`,
            ],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 14 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
          className="absolute text-emerald-400/20 dark:text-emerald-400/10 text-xl select-none"
        >
          🍃
        </motion.div>
      ))}
    </div>
  );
}

// Gentle ambient sparkle dots drifting around the mascot
function Sparkle({
  className,
  delay = 0,
  duration = 3,
}: {
  className: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.span
      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.9, 0.3] }}
      transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
      className={`absolute select-none ${className}`}
    >
      ✨
    </motion.span>
  );
}

// The Sprout mascot itself — a round little creature with a face, sitting in
// a patch of soil, with two leaves sprouting from its head. Drawn in SVG so
// it can actually have eyes, blush, and a mouth (rather than a flat emoji).
function SproutMascot({ size = 220 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      className="select-none drop-shadow-[0_18px_30px_rgba(16,185,129,0.35)]"
    >
      <defs>
        <linearGradient id="sproutBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A7E66B" />
          <stop offset="100%" stopColor="#5FB94C" />
        </linearGradient>
        <linearGradient id="sproutLeafLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9BE26A" />
          <stop offset="100%" stopColor="#5CA83F" />
        </linearGradient>
        <linearGradient id="sproutLeafDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7BCB4F" />
          <stop offset="100%" stopColor="#4A9636" />
        </linearGradient>
        <linearGradient id="sproutSoil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A9695C" />
          <stop offset="100%" stopColor="#7C4438" />
        </linearGradient>
      </defs>

      {/* Stem connecting leaves to the body */}
      <path d="M110 80 C108 65, 108 55, 110 42" stroke="#5CA83F" strokeWidth="7" strokeLinecap="round" fill="none" />

      {/* Right leaf */}
      <path
        d="M111 58 C130 50, 152 52, 163 66 C148 72, 128 74, 111 64 Z"
        fill="url(#sproutLeafLight)"
      />
      {/* Left leaf (larger, behind) */}
      <path
        d="M109 50 C92 30, 66 26, 48 38 C58 56, 84 66, 109 60 Z"
        fill="url(#sproutLeafDark)"
      />

      {/* Soil mound base */}
      <path d="M40 178 a70 50 0 0 1 140 0 Z" fill="url(#sproutSoil)" />
      <ellipse cx="110" cy="178" rx="70" ry="10" fill="#6B392E" opacity="0.35" />

      {/* Round body */}
      <circle cx="110" cy="130" r="62" fill="url(#sproutBody)" />
      {/* Soft highlight on body */}
      <ellipse cx="88" cy="108" rx="22" ry="14" fill="#C8F08A" opacity="0.55" />

      {/* Blush cheeks */}
      <ellipse cx="76" cy="142" rx="11" ry="7" fill="#F4A28C" opacity="0.7" />
      <ellipse cx="144" cy="142" rx="11" ry="7" fill="#F4A28C" opacity="0.7" />

      {/* Eyes (blinking) */}
      <motion.ellipse
        cx="90"
        cy="124"
        rx="7"
        ry="9"
        fill="#2B2118"
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.92, 0.95, 0.98, 1], ease: "easeInOut" }}
        style={{ transformOrigin: "90px 124px" }}
      />
      <motion.ellipse
        cx="130"
        cy="124"
        rx="7"
        ry="9"
        fill="#2B2118"
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.92, 0.95, 0.98, 1], ease: "easeInOut" }}
        style={{ transformOrigin: "130px 124px" }}
      />
      {/* Eye shine */}
      <circle cx="92.5" cy="120.5" r="2" fill="#fff" opacity="0.85" />
      <circle cx="132.5" cy="120.5" r="2" fill="#fff" opacity="0.85" />

      {/* Smiling mouth */}
      <path
        d="M96 148 Q110 162 124 148"
        stroke="#2B2118"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Tiny stub arms */}
      <ellipse cx="54" cy="142" rx="10" ry="7" fill="#5FB94C" transform="rotate(-20 54 142)" />
      <ellipse cx="166" cy="142" rx="10" ry="7" fill="#5FB94C" transform="rotate(20 166 142)" />
    </svg>
  );
}

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Clear error automatically after 6 seconds if active
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in your name, email, and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await API.post("/signup", {
        name: name.trim(),
        email: email.trim(),
        password: password,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err: any) {
      console.error("Signup request failed:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "We couldn't create your account. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const evolutionStages = [
    { emoji: "🌱", label: "Budding Guardian" },
    { emoji: "🌿", label: "Young Forest" },
    { emoji: "🪴", label: "Growing Ecosystem" },
    { emoji: "🌳", label: "Climate Guardian" },
  ];

  return (
    <div className="h-screen lg:overflow-hidden overflow-y-auto flex flex-col lg:flex-row bg-gradient-to-br from-amber-50/60 via-emerald-50/40 to-teal-50/50 dark:from-zinc-950 dark:via-zinc-900/95 dark:to-zinc-950 font-sans transition-colors duration-500 relative">

      {/* Floating leaves rising from background */}
      <FloatingLeaves />

      {/* Decorative ambient lighting glows */}
      <div className="absolute top-[-10%] left-[20%] w-[450px] h-[450px] bg-emerald-300/20 dark:bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-15%] left-[5%] w-[400px] h-[400px] bg-teal-300/20 dark:bg-teal-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[5%] w-[250px] h-[250px] bg-amber-200/15 rounded-full blur-[90px] pointer-events-none z-0" />

      {/* LEFT SIDE - SPROUT, THE VISUAL HERO (≈58% width on desktop) */}
      <div className="w-full lg:w-[58%] flex-shrink-0 flex-grow-0 relative flex flex-col p-6 sm:p-8 xl:p-10 lg:overflow-hidden z-10">

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-[-6px] bg-emerald-400/40 rounded-full blur-md pointer-events-none animate-pulse" />
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative p-2 bg-white/70 dark:bg-white/10 backdrop-blur-md border border-emerald-200/60 dark:border-white/20 rounded-xl shadow-sm z-10"
            >
              <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-300 fill-emerald-300/30" />
            </motion.div>
          </div>
          <span className="font-black text-xl tracking-tight text-emerald-800 dark:bg-gradient-to-r dark:from-emerald-100 dark:to-teal-50 dark:bg-clip-text dark:text-transparent">
            Sprout
          </span>
        </div>

        {/* Main hero content, vertically centered */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 lg:gap-4 py-2 lg:py-3 relative z-10 max-w-2xl mx-auto w-full min-h-0">

          {/* THE BIG ADORABLE MASCOT — the largest visual element on the page */}
          <div className="relative flex items-center justify-center w-full flex-shrink-0">
            {/* Ambient green glow behind the mascot */}
            <div className="absolute w-56 h-56 sm:w-64 sm:h-64 bg-emerald-400/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute w-44 h-44 sm:w-52 sm:h-52 bg-teal-300/25 rounded-full blur-2xl pointer-events-none" />

            {/* Soft grassy mound the mascot sits on */}
            <div className="absolute bottom-0 w-44 h-9 bg-emerald-600/15 dark:bg-emerald-400/10 rounded-[100%] blur-md" />

            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 2.5, -2.5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-emerald-200/60 via-teal-100/40 to-transparent dark:from-emerald-300/20 dark:via-teal-200/10 border border-emerald-200/50 dark:border-white/25 backdrop-blur-sm shadow-2xl flex items-center justify-center z-10 group cursor-default"
            >
              <div className="group-hover:scale-110 transition-transform duration-300">
                <SproutMascot size={184} />
              </div>

              {/* Floating sparkles around the mascot */}
              <Sparkle className="top-1 right-4 text-emerald-400 text-xl" delay={0.4} duration={3} />
              <Sparkle className="bottom-6 left-1 text-teal-400 text-base" delay={1.6} duration={3.6} />
              <Sparkle className="top-8 left-0 text-amber-300 text-sm" delay={2.4} duration={4} />
              <Sparkle className="bottom-1 right-1 text-emerald-300 text-lg" delay={1} duration={3.2} />
            </motion.div>
          </div>

          {/* Meet Sprout copy block */}
          <div className="space-y-1.5 max-w-md text-center flex-shrink-0">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-900 dark:text-white leading-tight">
              Meet Sprout 🌱
            </h2>
            <p className="text-emerald-800/80 dark:text-emerald-100/80 text-xs sm:text-sm leading-snug font-medium">
              Every eco-friendly choice helps Sprout grow. Walk instead of drive.
              Choose reusable products. Save energy. Protect nature. Together,
              small actions create a greener future.
            </p>
          </div>

          {/* Sprout Evolution Journey */}
          <div className="w-full max-w-lg pt-1 flex-shrink-0">
            <span className="text-[10px] font-black tracking-widest uppercase text-emerald-700/70 dark:text-emerald-300/80 block text-center mb-2">
              🌿 Sprout's Evolution Journey 🌿
            </span>
            <div className="flex items-center justify-between relative w-full px-2">
              <div className="absolute top-5 left-5 right-5 h-[2px] bg-emerald-300/40 dark:bg-white/10 border-t border-dashed border-emerald-400/40 dark:border-white/20 -translate-y-1/2 z-0" />

              {evolutionStages.map((stage, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 relative z-10">
                  <motion.div
                    animate={
                      idx === 0
                        ? { y: [0, -3, 0], scale: [1, 1.06, 1] }
                        : {}
                    }
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg shadow-md border transition-all ${
                      idx === 0
                        ? "bg-emerald-500 border-emerald-400 text-white ring-2 ring-emerald-500/40 ring-offset-2 ring-offset-amber-50 dark:ring-offset-zinc-950"
                        : "bg-white/70 dark:bg-white/10 border-emerald-200/60 dark:border-white/10 text-emerald-700/60 dark:text-white/50"
                    }`}
                  >
                    {stage.emoji}
                  </motion.div>
                  <span className="text-[9px] font-bold tracking-wide text-emerald-800/80 dark:text-white/80 text-center max-w-[64px] leading-tight">
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Small helper text */}
          <p className="text-[11px] text-emerald-700/60 dark:text-emerald-200/50 text-center font-medium max-w-sm flex-shrink-0">
            Complete eco-friendly actions to unlock new companion forms.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - COZY SIGNUP CARD (≈42% width on desktop) */}
      <div className="w-full lg:w-[42%] flex-shrink-0 flex-grow-0 flex flex-col justify-center items-center p-6 md:p-8 lg:py-6 relative z-10 lg:overflow-hidden">

        {/* Mobile Header only */}
        <div className="flex lg:hidden items-center gap-2 mb-6">
          <div className="p-1.5 bg-emerald-500 text-white rounded-lg shadow-md">
            <Leaf className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Sprout
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[368px] relative"
        >
          {/* Subtle warm shadow backing */}
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/10 via-teal-400/10 to-amber-400/10 rounded-3xl blur-xl -z-10" />

          {/* Tiny mascot peeking above the card */}
          <div className="flex justify-center -mb-2 relative z-10">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-200/80 to-teal-100/60 dark:from-emerald-400/20 dark:to-teal-300/10 border border-emerald-200/60 dark:border-white/20 shadow-md flex items-center justify-center overflow-hidden"
            >
              <SproutMascot size={42} />
            </motion.div>
          </div>

          {/* Wholesome glassmorphic signup card */}
          <div className="bg-white/70 dark:bg-zinc-900/70 border border-white/60 dark:border-zinc-800/80 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 rounded-3xl p-5 sm:p-6 pt-7 transition-colors duration-300">

            {/* Heading / Greeting */}
            <div className="mb-3 text-center">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
                Start Your Journey <span className="animate-wiggle">🌱</span>
              </h2>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 mt-1">
                Create your account and help Sprout grow through sustainable choices.
              </p>
            </div>

            {/* Error Banner */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-rose-950/15 border border-amber-200/50 dark:border-rose-900/40 rounded-2xl text-[11px] text-amber-800 dark:text-rose-400 font-semibold shadow-sm leading-relaxed">
                    <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-amber-600 dark:text-rose-400" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Banner */}
            <AnimatePresence mode="wait">
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm leading-relaxed">
                    <Check className="w-4.5 h-4.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Welcome to Sprout! Redirecting you to dashboard...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-3.5">

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jamie Rivera"
                    required
                    className="w-full pl-9.5 pr-3 py-2.5 bg-white/60 dark:bg-zinc-950/40 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 dark:text-white transition duration-200 placeholder-slate-400 dark:placeholder-zinc-600 font-medium"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full pl-9.5 pr-3 py-2.5 bg-white/60 dark:bg-zinc-950/40 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 dark:text-white transition duration-200 placeholder-slate-400 dark:placeholder-zinc-600 font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9.5 pr-9 py-2.5 bg-white/60 dark:bg-zinc-950/40 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 dark:text-white transition duration-200 placeholder-slate-400 dark:placeholder-zinc-600 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors duration-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit / Adopt Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-2.5 py-3 px-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-500/10 dark:shadow-emerald-500/5 hover:shadow-emerald-500/20 transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Planting Sprout...</span>
                  </>
                ) : (
                  <>
                    <span>🌱 Adopt Sprout</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-3 flex py-0.5 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-zinc-800/80"></div>
              <span className="flex-shrink mx-3 text-[9px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                Grow Together
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-zinc-800/80"></div>
            </div>

            {/* Sign In link */}
            <div className="text-center text-[11px] font-bold text-slate-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-black text-emerald-600 dark:text-emerald-400 hover:underline hover:text-emerald-500 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Secure signup label */}
        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-3 text-center font-medium">
          Protected by Sprout Climate Shield. Secure JWT encryption.
        </p>
      </div>
    </div>
  );
}