"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Weight, Filter, X } from "lucide-react"
import { getInventory, saveInventory, type InventoryItem } from "@/lib/storage"

export function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: "",
    purity: "",
    searchTerm: "",
  })
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    weight: "",
    purity: "",
    pricePerGram: "",
    quantity: "1",
  })

  useEffect(() => {
    setInventory(getInventory())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      weight: Number.parseFloat(formData.weight),
      purity: formData.purity,
      pricePerGram: Number.parseFloat(formData.pricePerGram),
      quantity: Number.parseInt(formData.quantity),
      totalValue:
        Number.parseFloat(formData.weight) *
        Number.parseFloat(formData.pricePerGram) *
        Number.parseInt(formData.quantity),
      createdAt: new Date().toISOString(),
    }
    const updatedInventory = [...inventory, newItem]
    saveInventory(updatedInventory)
    setInventory(updatedInventory)
    setFormData({ name: "", type: "", weight: "", purity: "", pricePerGram: "", quantity: "1" })
    setShowForm(false)
  }

  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0)

  const formatCurrency = (amount: number) => {
    return `NPR ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Inventory</h2>
          <p className="text-muted-foreground">Manage your gold items</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Inventory Value</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{formatCurrency(totalValue)}</p>
          </div>
          <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
            <Weight className="w-6 h-6 text-accent-foreground" />
          </div>
        </div>
      </Card>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">New Inventory Item</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Item Name *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Gold Ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type *</label>
                <Input
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g., Ring, Necklace, Bangle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Weight (grams) *</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Purity *</label>
                <Input
                  required
                  value={formData.purity}
                  onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                  placeholder="e.g., 22K, 24K, 18K"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Price per Gram (NPR) *</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={formData.pricePerGram}
                  onChange={(e) => setFormData({ ...formData, pricePerGram: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Quantity *</label>
                <Input
                  required
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save Item</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Inventory Items</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mb-4 p-4 bg-secondary rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Type</label>
                <Input
                  placeholder="Filter by type (e.g., Ring, Necklace)"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Purity</label>
                <Input
                  placeholder="Filter by purity (e.g., 22K, 24K)"
                  value={filters.purity}
                  onChange={(e) => setFilters({ ...filters, purity: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Search</label>
                <Input
                  placeholder="Search by name..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({ type: "", purity: "", searchTerm: "" })
                }}
                className="flex items-center gap-2"
              >
                <X className="w-3 h-3" />
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {(() => {
            let filteredInventory = inventory

            if (filters.type) {
              filteredInventory = filteredInventory.filter((item) =>
                item.type.toLowerCase().includes(filters.type.toLowerCase())
              )
            }
            if (filters.purity) {
              filteredInventory = filteredInventory.filter((item) =>
                item.purity.toLowerCase().includes(filters.purity.toLowerCase())
              )
            }
            if (filters.searchTerm) {
              const search = filters.searchTerm.toLowerCase()
              filteredInventory = filteredInventory.filter((item) =>
                item.name.toLowerCase().includes(search)
              )
            }

            return filteredInventory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No inventory items found</p>
            ) : (
              filteredInventory.map((item) => (
              <div key={item.id} className="p-4 bg-secondary rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.type}</p>
                  </div>
                  <p className="font-semibold text-primary">{formatCurrency(item.totalValue)}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Weight</p>
                    <p className="font-medium text-foreground">{item.weight}g</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Purity</p>
                    <p className="font-medium text-foreground">{item.purity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price/g</p>
                    <p className="font-medium text-foreground">{formatCurrency(item.pricePerGram)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium text-foreground">{item.quantity}</p>
                  </div>
                </div>
              </div>
              ))
            )
          })()}
        </div>
      </Card>
    </div>
  )
}
