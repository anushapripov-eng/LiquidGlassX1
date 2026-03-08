module.exports = [
"[project]/lib/store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatCurrency",
    ()=>formatCurrency,
    "formatPercent",
    ()=>formatPercent,
    "generateId",
    ()=>generateId,
    "getWeekStart",
    ()=>getWeekStart,
    "loadUserDataFromSupabase",
    ()=>loadUserDataFromSupabase,
    "supabase",
    ()=>supabase,
    "useStore",
    ()=>useStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
"use client";
;
;
// ── Supabase Client ────────────────────────────────────────────────
const supabaseUrl = ("TURBOPACK compile-time value", "https://cbnuokgmzvlmrtjiwigh.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNibnVva2dtenZsbXJ0aml3aWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTgyNjgsImV4cCI6MjA4ODE3NDI2OH0.cqyVdT7fA1isnX2QIk27ZGZSIm96L3rMMuYl9amz4CE");
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
const defaultState = {
    auth: {
        isLoggedIn: false,
        currentUser: null,
        currentUserId: null,
        users: []
    },
    profile: {
        nickname: "Trader",
        avatarIndex: 0,
        customAvatarUrl: undefined,
        accountSize: 10000,
        bio: ""
    },
    balance: 10000,
    initialBalance: 10000,
    trades: [],
    weeklyNotes: [],
    mistakes: [],
    importantPoints: [],
    rules: [
        {
            id: "r1",
            text: "Only trade after 11:00 Dubai time (GMT+4)",
            createdAt: new Date().toISOString()
        },
        {
            id: "r2",
            text: "Close all positions by 22:00 Dubai time",
            createdAt: new Date().toISOString()
        },
        {
            id: "r3",
            text: "Maximum 1 trade per day",
            createdAt: new Date().toISOString()
        },
        {
            id: "r4",
            text: "Use 15-minute chart for analysis",
            createdAt: new Date().toISOString()
        },
        {
            id: "r5",
            text: "Weekly goal: +2% on account",
            createdAt: new Date().toISOString()
        },
        {
            id: "r6",
            text: "1 profitable trade per week = week is done",
            createdAt: new Date().toISOString()
        }
    ],
    skipDays: [],
    accentColor: "blue",
    finnhubApiKey: "",
    metalPriceApiKey: "d849bb0071fd2f5442fdd4b1f0381498",
    isSyncing: false
};
// ── Store ──────────────────────────────────────────────────────────
let state = defaultState;
let listeners = new Set();
let isInitialized = false;
function emit() {
    listeners.forEach((l)=>l());
}
function getSnapshot() {
    return state;
}
function getServerSnapshot() {
    return defaultState;
}
function subscribe(listener) {
    listeners.add(listener);
    return ()=>listeners.delete(listener);
}
async function loadUserDataFromSupabase(userId) {
    state = {
        ...state,
        isSyncing: true
    };
    emit();
    try {
        // Load profile
        const { data: profile } = await supabase.from("profile_settings").select("*").eq("user_id", userId).single();
        // Load trades
        const { data: trades } = await supabase.from("trades").select("*").eq("user_id", userId).order("trade_date", {
            ascending: false
        });
        // Load weekly notes
        const { data: weeklyNotes } = await supabase.from("weekly_notes").select("*").eq("user_id", userId);
        // Load mistakes
        const { data: mistakes } = await supabase.from("mistakes").select("*").eq("user_id", userId);
        // Load important points
        const { data: importantPoints } = await supabase.from("important_points").select("*").eq("user_id", userId).order("sort_order", {
            ascending: true
        });
        // Load rules
        const { data: rules } = await supabase.from("rules").select("*").eq("user_id", userId).order("sort_order", {
            ascending: true
        });
        // Load skip days
        const { data: dailyNotes } = await supabase.from("daily_notes").select("*").eq("user_id", userId).eq("is_skipped", true);
        state = {
            ...state,
            isSyncing: false,
            profile: profile ? {
                nickname: profile.nickname ?? state.profile.nickname,
                avatarIndex: profile.avatar_index ?? 0,
                customAvatarUrl: profile.custom_avatar_url,
                accountSize: Number(profile.account_size) || 10000,
                bio: profile.bio ?? ""
            } : state.profile,
            balance: profile ? Number(profile.account_size) || state.balance : state.balance,
            initialBalance: profile ? Number(profile.account_size) || state.initialBalance : state.initialBalance,
            accentColor: profile?.accent_color ?? state.accentColor,
            finnhubApiKey: profile?.finnhub_api_key ?? "",
            metalPriceApiKey: profile?.metal_price_api_key ?? state.metalPriceApiKey,
            trades: (trades ?? []).map((t)=>({
                    id: t.id,
                    date: t.trade_date,
                    asset: t.asset,
                    result: Number(t.result),
                    notes: t.notes ?? "",
                    photoUrl: t.photo_url
                })),
            weeklyNotes: (weeklyNotes ?? []).map((w)=>({
                    id: w.id,
                    weekStart: w.week_start_date,
                    notes: w.thoughts ?? "",
                    learning: w.learning,
                    improve: w.improve,
                    thoughts: w.thoughts,
                    balanceChange: Number(w.balance_change) || 0,
                    goalHit: w.goal_hit ?? false
                })),
            mistakes: (mistakes ?? []).map((m)=>({
                    id: m.id,
                    date: m.mistake_date,
                    description: m.description,
                    tag: m.tag
                })),
            importantPoints: (importantPoints ?? []).map((p)=>({
                    id: p.id,
                    note: p.note,
                    pinned: p.is_pinned ?? false,
                    imageUrl: p.image_url,
                    createdAt: p.created_at
                })),
            rules: rules && rules.length > 0 ? rules.map((r)=>({
                    id: r.id,
                    text: r.text,
                    imageUrl: r.image_url,
                    createdAt: r.created_at
                })) : state.rules,
            skipDays: (dailyNotes ?? []).map((d)=>d.note_date)
        };
        // Recalculate balance from trades
        if (trades && trades.length > 0 && profile) {
            const baseBalance = Number(profile.account_size) || 10000;
            let currentBalance = baseBalance;
            const sortedTrades = [
                ...trades
            ].sort((a, b)=>new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());
            for (const t of sortedTrades){
                currentBalance = currentBalance + currentBalance * (Number(t.result) / 100);
            }
            state = {
                ...state,
                balance: currentBalance,
                initialBalance: baseBalance
            };
        }
        emit();
    } catch (error) {
        console.error("Failed to load data from Supabase:", error);
        state = {
            ...state,
            isSyncing: false
        };
        emit();
    }
}
function useStore() {
    const snap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribe, getSnapshot, getServerSnapshot);
    // Initialize: check session on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isInitialized) return;
        isInitialized = true;
        const checkSession = async ()=>{
            const res = await fetch("/api/auth/session").catch(()=>null);
            if (!res?.ok) return;
            const data = await res.json().catch(()=>null);
            if (data?.user) {
                state = {
                    ...state,
                    auth: {
                        ...state.auth,
                        isLoggedIn: true,
                        currentUser: data.user.name,
                        currentUserId: data.user.id
                    },
                    profile: {
                        ...state.profile,
                        nickname: data.user.nickname,
                        avatarIndex: data.user.avatarIndex
                    }
                };
                emit();
                await loadUserDataFromSupabase(data.user.id);
            }
        };
        checkSession();
    }, []);
    const updateProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (profile)=>{
        state = {
            ...state,
            profile: {
                ...state.profile,
                ...profile
            }
        };
        emit();
        const userId = state.auth.currentUserId;
        if (!userId) return;
        await supabase.from("profile_settings").upsert({
            user_id: userId,
            nickname: state.profile.nickname,
            avatar_index: state.profile.avatarIndex,
            custom_avatar_url: profile.customAvatarUrl,
            account_size: state.profile.accountSize,
            bio: state.profile.bio,
            accent_color: state.accentColor,
            updated_at: new Date().toISOString()
        });
    }, []);
    const setBalance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (balance)=>{
        state = {
            ...state,
            balance
        };
        emit();
    }, []);
    const setInitialBalance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (initialBalance)=>{
        state = {
            ...state,
            initialBalance
        };
        emit();
        const userId = state.auth.currentUserId;
        if (!userId) return;
        await supabase.from("profile_settings").upsert({
            user_id: userId,
            account_size: initialBalance,
            updated_at: new Date().toISOString()
        });
    }, []);
    const addTrade = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (trade)=>{
        const tempId = crypto.randomUUID();
        const newTrade = {
            ...trade,
            id: tempId
        };
        state = {
            ...state,
            trades: [
                ...state.trades,
                newTrade
            ]
        };
        const change = state.balance * (trade.result / 100);
        state = {
            ...state,
            balance: state.balance + change
        };
        emit();
        const userId = state.auth.currentUserId;
        if (userId) {
            const { data } = await supabase.from("trades").insert({
                user_id: userId,
                asset: trade.asset,
                result: trade.result,
                trade_date: trade.date,
                notes: trade.notes,
                photo_url: trade.photoUrl
            }).select().single();
            if (data) {
                state = {
                    ...state,
                    trades: state.trades.map((t)=>t.id === tempId ? {
                            ...t,
                            id: data.id
                        } : t)
                };
                emit();
            }
        }
        if (state.auth.currentUser === "Anush") {
            fetch("/api/journal/status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tradesCount: 1,
                    pnlPercent: trade.result,
                    symbol: trade.asset,
                    status: trade.result > 0 ? "profit" : trade.result < 0 ? "loss" : "skip"
                })
            }).catch(()=>{});
        }
    }, []);
    const updateTrade = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (id, updates)=>{
        state = {
            ...state,
            trades: state.trades.map((t)=>t.id === id ? {
                    ...t,
                    ...updates
                } : t)
        };
        emit();
        const userId = state.auth.currentUserId;
        if (!userId) return;
        await supabase.from("trades").update({
            asset: updates.asset,
            result: updates.result,
            trade_date: updates.date,
            notes: updates.notes,
            photo_url: updates.photoUrl,
            updated_at: new Date().toISOString()
        }).eq("id", id).eq("user_id", userId);
    }, []);
    const deleteTrade = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (id)=>{
        state = {
            ...state,
            trades: state.trades.filter((t)=>t.id !== id)
        };
        emit();
        const userId = state.auth.currentUserId;
        if (userId) {
            await supabase.from("trades").delete().eq("id", id).eq("user_id", userId);
        }
    }, []);
    const addWeeklyNote = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (note)=>{
        const existing = state.weeklyNotes.find((n)=>n.weekStart === note.weekStart);
        if (existing) {
            state = {
                ...state,
                weeklyNotes: state.weeklyNotes.map((n)=>n.weekStart === note.weekStart ? {
                        ...n,
                        ...note
                    } : n)
            };
        } else {
            state = {
                ...state,
                weeklyNotes: [
                    ...state.weeklyNotes,
                    {
                        ...note,
                        id: crypto.randomUUID()
                    }
                ]
            };
        }
        emit();
        const userId = state.auth.currentUserId;
        if (!userId) return;
        await supabase.from("weekly_notes").upsert({
            user_id: userId,
            week_start_date: note.weekStart,
            learning: note.learning,
            improve: note.improve,
            thoughts: note.thoughts,
            balance_change: note.balanceChange,
            goal_hit: note.goalHit,
            updated_at: new Date().toISOString()
        }, {
            onConflict: "user_id,week_start_date"
        });
    }, []);
    const addMistake = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (mistake)=>{
        const tempId = crypto.randomUUID();
        state = {
            ...state,
            mistakes: [
                ...state.mistakes,
                {
                    ...mistake,
                    id: tempId
                }
            ]
        };
        emit();
        const userId = state.auth.currentUserId;
        if (userId) {
            const { data } = await supabase.from("mistakes").insert({
                user_id: userId,
                mistake_date: mistake.date,
                description: mistake.description,
                tag: mistake.tag
            }).select().single();
            if (data) {
                state = {
                    ...state,
                    mistakes: state.mistakes.map((m)=>m.id === tempId ? {
                            ...m,
                            id: data.id
                        } : m)
                };
                emit();
            }
        }
    }, []);
    const deleteMistake = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (id)=>{
        state = {
            ...state,
            mistakes: state.mistakes.filter((m)=>m.id !== id)
        };
        emit();
        const userId = state.auth.currentUserId;
        if (userId) {
            await supabase.from("mistakes").delete().eq("id", id).eq("user_id", userId);
        }
    }, []);
    const addImportantPoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (point)=>{
        const tempId = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        state = {
            ...state,
            importantPoints: [
                ...state.importantPoints,
                {
                    ...point,
                    id: tempId,
                    createdAt
                }
            ]
        };
        emit();
        const userId = state.auth.currentUserId;
        if (userId) {
            const { data } = await supabase.from("important_points").insert({
                user_id: userId,
                note: point.note,
                is_pinned: point.pinned,
                image_url: point.imageUrl,
                sort_order: state.importantPoints.length - 1
            }).select().single();
            if (data) {
                state = {
                    ...state,
                    importantPoints: state.importantPoints.map((p)=>p.id === tempId ? {
                            ...p,
                            id: data.id
                        } : p)
                };
                emit();
            }
        }
    }, []);
    const deleteImportantPoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (id)=>{
        state = {
            ...state,
            importantPoints: state.importantPoints.filter((p)=>p.id !== id)
        };
        emit();
        const userId = state.auth.currentUserId;
        if (userId) {
            await supabase.from("important_points").delete().eq("id", id).eq("user_id", userId);
        }
    }, []);
    const moveImportantPoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (id, direction)=>{
        const idx = state.importantPoints.findIndex((p)=>p.id === id);
        if (idx < 0) return;
        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= state.importantPoints.length) return;
        const items = [
            ...state.importantPoints
        ];
        [items[idx], items[newIdx]] = [
            items[newIdx],
            items[idx]
        ];
        state = {
            ...state,
            importantPoints: items
        };
        emit();
        const userId = state.auth.currentUserId;
        if (userId) {
            await Promise.all([
                supabase.from("important_points").update({
                    sort_order: newIdx
                }).eq("id", items[newIdx].id),
                supabase.from("important_points").update({
                    sort_order: idx
                }).eq("id", items[idx].id)
            ]);
        }
    }, []);
    const addRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (rule)=>{
        const tempId = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        state = {
            ...state,
            rules: [
                ...state.rules,
                {
                    ...rule,
                    id: tempId,
                    createdAt
                }
            ]
        };
        emit();
        const userId = state.auth.currentUserId;
        if (userId) {
            const { data } = await supabase.from("rules").insert({
                user_id: userId,
                text: rule.text,
                image_url: rule.imageUrl,
                sort_order: state.rules.length - 1
            }).select().single();
            if (data) {
                state = {
                    ...state,
                    rules: state.rules.map((r)=>r.id === tempId ? {
                            ...r,
                            id: data.id
                        } : r)
                };
                emit();
            }
        }
    }, []);
    const deleteRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (id)=>{
        state = {
            ...state,
            rules: state.rules.filter((r)=>r.id !== id)
        };
        emit();
        const userId = state.auth.currentUserId;
        if (userId) {
            await supabase.from("rules").delete().eq("id", id).eq("user_id", userId);
        }
    }, []);
    const moveRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (id, direction)=>{
        const idx = state.rules.findIndex((r)=>r.id === id);
        if (idx < 0) return;
        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= state.rules.length) return;
        const items = [
            ...state.rules
        ];
        [items[idx], items[newIdx]] = [
            items[newIdx],
            items[idx]
        ];
        state = {
            ...state,
            rules: items
        };
        emit();
        const userId = state.auth.currentUserId;
        if (userId) {
            await Promise.all([
                supabase.from("rules").update({
                    sort_order: newIdx
                }).eq("id", items[newIdx].id),
                supabase.from("rules").update({
                    sort_order: idx
                }).eq("id", items[idx].id)
            ]);
        }
    }, []);
    const toggleSkipDay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (date)=>{
        const isSkipped = state.skipDays.includes(date);
        state = {
            ...state,
            skipDays: isSkipped ? state.skipDays.filter((d)=>d !== date) : [
                ...state.skipDays,
                date
            ]
        };
        emit();
        const userId = state.auth.currentUserId;
        if (!userId) return;
        if (isSkipped) {
            await supabase.from("daily_notes").delete().eq("user_id", userId).eq("note_date", date).eq("is_skipped", true);
        } else {
            await supabase.from("daily_notes").upsert({
                user_id: userId,
                note_date: date,
                is_skipped: true,
                status: "break"
            }, {
                onConflict: "user_id,note_date"
            });
        }
    }, []);
    const setAccentColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (color)=>{
        state = {
            ...state,
            accentColor: color
        };
        emit();
        const userId = state.auth.currentUserId;
        if (userId) {
            await supabase.from("profile_settings").upsert({
                user_id: userId,
                accent_color: color,
                updated_at: new Date().toISOString()
            });
        }
    }, []);
    const setFinnhubApiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (key)=>{
        state = {
            ...state,
            finnhubApiKey: key
        };
        emit();
        const userId = state.auth.currentUserId;
        if (userId) {
            await supabase.from("profile_settings").upsert({
                user_id: userId,
                finnhub_api_key: key,
                updated_at: new Date().toISOString()
            });
        }
    }, []);
    const setMetalPriceApiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (key)=>{
        state = {
            ...state,
            metalPriceApiKey: key
        };
        emit();
        const userId = state.auth.currentUserId;
        if (userId) {
            await supabase.from("profile_settings").upsert({
                user_id: userId,
                metal_price_api_key: key,
                updated_at: new Date().toISOString()
            });
        }
    }, []);
    const setSession = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (user)=>{
        state = {
            ...state,
            auth: {
                ...state.auth,
                isLoggedIn: true,
                currentUser: user.name,
                currentUserId: user.id ?? null
            },
            profile: {
                ...state.profile,
                nickname: user.nickname,
                avatarIndex: user.avatarIndex
            }
        };
        emit();
        if (user.id) {
            await loadUserDataFromSupabase(user.id);
        }
    }, []);
    const registerUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((_user)=>{
        // Registration is handled by /api/auth endpoint + Supabase
        return {
            success: true
        };
    }, []);
    const loginUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((_name, _password)=>{
        // Login is handled by /api/auth endpoint + Supabase
        return {
            success: true
        };
    }, []);
    const logoutUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        state = {
            ...defaultState,
            auth: {
                isLoggedIn: false,
                currentUser: null,
                currentUserId: null,
                users: []
            }
        };
        isInitialized = false;
        emit();
        fetch("/api/auth", {
            method: "DELETE"
        }).catch(()=>{});
    }, []);
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
        logoutUser
    };
}
function generateId() {
    return crypto.randomUUID();
}
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
}
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2
    }).format(amount);
}
function formatPercent(value) {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
}
}),
"[project]/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/components/auth-screen.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthScreen",
    ()=>AuthScreen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-ssr] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-in.js [app-ssr] (ecmascript) <export default as LogIn>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-ssr] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-ssr] (ecmascript) <export default as AlertCircle>");
