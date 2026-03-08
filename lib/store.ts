"use client"

import { useSyncExternalStore, useCallback, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

// ── Supabase Client ────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Types ──────────────────────────────────────────────────────────
export interface Trade {
  id: string
  date: string
  asset: string
  result: number
  notes: string
  imageUrl?: string
  photoUrl?: string
}

export interface WeeklyNote {
  id: string
  weekStart: string
  notes: string
  learning?: string
  improve?: string
  thoughts?: string
  balanceChange: number
  goalHit: boolean
}

export interface Mistake {
  id: string
  date: string
  description: string
  tag: "technical" | "broke-rules" | "other"
}

export interface ImportantPoint {
  id: string
  note: string
  pinned: boolean
  imageUrl?: string
  createdAt: string
}

export interface Rule {
  id: string
  text: string
  imageUrl?: string
  createdAt: string
}

export interface UserProfile {
  nickname: string
  avatarIndex: number
  customAvatarUrl?: string
  accountSize: number
  bio: string
}

export interface AuthUser {
  name: string
  password: string
  accountSize: number
  avatarIndex: number
}

export interface AppState {
  auth: {
    isLoggedIn: boolean
    currentUser: string | null
    currentUserId: string | null
    users: AuthUser[]
  }
  profile: UserProfile
  balance: number
  initialBalance: number
  trades: Trade[]
  weeklyNotes: WeeklyNote[]
  mistakes: Mistake[]
  importantPoints: ImportantPoint[]
  rules: Rule[]
  skipDays: string[]
  accentColor: string
  finnhubApiKey: string
  metalPriceApiKey: string
  isSyncing: boolean
}

const defaultState: AppState = {
  auth: {
    isLoggedIn: false,
    currentUser: null,
    currentUserId: null,
    users: [],
  },
  profile: {
    nickname: "Trader",
    avatarIndex: 0,
    customAvatarUrl: undefined,
    accountSize: 10000,
    bio: "",
  },
  balance: 10000,
  initialBalance: 10000,
  trades: [],
  weeklyNotes: [],
  mistakes: [],
  importantPoints: [],
  rules: [
    { id: "r1", text: "Only trade after 11:00 Dubai time (GMT+4)", createdAt: new Date().toISOString() },
    { id: "r2", text: "Close all positions by 22:00 Dubai time", createdAt: new Date().toISOString() },
    { id: "r3", text: "Maximum 1 trade per day", createdAt: new Date().toISOString() },
    { id: "r4", text: "Use 15-minute chart for analysis", createdAt: new Date().toISOString() },
    { id: "r5", text: "Weekly goal: +2% on account", createdAt: new Date().toISOString() },
    { id: "r6", text: "1 profitable trade per week = week is done", createdAt: new Date().toISOString() },
  ],
  skipDays: [],
  accentColor: "blue",
  finnhubApiKey: "",
  metalPriceApiKey: "d849bb0071fd2f5442fdd4b1f0381498",
  isSyncing: false,
}

// ── Store ──────────────────────────────────────────────────────────
let state: AppState = defaultState
let listeners = new Set<() => void>()
let isInitialized = false

function emit() {
  listeners.forEach((l) => l())
}

function getSnapshot(): AppState {
  return state
}

function getServerSnapshot(): AppState {
  return defaultState
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// ── Supabase Data Loading ──────────────────────────────────────────
export async function loadUserDataFromSupabase(userId: string) {
  state = { ...state, isSyncing: true }
  emit()

  try {
    // Load profile
    const { data: profile } = await supabase
      .from("profile_settings")
      .select("*")
      .eq("user_id", userId)
      .single()

    // Load trades
    const { data: trades } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", userId)
      .order("trade_date", { ascending: false })

    // Load weekly notes
    const { data: weeklyNotes } = await supabase
      .from("weekly_notes")
      .select("*")
      .eq("user_id", userId)

    // Load mistakes
    const { data: mistakes } = await supabase
      .from("mistakes")
      .select("*")
      .eq("user_id", userId)

    // Load important points
    const { data: importantPoints } = await supabase
      .from("important_points")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true })

    // Load rules
    const { data: rules } = await supabase
      .from("rules")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true })

    // Load skip days
    const { data: dailyNotes } = await supabase
      .from("daily_notes")
      .select("*")
      .eq("user_id", userId)
      .eq("is_skipped", true)

    state = {
      ...state,
      isSyncing: false,
      profile: profile ? {
        nickname: profile.nickname ?? state.profile.nickname,
        avatarIndex: profile.avatar_index ?? 0,
        customAvatarUrl: profile.custom_avatar_url,
        accountSize: Number(profile.account_size) || 10000,
        bio: profile.bio ?? "",
      } : state.profile,
      balance: profile ? Number(profile.account_size) || state.balance : state.balance,
      initialBalance: profile ? Number(profile.account_size) || state.initialBalance : state.initialBalance,
      accentColor: profile?.accent_color ?? state.accentColor,
      finnhubApiKey: profile?.finnhub_api_key ?? "",
      metalPriceApiKey: profile?.metal_price_api_key ?? state.metalPriceApiKey,
      trades: (trades ?? []).map((t) => ({
        id: t.id,
        date: t.trade_date,
        asset: t.asset,
        result: Number(t.result),
        notes: t.notes ?? "",
        photoUrl: t.photo_url,
      })),
      weeklyNotes: (weeklyNotes ?? []).map((w) => ({
        id: w.id,
        weekStart: w.week_start_date,
        notes: w.thoughts ?? "",
        learning: w.learning,
        improve: w.improve,
        thoughts: w.thoughts,
        balanceChange: Number(w.balance_change) || 0,
        goalHit: w.goal_hit ?? false,
      })),
      mistakes: (mistakes ?? []).map((m) => ({
        id: m.id,
        date: m.mistake_date,
        description: m.description,
        tag: m.tag as Mistake["tag"],
      })),
      importantPoints: (importantPoints ?? []).map((p) => ({
        id: p.id,
        note: p.note,
        pinned: p.is_pinned ?? false,
        imageUrl: p.image_url,
        createdAt: p.created_at,
      })),
      rules: rules && rules.length > 0
        ? rules.map((r) => ({
            id: r.id,
            text: r.text,
            imageUrl: r.image_url,
            createdAt: r.created_at,
          }))
        : state.rules,
      skipDays: (dailyNotes ?? []).map((d) => d.note_date),
    }

    // Recalculate balance from trades
    if (trades && trades.length > 0 && profile) {
      const baseBalance = Number(profile.account_size) || 10000
      let currentBalance = baseBalance
      const sortedTrades = [...trades].sort(
        (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
      )
      for (const t of sortedTrades) {
        currentBalance = currentBalance + currentBalance * (Number(t.result) / 100)
      }
      state = { ...state, balance: currentBalance, initialBalance: baseBalance }
    }

    emit()
  } catch (error) {
    console.error("Failed to load data from Supabase:", error)
    state = { ...state, isSyncing: false }
    emit()
  }
}

