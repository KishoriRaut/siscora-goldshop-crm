"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, TrendingUp, Calendar, Edit, Trash2 } from "lucide-react"
import { 
  getGoldRates, 
  saveGoldRates, 
  getCurrentGoldRate, 
  getSilverRates,
  saveSilverRates,
  getCurrentSilverRate,
  type GoldRate,
  type SilverRate 
} from "@/lib/storage"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function GoldRates() {
  const [rateType, setRateType] = useState<"gold" | "silver">("gold")
  const [goldRates, setGoldRates] = useState<GoldRate[]>([])
  const [silverRates, setSilverRates] = useState<SilverRate[]>([])
  const [currentGoldRate, setCurrentGoldRate] = useState<GoldRate | null>(null)
  const [currentSilverRate, setCurrentSilverRate] = useState<SilverRate | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingGoldRate, setEditingGoldRate] = useState<GoldRate | null>(null)
  const [editingSilverRate, setEditingSilverRate] = useState<SilverRate | null>(null)
  const [deleteGoldRate, setDeleteGoldRate] = useState<GoldRate | null>(null)
  const [deleteSilverRate, setDeleteSilverRate] = useState<SilverRate | null>(null)
  const [goldFormData, setGoldFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    purity22K: "",
    purity24K: "",
    purity18K: "",
    purity20K: "",
    notes: "",
  })
  const [silverFormData, setSilverFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    purity925: "",
    purity999: "",
    notes: "",
  })

  useEffect(() => {
    const allGoldRates = getGoldRates()
    const allSilverRates = getSilverRates()
    setGoldRates(allGoldRates)
    setSilverRates(allSilverRates)
    setCurrentGoldRate(getCurrentGoldRate())
    setCurrentSilverRate(getCurrentSilverRate())
  }, [])

  const handleGoldSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const rateData = {
      date: goldFormData.date,
      purity22K: Number.parseFloat(goldFormData.purity22K),
      purity24K: Number.parseFloat(goldFormData.purity24K),
      purity18K: Number.parseFloat(goldFormData.purity18K),
      purity20K: goldFormData.purity20K ? Number.parseFloat(goldFormData.purity20K) : undefined,
      notes: goldFormData.notes || undefined,
    }

    let updatedRates: GoldRate[]

    if (editingGoldRate) {
      updatedRates = goldRates.map((rate) =>
        rate.id === editingGoldRate.id
          ? { ...rate, ...rateData }
          : rate
      )
      setEditingGoldRate(null)
    } else {
      const existingRateIndex = goldRates.findIndex((r) => r.date === goldFormData.date)
      
      if (existingRateIndex >= 0) {
        updatedRates = [...goldRates]
        updatedRates[existingRateIndex] = {
          ...updatedRates[existingRateIndex],
          ...rateData,
        }
      } else {
        const newRate: GoldRate = {
          id: Date.now().toString(),
          ...rateData,
          createdAt: new Date().toISOString(),
        }
        updatedRates = [...goldRates, newRate]
      }
    }

    saveGoldRates(updatedRates)
    setGoldRates(updatedRates)
    setCurrentGoldRate(getCurrentGoldRate())
    setGoldFormData({
      date: new Date().toISOString().split("T")[0],
      purity22K: "",
      purity24K: "",
      purity18K: "",
      purity20K: "",
      notes: "",
    })
    setShowForm(false)
  }

  const handleSilverSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const rateData = {
      date: silverFormData.date,
      purity925: Number.parseFloat(silverFormData.purity925),
      purity999: Number.parseFloat(silverFormData.purity999),
      notes: silverFormData.notes || undefined,
    }

    let updatedRates: SilverRate[]

    if (editingSilverRate) {
      updatedRates = silverRates.map((rate) =>
        rate.id === editingSilverRate.id
          ? { ...rate, ...rateData }
          : rate
      )
      setEditingSilverRate(null)
    } else {
      const existingRateIndex = silverRates.findIndex((r) => r.date === silverFormData.date)
      
      if (existingRateIndex >= 0) {
        updatedRates = [...silverRates]
        updatedRates[existingRateIndex] = {
          ...updatedRates[existingRateIndex],
          ...rateData,
        }
      } else {
        const newRate: SilverRate = {
          id: Date.now().toString(),
          ...rateData,
          createdAt: new Date().toISOString(),
        }
        updatedRates = [...silverRates, newRate]
      }
    }

    saveSilverRates(updatedRates)
    setSilverRates(updatedRates)
    setCurrentSilverRate(getCurrentSilverRate())
    setSilverFormData({
      date: new Date().toISOString().split("T")[0],
      purity925: "",
      purity999: "",
      notes: "",
    })
    setShowForm(false)
  }

  const handleEditGold = (rate: GoldRate) => {
    setEditingGoldRate(rate)
    setGoldFormData({
      date: rate.date,
      purity22K: rate.purity22K.toString(),
      purity24K: rate.purity24K.toString(),
      purity18K: rate.purity18K.toString(),
      purity20K: rate.purity20K?.toString() || "",
      notes: rate.notes || "",
    })
    setShowForm(true)
  }

  const handleEditSilver = (rate: SilverRate) => {
    setEditingSilverRate(rate)
    setSilverFormData({
      date: rate.date,
      purity925: rate.purity925.toString(),
      purity999: rate.purity999.toString(),
      notes: rate.notes || "",
    })
    setShowForm(true)
  }

  const handleDeleteGold = () => {
    if (!deleteGoldRate) return

    if (currentGoldRate && currentGoldRate.id === deleteGoldRate.id) {
      alert("Cannot delete the current gold rate. Please set a different rate as current first.")
      setDeleteGoldRate(null)
      return
    }

    const updatedRates = goldRates.filter((rate) => rate.id !== deleteGoldRate.id)
    saveGoldRates(updatedRates)
    setGoldRates(updatedRates)
    setDeleteGoldRate(null)
  }

  const handleDeleteSilver = () => {
    if (!deleteSilverRate) return

    if (currentSilverRate && currentSilverRate.id === deleteSilverRate.id) {
      alert("Cannot delete the current silver rate. Please set a different rate as current first.")
      setDeleteSilverRate(null)
      return
    }

    const updatedRates = silverRates.filter((rate) => rate.id !== deleteSilverRate.id)
    saveSilverRates(updatedRates)
    setSilverRates(updatedRates)
    setDeleteSilverRate(null)
  }

  const handleCancelEdit = () => {
    setEditingGoldRate(null)
    setEditingSilverRate(null)
    setGoldFormData({
      date: new Date().toISOString().split("T")[0],
      purity22K: "",
      purity24K: "",
      purity18K: "",
      purity20K: "",
      notes: "",
    })
    setSilverFormData({
      date: new Date().toISOString().split("T")[0],
      purity925: "",
      purity999: "",
      notes: "",
    })
    setShowForm(false)
  }

  const formatCurrency = (amount: number) => {
    return `NPR ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const sortedGoldRates = [...goldRates].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const sortedSilverRates = [...silverRates].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Gold & Silver Rates</h2>
          <p className="text-muted-foreground">Manage daily gold and silver rates</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setRateType("gold")
              setShowForm(true)
              setEditingGoldRate(null)
              setEditingSilverRate(null)
            }} 
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Gold Rate
          </Button>
          <Button 
            onClick={() => {
              setRateType("silver")
              setShowForm(true)
              setEditingGoldRate(null)
              setEditingSilverRate(null)
            }} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            Add Silver Rate
          </Button>
        </div>
      </div>


      {/* Current Rates Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentGoldRate && (
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Current Gold Rates</h3>
              <span className="text-sm text-muted-foreground ml-auto">
                {new Date(currentGoldRate.date).toLocaleDateString("en-NP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">24K Gold</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(currentGoldRate.purity24K)}</p>
                <p className="text-xs text-muted-foreground mt-1">per gram</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">22K Gold</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(currentGoldRate.purity22K)}</p>
                <p className="text-xs text-muted-foreground mt-1">per gram</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">18K Gold</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(currentGoldRate.purity18K)}</p>
                <p className="text-xs text-muted-foreground mt-1">per gram</p>
              </div>
            </div>
          </Card>
        )}

        {currentSilverRate && (
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Current Silver Rates</h3>
              <span className="text-sm text-muted-foreground ml-auto">
                {new Date(currentSilverRate.date).toLocaleDateString("en-NP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">999 Silver (Pure)</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(currentSilverRate.purity999)}</p>
                <p className="text-xs text-muted-foreground mt-1">per gram</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">925 Silver (Sterling)</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(currentSilverRate.purity925)}</p>
                <p className="text-xs text-muted-foreground mt-1">per gram</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {rateType === "gold" 
              ? (editingGoldRate ? "Edit Gold Rate" : "Add Gold Rate")
              : (editingSilverRate ? "Edit Silver Rate" : "Add Silver Rate")
            }
          </h3>
          {rateType === "gold" ? (
            <form onSubmit={handleGoldSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date *</label>
                <Input
                  required
                  type="date"
                  value={goldFormData.date}
                  onChange={(e) => setGoldFormData({ ...goldFormData, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">24K Gold (NPR/gram) *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={goldFormData.purity24K}
                    onChange={(e) => setGoldFormData({ ...goldFormData, purity24K: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">22K Gold (NPR/gram) *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={goldFormData.purity22K}
                    onChange={(e) => setGoldFormData({ ...goldFormData, purity22K: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">18K Gold (NPR/gram) *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={goldFormData.purity18K}
                    onChange={(e) => setGoldFormData({ ...goldFormData, purity18K: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">20K Gold (NPR/gram)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={goldFormData.purity20K}
                    onChange={(e) => setGoldFormData({ ...goldFormData, purity20K: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                <Input
                  value={goldFormData.notes}
                  onChange={(e) => setGoldFormData({ ...goldFormData, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingGoldRate ? "Update Rate" : "Save Rate"}</Button>
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSilverSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date *</label>
                <Input
                  required
                  type="date"
                  value={silverFormData.date}
                  onChange={(e) => setSilverFormData({ ...silverFormData, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">999 Silver (NPR/gram) *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={silverFormData.purity999}
                    onChange={(e) => setSilverFormData({ ...silverFormData, purity999: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">925 Silver (NPR/gram) *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={silverFormData.purity925}
                    onChange={(e) => setSilverFormData({ ...silverFormData, purity925: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                <Input
                  value={silverFormData.notes}
                  onChange={(e) => setSilverFormData({ ...silverFormData, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingSilverRate ? "Update Rate" : "Save Rate"}</Button>
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      {/* Rate History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Gold Rate History</h3>
          </div>
          <div className="space-y-3">
            {sortedGoldRates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No gold rates recorded yet</p>
            ) : (
              sortedGoldRates.map((rate) => (
                <div key={rate.id} className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
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
                    <div className="flex items-center gap-2 ml-4">
                      {rate.id === currentGoldRate?.id && (
                        <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded">
                          Current
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRateType("gold")
                          handleEditGold(rate)
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteGoldRate(rate)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Silver Rate History</h3>
          </div>
          <div className="space-y-3">
            {sortedSilverRates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No silver rates recorded yet</p>
            ) : (
              sortedSilverRates.map((rate) => (
                <div key={rate.id} className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
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
                    <div className="flex items-center gap-2 ml-4">
                      {rate.id === currentSilverRate?.id && (
                        <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded">
                          Current
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRateType("silver")
                          handleEditSilver(rate)
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteSilverRate(rate)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">999 (Pure)</p>
                      <p className="font-medium text-foreground">{formatCurrency(rate.purity999)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">925 (Sterling)</p>
                      <p className="font-medium text-foreground">{formatCurrency(rate.purity925)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialogs */}
      <AlertDialog open={!!deleteGoldRate} onOpenChange={() => setDeleteGoldRate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gold Rate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the gold rate for{" "}
              <strong>
                {deleteGoldRate &&
                  new Date(deleteGoldRate.date).toLocaleDateString("en-NP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </strong>
              ? This action cannot be undone.
              {deleteGoldRate && currentGoldRate && deleteGoldRate.id === currentGoldRate.id && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: This is the current gold rate and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGold}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteGoldRate && currentGoldRate ? deleteGoldRate.id === currentGoldRate.id : false}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteSilverRate} onOpenChange={() => setDeleteSilverRate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Silver Rate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the silver rate for{" "}
              <strong>
                {deleteSilverRate &&
                  new Date(deleteSilverRate.date).toLocaleDateString("en-NP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </strong>
              ? This action cannot be undone.
              {deleteSilverRate && currentSilverRate && deleteSilverRate.id === currentSilverRate.id && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: This is the current silver rate and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSilver}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteSilverRate && currentSilverRate ? deleteSilverRate.id === currentSilverRate.id : false}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