"use client";
;
;
;
;
;
const AVATARS = [
    {
        bg: "bg-blue-500",
        letter: "T",
        label: "Trader"
    },
    {
        bg: "bg-emerald-500",
        letter: "B",
        label: "Bull"
    },
    {
        bg: "bg-orange-500",
        letter: "F",
        label: "Fox"
    },
    {
        bg: "bg-rose-500",
        letter: "R",
        label: "Red"
    },
    {
        bg: "bg-violet-500",
        letter: "V",
        label: "Viper"
    },
    {
        bg: "bg-cyan-500",
        letter: "S",
        label: "Shark"
    },
    {
        bg: "bg-amber-500",
        letter: "G",
        label: "Gold"
    },
    {
        bg: "bg-pink-500",
        letter: "P",
        label: "Pro"
    }
];
function AuthScreen() {
    const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"])();
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("login");
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [accountSize, setAccountSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("10000");
    const [avatarIndex, setAvatarIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [showPassword, setShowPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError("");
        if (!name.trim()) {
            setError("Please enter your name");
            return;
        }
        if (!password.trim()) {
            setError("Please enter a password");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: name.trim(),
                    password
                })
            });
            const data = await res.json();
            if (data.success) {
                store.setSession(data.user);
                window.location.href = "/";
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Server error");
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 pointer-events-none",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-[-30%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/[0.04] blur-[150px]"
                    }, void 0, false, {
                        fileName: "[project]/components/auth-screen.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-chart-2/[0.04] blur-[150px]"
                    }, void 0, false, {
                        fileName: "[project]/components/auth-screen.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/auth-screen.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-sm relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                                    className: "w-8 h-8 text-primary-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/components/auth-screen.tsx",
                                    lineNumber: 72,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/auth-screen.tsx",
                                lineNumber: 71,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold text-foreground tracking-tight text-balance text-center",
                                children: "TradeJournal"
                            }, void 0, false, {
                                fileName: "[project]/components/auth-screen.tsx",
                                lineNumber: 74,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-muted-foreground mt-1",
                                children: "Welcome back, trader"
                            }, void 0, false, {
                                fileName: "[project]/components/auth-screen.tsx",
                                lineNumber: 75,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/auth-screen.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "glass-strong rounded-2xl p-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleSubmit,
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs font-medium text-muted-foreground mb-1.5 block",
                                            children: "Name"
                                        }, void 0, false, {
                                            fileName: "[project]/components/auth-screen.tsx",
                                            lineNumber: 85,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            value: name,
                                            onChange: (e)=>setName(e.target.value),
                                            className: "w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200",
                                            placeholder: "Your name",
                                            autoComplete: "username"
                                        }, void 0, false, {
                                            fileName: "[project]/components/auth-screen.tsx",
                                            lineNumber: 86,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/auth-screen.tsx",
                                    lineNumber: 84,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs font-medium text-muted-foreground mb-1.5 block",
                                            children: "Password"
                                        }, void 0, false, {
                                            fileName: "[project]/components/auth-screen.tsx",
                                            lineNumber: 97,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    value: password,
                                                    onChange: (e)=>setPassword(e.target.value),
                                                    type: showPassword ? "text" : "password",
                                                    className: "w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200",
                                                    placeholder: "Password",
                                                    autoComplete: "current-password"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/auth-screen.tsx",
                                                    lineNumber: 99,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setShowPassword(!showPassword),
                                                    className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                                                    children: showPassword ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/auth-screen.tsx",
                                                        lineNumber: 112,
                                                        columnNumber: 35
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/auth-screen.tsx",
                                                        lineNumber: 112,
                                                        columnNumber: 68
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/auth-screen.tsx",
                                                    lineNumber: 107,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/auth-screen.tsx",
                                            lineNumber: 98,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/auth-screen.tsx",
                                    lineNumber: 96,
                                    columnNumber: 13
                                }, this),
                                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-xl px-3 py-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                            className: "w-3.5 h-3.5 shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/components/auth-screen.tsx",
                                            lineNumber: 120,
                                            columnNumber: 17
                                        }, this),
                                        error
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/auth-screen.tsx",
                                    lineNumber: 119,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: loading,
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all duration-300 active:scale-[0.98] hover:opacity-90", loading && "opacity-70"),
                                    children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/components/auth-screen.tsx",
                                        lineNumber: 135,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__["LogIn"], {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/components/auth-screen.tsx",
                                                lineNumber: 138,
                                                columnNumber: 19
                                            }, this),
                                            "Sign In"
                                        ]
                                    }, void 0, true)
                                }, void 0, false, {
                                    fileName: "[project]/components/auth-screen.tsx",
                                    lineNumber: 126,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/auth-screen.tsx",
                            lineNumber: 82,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/auth-screen.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/auth-screen.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/auth-screen.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/login/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2d$screen$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/auth-screen.tsx [app-ssr] (ecmascript)");
"use client";
;
;
function LoginPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2d$screen$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuthScreen"], {}, void 0, false, {
        fileName: "[project]/app/login/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
}),
];

//# sourceMappingURL=_a6d74986._.js.map