// ── Hook ───────────────────────────────────────────────────────────
export function useStore() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Initialize: check session on mount
  useEffect(() => {
    if (isInitialized) return
    isInitialized = true

    const checkSession = async () => {
      const res = await fetch("/api/auth/session").catch(() => null)
      if (!res?.ok) return
      const data = await res.json().catch(() => null)
      if (data?.user) {
        state = {
          ...state,
          auth: {
            ...state.auth,
            isLoggedIn: true,
            currentUser: data.user.name,
            currentUserId: data.user.id,
          },
          profile: {
            ...state.profile,
            nickname: data.user.nickname,
            avatarIndex: data.user.avatarIndex,
          },
        }
        emit()
        await loadUserDataFromSupabase(data.user.id)
      }
    }

    checkSession()
  }, [])

  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    state = { ...state, profile: { ...state.profile, ...profile } }
    emit()

    const userId = state.auth.currentUserId
    if (!userId) return

    await supabase.from("profile_settings").upsert({
      user_id: userId,
      nickname: state.profile.nickname,
      avatar_index: state.profile.avatarIndex,
      custom_avatar_url: profile.customAvatarUrl,
      account_size: state.profile.accountSize,
      bio: state.profile.bio,
      accent_color: state.accentColor,
      updated_at: new Date().toISOString(),
    })
  }, [])

  const setBalance = useCallback(async (balance: number) => {
    state = { ...state, balance }
    emit()
  }, [])

  const setInitialBalance = useCallback(async (initialBalance: number) => {
    state = { ...state, initialBalance }
    emit()

    const userId = state.auth.currentUserId
    if (!userId) return

    await supabase.from("profile_settings").upsert({
      user_id: userId,
      account_size: initialBalance,
      updated_at: new Date().toISOString(),
    })
  }, [])

  const addTrade = useCallback(async (trade: Omit<Trade, "id">) => {
    const tempId = crypto.randomUUID()
    const newTrade = { ...trade, id: tempId }
    state = { ...state, trades: [...state.trades, newTrade] }
    const change = state.balance * (trade.result / 100)
    state = { ...state, balance: state.balance + change }
    emit()

    const userId = state.auth.currentUserId
    if (userId) {
      const { data } = await supabase.from("trades").insert({
        user_id: userId,
        asset: trade.asset,
        result: trade.result,
        trade_date: trade.date,
        notes: trade.notes,
        photo_url: trade.photoUrl,
      }).select().single()

      if (data) {
        state = {
          ...state,
          trades: state.trades.map((t) => t.id === tempId ? { ...t, id: data.id } : t),
        }
        emit()
      }
    }

    if (state.auth.currentUser === "Anush") {
      fetch("/api/journal/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradesCount: 1,
          pnlPercent: trade.result,
          symbol: trade.asset,
          status: trade.result > 0 ? "profit" : trade.result < 0 ? "loss" : "skip",
        }),
      }).catch(() => {})
    }
  }, [])

  const updateTrade = useCallback(async (id: string, updates: Partial<Trade>) => {
    state = {
      ...state,
      trades: state.trades.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }
    emit()

    const userId = state.auth.currentUserId
    if (!userId) return

    await supabase.from("trades").update({
      asset: updates.asset,
      result: updates.result,
      trade_date: updates.date,
      notes: updates.notes,
      photo_url: updates.photoUrl,
      updated_at: new Date().toISOString(),
    }).eq("id", id).eq("user_id", userId)
  }, [])

  const deleteTrade = useCallback(async (id: string) => {
    state = { ...state, trades: state.trades.filter((t) => t.id !== id) }
    emit()

    const userId = state.auth.currentUserId
    if (userId) {
      await supabase.from("trades").delete().eq("id", id).eq("user_id", userId)
    }
  }, [])

  const addWeeklyNote = useCallback(async (note: Omit<WeeklyNote, "id">) => {
    const existing = state.weeklyNotes.find((n) => n.weekStart === note.weekStart)
    if (existing) {
      state = {
        ...state,
        weeklyNotes: state.weeklyNotes.map((n) =>
          n.weekStart === note.weekStart ? { ...n, ...note } : n
        ),
      }
    } else {
      state = {
        ...state,
        weeklyNotes: [...state.weeklyNotes, { ...note, id: crypto.randomUUID() }],
      }
    }
    emit()

    const userId = state.auth.currentUserId
    if (!userId) return

    await supabase.from("weekly_notes").upsert({
      user_id: userId,
      week_start_date: note.weekStart,
      learning: note.learning,
      improve: note.improve,
      thoughts: note.thoughts,
      balance_change: note.balanceChange,
      goal_hit: note.goalHit,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,week_start_date" })
  }, [])

  const addMistake = useCallback(async (mistake: Omit<Mistake, "id">) => {
    const tempId = crypto.randomUUID()
    state = {
      ...state,
      mistakes: [...state.mistakes, { ...mistake, id: tempId }],
    }
    emit()

    const userId = state.auth.currentUserId
    if (userId) {
      const { data } = await supabase.from("mistakes").insert({
        user_id: userId,
        mistake_date: mistake.date,
        description: mistake.description,
        tag: mistake.tag,
      }).select().single()

      if (data) {
        state = {
          ...state,
          mistakes: state.mistakes.map((m) => m.id === tempId ? { ...m, id: data.id } : m),
        }
        emit()
      }
    }
  }, [])

  const deleteMistake = useCallback(async (id: string) => {
    state = { ...state, mistakes: state.mistakes.filter((m) => m.id !== id) }
    emit()

    const userId = state.auth.currentUserId
    if (userId) {
      await supabase.from("mistakes").delete().eq("id", id).eq("user_id", userId)
    }
  }, [])

  const addImportantPoint = useCallback(async (point: Omit<ImportantPoint, "id" | "createdAt">) => {
    const tempId = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    state = {
      ...state,
      importantPoints: [
        ...state.importantPoints,
        { ...point, id: tempId, createdAt },
      ],
    }
    emit()

    const userId = state.auth.currentUserId
    if (userId) {
      const { data } = await supabase.from("important_points").insert({
        user_id: userId,
        note: point.note,
        is_pinned: point.pinned,
        image_url: point.imageUrl,
        sort_order: state.importantPoints.length - 1,
      }).select().single()

      if (data) {
        state = {
          ...state,
          importantPoints: state.importantPoints.map((p) =>
            p.id === tempId ? { ...p, id: data.id } : p
          ),
        }
        emit()
      }
    }
  }, [])

  const deleteImportantPoint = useCallback(async (id: string) => {
    state = {
      ...state,
      importantPoints: state.importantPoints.filter((p) => p.id !== id),
    }
    emit()

    const userId = state.auth.currentUserId
    if (userId) {
      await supabase.from("important_points").delete().eq("id", id).eq("user_id", userId)
    }
  }, [])

  const moveImportantPoint = useCallback(async (id: string, direction: "up" | "down") => {
    const idx = state.importantPoints.findIndex((p) => p.id === id)
    if (idx < 0) return
    const newIdx = direction === "up" ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= state.importantPoints.length) return
    const items = [...state.importantPoints]
    ;[items[idx], items[newIdx]] = [items[newIdx], items[idx]]
    state = { ...state, importantPoints: items }
    emit()

    const userId = state.auth.currentUserId
    if (userId) {
      await Promise.all([
        supabase.from("important_points").update({ sort_order: newIdx }).eq("id", items[newIdx].id),
        supabase.from("important_points").update({ sort_order: idx }).eq("id", items[idx].id),
      ])
    }
  }, [])

  const addRule = useCallback(async (rule: Omit<Rule, "id" | "createdAt">) => {
    const tempId = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    state = {
      ...state,
      rules: [...state.rules, { ...rule, id: tempId, createdAt }],
    }
    emit()

    const userId = state.auth.currentUserId
    if (userId) {
      const { data } = await supabase.from("rules").insert({
        user_id: userId,
        text: rule.text,
        image_url: rule.imageUrl,
        sort_order: state.rules.length - 1,
      }).select().single()

      if (data) {
        state = {
          ...state,
          rules: state.rules.map((r) => r.id === tempId ? { ...r, id: data.id } : r),
        }
        emit()
      }
    }
  }, [])

  const deleteRule = useCallback(async (id: string) => {
    state = { ...state, rules: state.rules.filter((r) => r.id !== id) }
    emit()

    const userId = state.auth.currentUserId
    if (userId) {
      await supabase.from("rules").delete().eq("id", id).eq("user_id", userId)
    }
  }, [])

  const moveRule = useCallback(async (id: string, direction: "up" | "down") => {
    const idx = state.rules.findIndex((r) => r.id === id)
    if (idx < 0) return
    const newIdx = direction === "up" ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= state.rules.length) return
    const items = [...state.rules]
    ;[items[idx], items[newIdx]] = [items[newIdx], items[idx]]
    state = { ...state, rules: items }
    emit()

    const userId = state.auth.currentUserId
    if (userId) {
      await Promise.all([
        supabase.from("rules").update({ sort_order: newIdx }).eq("id", items[newIdx].id),
        supabase.from("rules").update({ sort_order: idx }).eq("id", items[idx].id),
      ])
    }
  }, [])

  const toggleSkipDay = useCallback(async (date: string) => {
    const isSkipped = state.skipDays.includes(date)
    state = {
      ...state,
      skipDays: isSkipped
        ? state.skipDays.filter((d) => d !== date)
        : [...state.skipDays, date],
    }
    emit()

    const userId = state.auth.currentUserId
    if (!userId) return

    if (isSkipped) {
      await supabase.from("daily_notes")
        .delete()
        .eq("user_id", userId)
        .eq("note_date", date)
        .eq("is_skipped", true)
    } else {
      await supabase.from("daily_notes").upsert({
        user_id: userId,
        note_date: date,
        is_skipped: true,
        status: "break",
      }, { onConflict: "user_id,note_date" })
    }
  }, [])

  const setAccentColor = useCallback(async (color: string) => {
    state = { ...state, accentColor: color }
    emit()

    const userId = state.auth.currentUserId
    if (userId) {
      await supabase.from("profile_settings").upsert({
        user_id: userId,
        accent_color: color,
        updated_at: new Date().toISOString(),
      })
    }
  }, [])

  const setFinnhubApiKey = useCallback(async (key: string) => {
    state = { ...state, finnhubApiKey: key }
    emit()

    const userId = state.auth.currentUserId
    if (userId) {
      await supabase.from("profile_settings").upsert({
        user_id: userId,
        finnhub_api_key: key,
        updated_at: new Date().toISOString(),
      })
    }
  }, [])

  const setMetalPriceApiKey = useCallback(async (key: string) => {
    state = { ...state, metalPriceApiKey: key }
    emit()

    const userId = state.auth.currentUserId
    if (userId) {
      await supabase.from("profile_settings").upsert({
        user_id: userId,
        metal_price_api_key: key,
        updated_at: new Date().toISOString(),
      })
    }
  }, [])

  const setSession = useCallback(async (user: { name: string; nickname: string; avatarIndex: number; id?: string }) => {
    state = {
      ...state,
      auth: {
        ...state.auth,
        isLoggedIn: true,
        currentUser: user.name,
        currentUserId: user.id ?? null,
      },
      profile: {
        ...state.profile,
        nickname: user.nickname,
        avatarIndex: user.avatarIndex,
      },
    }
    emit()

    if (user.id) {
      await loadUserDataFromSupabase(user.id)
    }
  }, [])

  const registerUser = useCallback((_user: AuthUser): { success: boolean; error?: string } => {
    // Registration is handled by /api/auth endpoint + Supabase
    return { success: true }
  }, [])

  const loginUser = useCallback((_name: string, _password: string): { success: boolean; error?: string } => {
    // Login is handled by /api/auth endpoint + Supabase
    return { success: true }
  }, [])

  const logoutUser = useCallback(() => {
    state = {
      ...defaultState,
      auth: { isLoggedIn: false, currentUser: null, currentUserId: null, users: [] },
    }
    isInitialized = false
    emit()

    fetch("/api/auth", { method: "DELETE" }).catch(() => {})
  }, [])

  return {
    ...snap,
    updateProfile,
    setBalance,
    setInitialBalance,
    addTrade,
    updateTrade,
    deleteTrade,
    addWeeklyNote,
    addMistake,
    deleteMistake,
    addImportantPoint,
    deleteImportantPoint,
    moveImportantPoint,
    addRule,
    deleteRule,
    moveRule,
    toggleSkipDay,
    setAccentColor,
    setFinnhubApiKey,
    setMetalPriceApiKey,
    setSession,
    registerUser,
    loginUser,
    logoutUser,
  }
}

// ── Utility ────────────────────────────────────────────────────────
export function generateId() {
  return crypto.randomUUID()
}

export function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split("T")[0]
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}