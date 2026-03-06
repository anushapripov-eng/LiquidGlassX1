"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { BarChart3, ArrowRight, UserPlus, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react"

const AVATARS = [
  { bg: "bg-blue-500", letter: "T", label: "Trader" },
  { bg: "bg-emerald-500", letter: "B", label: "Bull" },
  { bg: "bg-orange-500", letter: "F", label: "Fox" },
  { bg: "bg-rose-500", letter: "R", label: "Red" },
  { bg: "bg-violet-500", letter: "V", label: "Viper" },
  { bg: "bg-cyan-500", letter: "S", label: "Shark" },
  { bg: "bg-amber-500", letter: "G", label: "Gold" },
  { bg: "bg-pink-500", letter: "P", label: "Pro" },
]

type Mode = "login" | "register"

export function AuthScreen() {
  const store = useStore()
  const [mode, setMode] = useState<Mode>("login")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [accountSize, setAccountSize] = useState("10000")
  const [avatarIndex, setAvatarIndex] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) { setError("Please enter your name"); return }
    if (!password.trim()) { setError("Please enter a password"); return }

    setLoading(true)
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name.trim(), password }),
      })
      const data = await res.json()
      if (data.success) {
        store.setSession(data.user)
        window.location.href = "/"
      } else {
        setError(data.error || "Login failed")
      }
    } catch (err) {
      setError("Server error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/[0.04] blur-[150px]" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-chart-2/[0.04] blur-[150px]" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <BarChart3 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight text-balance text-center">TradeJournal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, trader
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-strong rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                placeholder="Your name"
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-xl px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all duration-300 active:scale-[0.98] hover:opacity-90",
                loading && "opacity-70"
              )}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
