"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Weight, Filter, X, Edit, Trash2, QrCode, Printer, ClipboardCheck, Eye, Loader2 } from "lucide-react"
import { getInventory, saveInventory, type InventoryItem } from "@/lib/storage"
import { getSales } from "@/lib/storage"
import { generateQRCodeData, generateQRCodeImage, printQRCodeLabel } from "@/lib/qrcode"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/pagination"
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

interface InventoryProps {
  onNavigate?: (tab: string) => void
}

export function Inventory({ onNavigate }: InventoryProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [filters, setFilters] = useState({
    type: "",
    purity: "",
    searchTerm: "",
  })
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    metalType: "gold" as "gold" | "silver",
    weight: "",
    purity: "",
    pricePerGram: "",
    quantity: "1",
  })
  const [viewingQRCode, setViewingQRCode] = useState<{
    item: InventoryItem | null
    image: string | null
  }>({ item: null, image: null })
  const [generatingQRCode, setGeneratingQRCode] = useState<string | null>(null) // Track which item is generating QR code

  useEffect(() => {
    setInventory(getInventory())
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.type, filters.purity, filters.searchTerm, filters.metalType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const itemData = {
      name: formData.name,
      type: formData.type,
      metalType: formData.metalType,
      weight: Number.parseFloat(formData.weight),
      purity: formData.purity,
      pricePerGram: Number.parseFloat(formData.pricePerGram),
      quantity: Number.parseInt(formData.quantity),
      totalValue:
        Number.parseFloat(formData.weight) *
        Number.parseFloat(formData.pricePerGram) *
        Number.parseInt(formData.quantity),
    }

    if (editingItem) {
      // Update existing item
      const updatedItem = { ...editingItem, ...itemData }
      // Generate QR code data
      updatedItem.qrCode = generateQRCodeData(updatedItem)
      const updatedInventory = inventory.map((item) =>
        item.id === editingItem.id ? updatedItem : item
      )
      saveInventory(updatedInventory)
      setInventory(updatedInventory)
      setEditingItem(null)
    } else {
      // Create new item
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        ...itemData,
        createdAt: new Date().toISOString(),
      }
      // Generate QR code data
      newItem.qrCode = generateQRCodeData(newItem)
      const updatedInventory = [...inventory, newItem]
      saveInventory(updatedInventory)
      setInventory(updatedInventory)
    }
    
    setFormData({ name: "", type: "", metalType: "gold", weight: "", purity: "", pricePerGram: "", quantity: "1" })
    setShowForm(false)
  }

  const generateQRCodeForItem = async (item: InventoryItem): Promise<string> => {
    // Generate QR code if not already generated
    const qrData = item.qrCode || generateQRCodeData(item)
    
    // Yield to event loop before heavy operation to prevent blocking
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Generate QR code image (this is CPU-intensive but now non-blocking)
    const qrCodeImage = await generateQRCodeImage(qrData)
    
    // Update item with QR code if it wasn't there (defer state update to avoid blocking)
    if (!item.qrCode) {
      // Use requestAnimationFrame or setTimeout to defer state update
      requestAnimationFrame(() => {
        const updatedInventory = inventory.map((invItem) =>
          invItem.id === item.id ? { ...invItem, qrCode: qrData } : invItem
        )
        saveInventory(updatedInventory)
        setInventory(updatedInventory)
      })
    }
    
    return qrCodeImage
  }

  const handleViewQRCode = async (item: InventoryItem) => {
    // Prevent multiple simultaneous requests
    if (generatingQRCode === item.id) return
    
    setGeneratingQRCode(item.id)
    
    try {
      // Defer the heavy operation
      const qrCodeImage = await generateQRCodeForItem(item)
      setViewingQRCode({ item, image: qrCodeImage })
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Failed to generate QR code. Please try again.')
    } finally {
      setGeneratingQRCode(null)
    }
  }

  const handlePrintQRCode = async (item: InventoryItem) => {
    // Prevent multiple simultaneous requests
    if (generatingQRCode === item.id) return
    
    setGeneratingQRCode(item.id)
    
    try {
      // Defer the heavy operation
      const qrCodeImage = await generateQRCodeForItem(item)
      const qrData = item.qrCode || generateQRCodeData(item)
      
      // Print QR code label (this is also async but doesn't block)
      const itemToPrint = { ...item, qrCode: qrData }
      printQRCodeLabel(itemToPrint, qrCodeImage)
    } catch (error) {
      console.error('Error printing QR code:', error)
      toast.error('Failed to generate QR code. Please try again.')
    } finally {
      setGeneratingQRCode(null)
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      type: item.type,
      metalType: item.metalType || "gold",
      weight: item.weight.toString(),
      purity: item.purity,
      pricePerGram: item.pricePerGram.toString(),
      quantity: item.quantity.toString(),
    })
    setShowForm(true)
  }

  const handleDelete = () => {
    if (!deleteItem) return

    // Check if item is used in any sales
    const sales = getSales()
    const isUsedInSales = sales.some((sale) => sale.itemId === deleteItem.id)

    if (isUsedInSales) {
      alert("Cannot delete this item because it has been used in sales. Please remove the sales first.")
      setDeleteItem(null)
      return
    }

    const updatedInventory = inventory.filter((item) => item.id !== deleteItem.id)
    saveInventory(updatedInventory)
    setInventory(updatedInventory)
    setDeleteItem(null)
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setFormData({ name: "", type: "", metalType: "gold", weight: "", purity: "", pricePerGram: "", quantity: "1" })
    setShowForm(false)
  }

  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0)

  const formatCurrency = (amount: number) => {
    return `NPR ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Inventory</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your gold items</p>
        </div>
        <div className="flex gap-2">
          {onNavigate && (
            <>
              <Button
                variant="outline"
                onClick={() => onNavigate("qr-scanner")}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">Scan QR</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate("physical-inventory")}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Physical Count</span>
              </Button>
            </>
          )}
          <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Inventory Value</p>
            <p className="text-xl sm:text-2xl font-semibold text-foreground mt-1 break-words">{formatCurrency(totalValue)}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-lg flex items-center justify-center shrink-0 ml-2">
            <Weight className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
          </div>
        </div>
      </Card>

      {showForm && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
            {editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                <label className="block text-sm font-medium text-foreground mb-2">Metal Type *</label>
                <select
                  required
                  value={formData.metalType}
                  onChange={(e) => {
                    const metalType = e.target.value as "gold" | "silver"
                    setFormData({ 
                      ...formData, 
                      metalType,
                      purity: "" // Reset purity when metal type changes
                    })
                  }}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
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
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Purity *</label>
                <Input
                  required
                  value={formData.purity}
                  onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                  placeholder={formData.metalType === "gold" ? "e.g., 22K, 24K, 18K" : "e.g., 925, 999"}
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
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" className="w-full sm:w-auto">{editingItem ? "Update Item" : "Save Item"}</Button>
              <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Inventory Items</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-secondary rounded-lg space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
            if (filters.metalType) {
              filteredInventory = filteredInventory.filter((item) => item.metalType === filters.metalType)
            }
            if (filters.searchTerm) {
              const search = filters.searchTerm.toLowerCase()
              filteredInventory = filteredInventory.filter((item) =>
                item.name.toLowerCase().includes(search)
              )
            }

            // Pagination logic
            const totalPages = Math.ceil(filteredInventory.length / itemsPerPage)
            const startIndex = (currentPage - 1) * itemsPerPage
            const endIndex = startIndex + itemsPerPage
            const paginatedInventory = filteredInventory.slice(startIndex, endIndex)

            return filteredInventory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No inventory items found</p>
            ) : (
              <>
                {paginatedInventory.map((item) => (
                  <div key={item.id} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-primary">{formatCurrency(item.totalValue)}</p>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewQRCode(item)}
                            className="h-8 w-8 p-0"
                            title="View QR Code"
                            disabled={generatingQRCode === item.id}
                          >
                            {generatingQRCode === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintQRCode(item)}
                            className="h-8 w-8 p-0"
                            title="Print QR Code Label"
                            disabled={generatingQRCode === item.id}
                          >
                            {generatingQRCode === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Printer className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="h-8 w-8 p-0"
                            title="Edit Item"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteItem(item)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Weight</p>
                        <p className="font-medium text-foreground">{item.weight}g</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Metal / Purity</p>
                        <p className="font-medium text-foreground">
                          {item.metalType === "silver" ? "Silver" : "Gold"} - {item.purity}
                        </p>
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
                    {item.qrCode && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <QrCode className="w-3 h-3" />
                        <span>QR Code Available</span>
                      </div>
                    )}
                  </div>
                ))}
                {filteredInventory.length > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredInventory.length}
                  />
                )}
              </>
            )
          })()}
        </div>
      </Card>

      {/* QR Code View Dialog */}
      <Dialog open={!!viewingQRCode.item} onOpenChange={() => setViewingQRCode({ item: null, image: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code - {viewingQRCode.item?.name}</DialogTitle>
            <DialogDescription>
              Scan this QR code to count this item in physical inventory
            </DialogDescription>
          </DialogHeader>
          {viewingQRCode.image && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                <img 
                  src={viewingQRCode.image} 
                  alt="QR Code" 
                  className="w-64 h-64"
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">{viewingQRCode.item?.name}</p>
                <p className="text-xs">
                  {viewingQRCode.item?.type} | {viewingQRCode.item?.metalType === 'gold' ? 'Gold' : 'Silver'} {viewingQRCode.item?.purity}
                </p>
                <p className="text-xs">
                  Weight: {viewingQRCode.item?.weight}g | Qty: {viewingQRCode.item?.quantity}
                </p>
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (viewingQRCode.item) {
                      handlePrintQRCode(viewingQRCode.item)
                    }
                  }}
                  className="flex-1"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Label
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (viewingQRCode.image) {
                      const link = document.createElement('a')
                      link.download = `qr-code-${viewingQRCode.item?.name || 'item'}.png`
                      link.href = viewingQRCode.image
                      link.click()
                    }
                  }}
                  className="flex-1"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteItem?.name}</strong>? This action cannot be undone.
              {deleteItem && getSales().some((sale) => sale.itemId === deleteItem.id) && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: This item has been used in sales and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteItem ? getSales().some((sale) => sale.itemId === deleteItem.id) : false}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
