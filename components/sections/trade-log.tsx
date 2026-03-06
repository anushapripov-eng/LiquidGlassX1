"use client"

import { useState, useRef, useEffect } from "react"
import { useStore, formatPercent } from "@/lib/store"
import type { Trade } from "@/lib/store"
import { GlassCard } from "@/components/glass-card"
import { cn } from "@/lib/utils"
import {
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  Trash2,
  ChevronLeft,
  Edit2,
  Check,
} from "lucide-react"

// Simple confetti-like flash effect
const SuccessFlash = () => (
  <div className="fixed inset-0 pointer-events-none z-[100] animate-in fade-in duration-500">
    <div className="absolute inset-0 bg-success/20 mix-blend-screen" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-4xl animate-bounce">✨🏆✨</div>
    </div>
  </div>
)

export function TradeLog() {
  const store = useStore()
  const [showForm, setShowForm] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [showFlash, setShowFlash] = useState(false)

  const sortedTrades = [...store.trades].sort((a, b) => b.date.localeCompare(a.date))

  if (selectedTrade) {
    return (
      <TradeDetail
        trade={selectedTrade}
        onBack={() => setSelectedTrade(null)}
        onDelete={(id) => {
          if (confirm("Are you sure you want to delete this trade?")) {
            store.deleteTrade(id)
            setSelectedTrade(null)
          }
        }}
        onUpdate={(id, updates) => {
          store.updateTrade(id, updates)
          setSelectedTrade({ ...selectedTrade, ...updates })
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {showFlash && <SuccessFlash />}
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Trade Log</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all duration-300 active:scale-95 hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add Trade
        </button>
      </div>

      {/* Add Trade Form */}
      {showForm && (
        <TradeForm
          onClose={() => setShowForm(false)}
          onSuccess={(isProfitable) => {
            if (isProfitable) {
              setShowFlash(true)
              setTimeout(() => setShowFlash(false), 2000)
            }
          }}
        />
      )}

      {/* Trades list */}
      {sortedTrades.length === 0 ? (
        <GlassCard className="p-8 flex flex-col items-center justify-center text-center" variant="subtle">
          <TrendingUp className="w-8 h-8 text-muted-foreground/40 mb-3" />
          <div className="text-sm text-muted-foreground">No trades yet. Add your first trade.</div>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedTrades.map((trade) => (
            <GlassCard
              key={trade.id}
              className="p-4"
              hover3d
              onClick={() => setSelectedTrade(trade)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    trade.result >= 0 ? "bg-success/10" : "bg-destructive/10"
                  )}>
                    {trade.result >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-success" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{trade.asset}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(trade.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-sm font-bold",
                    trade.result >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {formatPercent(trade.result)}
                  </span>
                  {trade.imageUrl && <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
              </div>
              {trade.notes && (
                <div className="mt-2 text-xs text-muted-foreground line-clamp-1">{trade.notes}</div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}

function TradeForm({ onClose, onSuccess }: { onClose: () => void; onSuccess?: (isProfitable: boolean) => void }) {
  const store = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [asset, setAsset] = useState("")
  const [result, setResult] = useState("")
  const [notes, setNotes] = useState("")
  const [imageUrl, setImageUrl] = useState<string | undefined>()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setImageUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!asset || !result) return
    const resVal = parseFloat(result)
    store.addTrade({
      date,
      asset,
      result: resVal,
      notes,
      imageUrl,
    })
    if (onSuccess) onSuccess(resVal > 0)
    onClose()
  }

  return (
    <GlassCard className="p-5" variant="strong">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">New Trade</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Asset</label>
            <input
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              placeholder="EURUSD"
              className="w-full bg-input/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Result (%)</label>
          <input
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="+1.5 or -0.8"
            className="w-full bg-input/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Trade notes..."
            className="w-full bg-input/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200 resize-none"
          />
        </div>

        {/* Image upload */}
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <ImageIcon className="w-4 h-4" />
            {imageUrl ? "Change Screenshot" : "Attach Screenshot"}
          </button>
          {imageUrl && (
            <div className="mt-2 relative rounded-xl overflow-hidden">
              <img src={imageUrl} alt="Trade screenshot" className="w-full h-32 object-cover rounded-xl" />
              <button
                onClick={() => setImageUrl(undefined)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!asset || !result}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all duration-300 active:scale-[0.98] hover:opacity-90 disabled:opacity-40"
        >
          Add Trade
        </button>
      </div>
    </GlassCard>
  )
}

function TradeDetail({
  trade,
  onBack,
  onDelete,
  onUpdate,
}: {
  trade: Trade
  onBack: () => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Trade>) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editAsset, setEditAsset] = useState(trade.asset)
  const [editResult, setEditResult] = useState(trade.result.toString())
  const [editNotes, setEditNotes] = useState(trade.notes)
  const [editDate, setEditDate] = useState(trade.date)
  const [editImage, setEditImage] = useState(trade.imageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    onUpdate(trade.id, {
      asset: editAsset,
      result: parseFloat(editResult) || 0,
      notes: editNotes,
      date: editDate,
      imageUrl: editImage
    })
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
        >
          {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
          {isEditing ? "Save Changes" : "Edit Trade"}
        </button>
      </div>

      <GlassCard className="p-6" variant="strong">
        {isEditing ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Date</label>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full bg-input/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Asset</label>
                <input value={editAsset} onChange={e => setEditAsset(e.target.value)} className="w-full bg-input/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Result (%)</label>
              <input value={editResult} onChange={e => setEditResult(e.target.value)} className="w-full bg-input/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Notes</label>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3} className="w-full bg-input/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground resize-none" />
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files?.[0]; if(!file) return;
                const r = new FileReader(); r.onloadend = () => setEditImage(r.result as string); r.readAsDataURL(file);
              }} />
              <button onClick={() => fileInputRef.current?.click()} className="text-xs text-primary font-bold">Change Screenshot</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">{trade.asset}</h2>
                <div className="text-sm text-muted-foreground">
                  {new Date(trade.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className={cn(
                "text-2xl font-bold",
                trade.result >= 0 ? "text-success" : "text-destructive"
              )}>
                {formatPercent(trade.result)}
              </div>
            </div>

            {trade.notes && (
              <div className="mb-4">
                <div className="text-xs font-medium text-muted-foreground mb-1">Notes</div>
                <div className="text-sm text-foreground leading-relaxed">{trade.notes}</div>
              </div>
            )}

            {trade.imageUrl && (
              <div className="mb-4">
                <div className="text-xs font-medium text-muted-foreground mb-2">Screenshot</div>
                <img
                  src={trade.imageUrl}
                  alt="Trade screenshot"
                  className="w-full rounded-xl border border-border"
                />
              </div>
            )}
          </>
        )}

        <button
          onClick={() => onDelete(trade.id)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-medium transition-all duration-200 hover:bg-destructive/20 mt-4"
        >
          <Trash2 className="w-4 h-4" />
          Delete Trade
        </button>
      </GlassCard>
    </div>
  )
}
