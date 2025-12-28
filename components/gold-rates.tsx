"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, TrendingUp, Calendar } from "lucide-react"
import { getGoldRates, saveGoldRates, getCurrentGoldRate, type GoldRate } from "@/lib/storage"

export function GoldRates() {
  const [rates, setRates] = useState<GoldRate[]>([])
  const [currentRate, setCurrentRate] = useState<GoldRate | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    purity22K: "",
    purity24K: "",
    purity18K: "",
    purity20K: "",
    notes: "",
  })

  useEffect(() => {
    const allRates = getGoldRates()
    setRates(allRates)
    setCurrentRate(getCurrentGoldRate())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newRate: GoldRate = {
      id: Date.now().toString(),
      date: formData.date,
      purity22K: Number.parseFloat(formData.purity22K),
      purity24K: Number.parseFloat(formData.purity24K),
      purity18K: Number.parseFloat(formData.purity18K),
      purity20K: formData.purity20K ? Number.parseFloat(formData.purity20K) : undefined,
      notes: formData.notes || undefined,
      createdAt: new Date().toISOString(),
    }

    // Check if rate for this date already exists
    const existingRateIndex = rates.findIndex(r => r.date === formData.date)
    let updatedRates: GoldRate[]
    
    if (existingRateIndex >= 0) {
      // Update existing rate
      updatedRates = [...rates]
      updatedRates[existingRateIndex] = newRate
    } else {
      // Add new rate
      updatedRates = [...rates, newRate]
    }

    saveGoldRates(updatedRates)
    setRates(updatedRates)
    setCurrentRate(getCurrentGoldRate())
    setFormData({
      date: new Date().toISOString().split("T")[0],
      purity22K: "",
      purity24K: "",
      purity18K: "",
      purity20K: "",
      notes: "",
    })
    setShowForm(false)
  }

  const formatCurrency = (amount: number) => {
    return `NPR ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const sortedRates = [...rates].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Gold Rates</h2>
          <p className="text-muted-foreground">Manage daily gold rates</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Update Rate
        </Button>
      </div>

      {currentRate && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Current Gold Rates</h3>
            <span className="text-sm text-muted-foreground ml-auto">
              {new Date(currentRate.date).toLocaleDateString("en-NP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">24K Gold</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(currentRate.purity24K)}</p>
              <p className="text-xs text-muted-foreground mt-1">per gram</p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">22K Gold</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(currentRate.purity22K)}</p>
              <p className="text-xs text-muted-foreground mt-1">per gram</p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">18K Gold</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(currentRate.purity18K)}</p>
              <p className="text-xs text-muted-foreground mt-1">per gram</p>
            </div>
          </div>
        </Card>
      )}

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Update Gold Rate</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date *</label>
              <Input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">24K Gold (NPR/gram) *</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={formData.purity24K}
                  onChange={(e) => setFormData({ ...formData, purity24K: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">22K Gold (NPR/gram) *</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={formData.purity22K}
                  onChange={(e) => setFormData({ ...formData, purity22K: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">18K Gold (NPR/gram) *</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={formData.purity18K}
                  onChange={(e) => setFormData({ ...formData, purity18K: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">20K Gold (NPR/gram)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.purity20K}
                  onChange={(e) => setFormData({ ...formData, purity20K: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save Rate</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Rate History</h3>
        </div>
        <div className="space-y-3">
          {sortedRates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No gold rates recorded yet</p>
          ) : (
            sortedRates.map((rate) => (
              <div key={rate.id} className="p-4 bg-secondary rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {new Date(rate.date).toLocaleDateString("en-NP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {rate.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{rate.notes}</p>
                    )}
                  </div>
                  {rate.id === currentRate?.id && (
                    <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded">
                      Current
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">24K</p>
                    <p className="font-medium text-foreground">{formatCurrency(rate.purity24K)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">22K</p>
                    <p className="font-medium text-foreground">{formatCurrency(rate.purity22K)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">18K</p>
                    <p className="font-medium text-foreground">{formatCurrency(rate.purity18K)}</p>
                  </div>
                  {rate.purity20K && (
                    <div>
                      <p className="text-muted-foreground">20K</p>
                      <p className="font-medium text-foreground">{formatCurrency(rate.purity20K)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

