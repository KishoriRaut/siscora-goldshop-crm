"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, ShoppingCart, TrendingDown, Filter, X, Edit, Trash2 } from "lucide-react"
import {
  getPurchases,
  savePurchases,
  getCustomers,
  saveCustomers,
  getInventory,
  saveInventory,
  getNextPurchaseNumber,
  getCurrentGoldRate,
  getCurrentSilverRate,
  type Purchase,
  type InventoryItem,
  type Customer,
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

export function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [currentGoldRate, setCurrentGoldRate] = useState<ReturnType<typeof getCurrentGoldRate>>(null)
  const [currentSilverRate, setCurrentSilverRate] = useState<ReturnType<typeof getCurrentSilverRate>>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)
  const [deletePurchase, setDeletePurchase] = useState<Purchase | null>(null)
  const [addToInventory, setAddToInventory] = useState(true) // Option to add purchased gold to inventory
  const [showAddSeller, setShowAddSeller] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    sellerId: "",
    purity: "",
    dateFrom: "",
    dateTo: "",
    searchTerm: "",
  })
  const [newSellerData, setNewSellerData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  })
  const [formData, setFormData] = useState({
    customerId: "",
    itemName: "",
    type: "",
    metalType: "gold" as "gold" | "silver",
    weight: "",
    purity: "22K",
    pricePerGram: "",
    quantity: "1",
    notes: "",
  })

  useEffect(() => {
    setPurchases(getPurchases())
    setCustomers(getCustomers())
    setInventory(getInventory())
    setCurrentGoldRate(getCurrentGoldRate())
    setCurrentSilverRate(getCurrentSilverRate())
  }, [])

  const handleAddSeller = (e: React.FormEvent) => {
    e.preventDefault()
    const newSeller: Customer = {
      id: Date.now().toString(),
      name: newSellerData.name,
      phone: newSellerData.phone,
      email: newSellerData.email,
      address: newSellerData.address,
      createdAt: new Date().toISOString(),
    }
    const updatedCustomers = [...customers, newSeller]
    saveCustomers(updatedCustomers)
    setCustomers(updatedCustomers)
    setFormData({ ...formData, customerId: newSeller.id })
    setNewSellerData({ name: "", phone: "", email: "", address: "" })
    setShowAddSeller(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const seller = customers.find((c) => c.id === formData.customerId)

    if (!seller) return

    const weight = Number.parseFloat(formData.weight)
    const pricePerGram = Number.parseFloat(formData.pricePerGram)
    const quantity = Number.parseInt(formData.quantity)
    const totalWeight = weight * quantity
    const totalAmount = totalWeight * pricePerGram

    if (editingPurchase) {
      // Handle edit - need to check if inventory was added and adjust
      // For simplicity, we'll remove old inventory item if it exists and add new one
      // In production, you'd want to track which inventory items came from which purchases
      
      const updatedPurchase: Purchase = {
        ...editingPurchase,
        customerId: formData.customerId,
        customerName: seller.name,
        itemName: formData.itemName,
        type: formData.type,
        metalType: formData.metalType,
        weight,
        purity: formData.purity,
        pricePerGram,
        totalWeight,
        quantity,
        totalAmount,
        notes: formData.notes || undefined,
      }

      // Update inventory if needed (simplified - in production, track purchase-inventory relationship)
      if (addToInventory) {
        // Remove old inventory item if it matches the purchase
        const filteredInventory = inventory.filter((item) => {
          // Simple matching - in production, track purchase ID in inventory
          return !(item.name === editingPurchase.itemName && 
                   item.type === editingPurchase.type &&
                   Math.abs(item.pricePerGram - editingPurchase.pricePerGram) < 0.01)
        })

        // Add new inventory item
        const newInventoryItem: InventoryItem = {
          id: Date.now().toString(),
          name: formData.itemName,
          type: formData.type,
          metalType: formData.metalType,
          weight,
          purity: formData.purity,
          pricePerGram: pricePerGram,
          quantity,
          totalValue: totalAmount,
          createdAt: new Date().toISOString(),
        }
        const updatedInventory = [...filteredInventory, newInventoryItem]
        saveInventory(updatedInventory)
        setInventory(updatedInventory)
      }

      const updatedPurchases = purchases.map((p) => (p.id === editingPurchase.id ? updatedPurchase : p))
      savePurchases(updatedPurchases)
      setPurchases(updatedPurchases)
      setEditingPurchase(null)
    } else {
      // Create new purchase
      const newPurchase: Purchase = {
        id: Date.now().toString(),
        purchaseNumber: getNextPurchaseNumber(),
        customerId: formData.customerId,
        customerName: seller.name,
        itemName: formData.itemName,
        type: formData.type,
        metalType: formData.metalType,
        weight,
        purity: formData.purity,
        pricePerGram,
        totalWeight,
        quantity,
        totalAmount,
        notes: formData.notes || undefined,
        createdAt: new Date().toISOString(),
      }

      // Optionally add purchased item to inventory
      if (addToInventory) {
        const newInventoryItem: InventoryItem = {
          id: Date.now().toString(),
          name: formData.itemName,
          type: formData.type,
          metalType: formData.metalType,
          weight,
          purity: formData.purity,
          pricePerGram: pricePerGram,
          quantity,
          totalValue: totalAmount,
          createdAt: new Date().toISOString(),
        }
        const updatedInventory = [...inventory, newInventoryItem]
        saveInventory(updatedInventory)
        setInventory(updatedInventory)
      }

      const updatedPurchases = [...purchases, newPurchase]
      savePurchases(updatedPurchases)
      setPurchases(updatedPurchases)
    }

    setFormData({
      customerId: "",
      itemName: "",
      type: "",
      weight: "",
      purity: "22K",
      pricePerGram: "",
      quantity: "1",
      notes: "",
    })
    setShowForm(false)
  }

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase)
    setFormData({
      customerId: purchase.customerId,
      itemName: purchase.itemName,
      type: purchase.type,
      metalType: purchase.metalType || "gold",
      weight: purchase.weight.toString(),
      purity: purchase.purity,
      pricePerGram: purchase.pricePerGram.toString(),
      quantity: purchase.quantity.toString(),
      notes: purchase.notes || "",
    })
    setShowForm(true)
  }

  const handleDelete = () => {
    if (!deletePurchase) return

    // Remove from inventory if it was added
    // Simplified matching - in production, track purchase-inventory relationship
    const updatedInventory = inventory.filter((item) => {
      return !(item.name === deletePurchase.itemName && 
               item.type === deletePurchase.type &&
               Math.abs(item.pricePerGram - deletePurchase.pricePerGram) < 0.01 &&
               item.quantity === deletePurchase.quantity)
    })
    saveInventory(updatedInventory)
    setInventory(updatedInventory)

    // Remove purchase
    const updatedPurchases = purchases.filter((p) => p.id !== deletePurchase.id)
    savePurchases(updatedPurchases)
    setPurchases(updatedPurchases)
    setDeletePurchase(null)
  }

  const handleCancelEdit = () => {
    setEditingPurchase(null)
    setFormData({
      customerId: "",
      itemName: "",
      type: "",
      metalType: "gold",
      weight: "",
      purity: "22K",
      pricePerGram: "",
      quantity: "1",
      notes: "",
    })
    setShowForm(false)
  }

  const formatCurrency = (amount: number) => {
    return `NPR ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const totalPurchaseAmount = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0)
  const totalWeightPurchased = purchases.reduce((sum, purchase) => sum + purchase.totalWeight, 0)

  // Calculate estimated current value based on current rates
  const getEstimatedCurrentValue = (purchase: Purchase) => {
    if (purchase.metalType === "gold") {
      if (!currentGoldRate) return 0
      const purityMap: Record<string, number> = {
        "24K": currentGoldRate.purity24K,
        "22K": currentGoldRate.purity22K,
        "18K": currentGoldRate.purity18K,
        "20K": currentGoldRate.purity20K || currentGoldRate.purity22K,
      }
      const currentRate = purityMap[purchase.purity] || currentGoldRate.purity22K
      return purchase.totalWeight * currentRate
    } else {
      // Silver
      if (!currentSilverRate) return 0
      const currentRate = purchase.purity === "999" 
        ? currentSilverRate.purity999 
        : currentSilverRate.purity925
      return purchase.totalWeight * currentRate
    }
  }

  const sortedPurchases = [...purchases].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Gold & Silver Purchases</h2>
          <p className="text-muted-foreground">Buy gold and silver from sellers</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Purchase
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Purchases</p>
              <p className="text-2xl font-semibold text-foreground mt-2">{purchases.length}</p>
            </div>
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Purchase Amount</p>
              <p className="text-xl font-semibold text-foreground mt-2">{formatCurrency(totalPurchaseAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Weight Purchased</p>
              <p className="text-2xl font-semibold text-foreground mt-2">{totalWeightPurchased.toFixed(2)}g</p>
            </div>
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">New Gold Purchase</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">
                    Seller *
                  </label>
                  {!showAddSeller && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddSeller(true)}
                      className="text-xs"
                    >
                      + Add New Seller
                    </Button>
                  )}
                </div>
                {showAddSeller ? (
                  <div className="space-y-3 p-4 bg-secondary rounded-lg border border-border">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Seller Name *</label>
                      <Input
                        required
                        value={newSellerData.name}
                        onChange={(e) => setNewSellerData({ ...newSellerData, name: e.target.value })}
                        placeholder="Seller name"
                        className="h-9"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Phone *</label>
                      <Input
                        required
                        value={newSellerData.phone}
                        onChange={(e) => setNewSellerData({ ...newSellerData, phone: e.target.value })}
                        placeholder="Phone number"
                        className="h-9"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Email</label>
                        <Input
                          type="email"
                          value={newSellerData.email}
                          onChange={(e) => setNewSellerData({ ...newSellerData, email: e.target.value })}
                          placeholder="Email (optional)"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Address</label>
                        <Input
                          value={newSellerData.address}
                          onChange={(e) => setNewSellerData({ ...newSellerData, address: e.target.value })}
                          placeholder="Address (optional)"
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={handleAddSeller} className="flex-1">
                        Add Seller
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddSeller(false)
                          setNewSellerData({ name: "", phone: "", email: "", address: "" })
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <select
                      required
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                    >
                      <option value="">Select seller</option>
                      {customers.map((seller) => (
                        <option key={seller.id} value={seller.id}>
                          {seller.name} {seller.phone && `(${seller.phone})`}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select the seller you are buying {formData.metalType === "gold" ? "gold" : "silver"} from
                    </p>
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Item Name *</label>
                <Input
                  required
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="e.g., Gold Ring, Necklace"
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
                <label className="block text-sm font-medium text-foreground mb-2">Metal Type *</label>
                <select
                  required
                  value={formData.metalType}
                  onChange={(e) => {
                    const metalType = e.target.value as "gold" | "silver"
                    setFormData({ 
                      ...formData, 
                      metalType,
                      purity: metalType === "gold" ? "22K" : "925"
                    })
                  }}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Purity *</label>
                <select
                  required
                  value={formData.purity}
                  onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                >
                  {formData.metalType === "gold" ? (
                    <>
                      <option value="24K">24K</option>
                      <option value="22K">22K</option>
                      <option value="20K">20K</option>
                      <option value="18K">18K</option>
                    </>
                  ) : (
                    <>
                      <option value="999">999 (Pure Silver)</option>
                      <option value="925">925 (Sterling Silver)</option>
                    </>
                  )}
                </select>
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
                {formData.metalType === "gold" && currentGoldRate && formData.purity && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Current market rate: {formatCurrency(
                      formData.purity === "24K"
                        ? currentGoldRate.purity24K
                        : formData.purity === "22K"
                          ? currentGoldRate.purity22K
                          : formData.purity === "20K"
                            ? (currentGoldRate.purity20K || currentGoldRate.purity22K)
                            : currentGoldRate.purity18K
                    )}/gram
                  </p>
                )}
                {formData.metalType === "silver" && currentSilverRate && formData.purity && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Current market rate: {formatCurrency(
                      formData.purity === "999"
                        ? currentSilverRate.purity999
                        : currentSilverRate.purity925
                    )}/gram
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Purchase Price per Gram (NPR) *</label>
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 p-4 bg-secondary rounded-lg">
              <input
                type="checkbox"
                id="addToInventory"
                checked={addToInventory}
                onChange={(e) => setAddToInventory(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="addToInventory" className="text-sm text-foreground cursor-pointer">
                Add purchased {formData.metalType === "gold" ? "gold" : "silver"} to inventory automatically
              </label>
            </div>
            {formData.weight && formData.pricePerGram && formData.quantity && (
              <div className="p-4 bg-secondary rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Purchase Amount:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(
                      Number.parseFloat(formData.weight || "0") *
                        Number.parseFloat(formData.pricePerGram || "0") *
                        Number.parseInt(formData.quantity || "1")
                    )}
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit">{editingPurchase ? "Update Purchase" : "Record Purchase"}</Button>
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Purchase History</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Seller</label>
                <select
                  value={filters.sellerId}
                  onChange={(e) => setFilters({ ...filters, sellerId: e.target.value })}
                  className="w-full h-9 px-2 text-sm rounded-md border border-input bg-background text-foreground"
                >
                  <option value="">All Sellers</option>
                  {customers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Purity</label>
                <select
                  value={filters.purity}
                  onChange={(e) => setFilters({ ...filters, purity: e.target.value })}
                  className="w-full h-9 px-2 text-sm rounded-md border border-input bg-background text-foreground"
                >
                  <option value="">All Purity</option>
                  <option value="24K">24K</option>
                  <option value="22K">22K</option>
                  <option value="20K">20K</option>
                  <option value="18K">18K</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">From Date</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">To Date</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Search</label>
              <Input
                placeholder="Search by seller, item, or purchase number..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({ sellerId: "", purity: "", dateFrom: "", dateTo: "", searchTerm: "" })
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
            if (sortedPurchases.length === 0) {
              return <p className="text-center text-muted-foreground py-8">No purchases recorded yet</p>
            }

            let filteredPurchases = sortedPurchases

            if (filters.sellerId) {
              filteredPurchases = filteredPurchases.filter((purchase) => purchase.customerId === filters.sellerId)
            }
            if (filters.purity) {
              filteredPurchases = filteredPurchases.filter((purchase) => purchase.purity === filters.purity)
            }
            if (filters.dateFrom) {
              filteredPurchases = filteredPurchases.filter(
                (purchase) => new Date(purchase.createdAt) >= new Date(filters.dateFrom)
              )
            }
            if (filters.dateTo) {
              filteredPurchases = filteredPurchases.filter(
                (purchase) => new Date(purchase.createdAt) <= new Date(filters.dateTo + "T23:59:59")
              )
            }
            if (filters.searchTerm) {
              const search = filters.searchTerm.toLowerCase()
              filteredPurchases = filteredPurchases.filter(
                (purchase) =>
                  purchase.customerName.toLowerCase().includes(search) ||
                  purchase.itemName.toLowerCase().includes(search) ||
                  purchase.purchaseNumber?.toLowerCase().includes(search)
              )
            }

            return filteredPurchases.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No purchases found</p>
            ) : (
              filteredPurchases.map((purchase) => {
                const estimatedValue = getEstimatedCurrentValue(purchase)
                const profit = estimatedValue - purchase.totalAmount
                return (
                  <div key={purchase.id} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-semibold text-foreground">{purchase.customerName}</p>
                            <p className="text-xs text-muted-foreground">Seller</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            #{purchase.purchaseNumber}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{purchase.itemName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{formatCurrency(purchase.totalAmount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(purchase.createdAt).toLocaleDateString("en-NP")}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm pt-3 border-t border-border">
                      <div>
                        <p className="text-muted-foreground">Weight</p>
                        <p className="font-medium text-foreground">{purchase.totalWeight}g</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Metal / Purity</p>
                        <p className="font-medium text-foreground">
                          {purchase.metalType === "silver" ? "Silver" : "Gold"} - {purchase.purity}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price/Gram</p>
                        <p className="font-medium text-foreground">{formatCurrency(purchase.pricePerGram)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quantity</p>
                        <p className="font-medium text-foreground">{purchase.quantity}</p>
                      </div>
                    </div>
                    {currentGoldRate && estimatedValue > 0 && (
                      <div className="pt-3 border-t border-border mt-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Estimated Current Value:</span>
                          <span className="font-medium text-foreground">{formatCurrency(estimatedValue)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-1">
                          <span className="text-muted-foreground">Potential Profit:</span>
                          <span
                            className={`font-semibold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {profit >= 0 ? "+" : ""}
                            {formatCurrency(profit)}
                          </span>
                        </div>
                      </div>
                    )}
                    {purchase.notes && (
                      <div className="pt-3 border-t border-border mt-3">
                        <p className="text-muted-foreground text-xs">Notes:</p>
                        <p className="text-sm text-foreground">{purchase.notes}</p>
                      </div>
                    )}
                    <div className="pt-3 border-t border-border mt-3 flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(purchase)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletePurchase(purchase)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )
          })()}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePurchase} onOpenChange={() => setDeletePurchase(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete purchase <strong>{deletePurchase?.purchaseNumber}</strong> from{" "}
              <strong>{deletePurchase?.customerName}</strong>? This will remove the item from inventory if it was added. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

