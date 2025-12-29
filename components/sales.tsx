"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, FileText, Filter, X, Edit, Trash2 } from "lucide-react"
import { getSales, saveSales, getCustomers, getInventory, saveInventory, getNextBillNumber, type Sale } from "@/lib/storage"
import { Invoice } from "@/components/invoice"
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

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [deleteSale, setDeleteSale] = useState<Sale | null>(null)
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<Sale | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [filters, setFilters] = useState({
    customerId: "",
    paymentMethod: "",
    dateFrom: "",
    dateTo: "",
    searchTerm: "",
  })
  const [formData, setFormData] = useState({
    customerId: "",
    itemId: "",
    quantity: "1",
    makingCharges: "0",
    discount: "0",
    paymentMethod: "cash" as "cash" | "card" | "esewa" | "khalti" | "other",
    paymentDetails: "",
  })

  useEffect(() => {
    setSales(getSales())
    setCustomers(getCustomers())
    setInventory(getInventory())
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.customerId, filters.paymentMethod, filters.dateFrom, filters.dateTo, filters.searchTerm])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const customer = customers.find((c) => c.id === formData.customerId)
    const item = inventory.find((i) => i.id === formData.itemId)

    if (!customer || !item) {
      alert("Please select both customer and item")
      return
    }

    const quantity = Number.parseInt(formData.quantity)
    
    // Validate inventory quantity
    if (quantity > item.quantity) {
      alert(`Insufficient inventory! Only ${item.quantity} available, but trying to sell ${quantity}.`)
      return
    }

    if (quantity <= 0) {
      alert("Quantity must be greater than 0")
      return
    }

    const makingCharges = Number.parseFloat(formData.makingCharges) || 0
    const discount = Number.parseFloat(formData.discount) || 0
    
    if (discount < 0) {
      alert("Discount cannot be negative")
      return
    }

    const goldValue = item.totalValue * quantity
    const subtotal = goldValue + makingCharges
    const totalAmount = subtotal - discount
    
    if (totalAmount < 0) {
      alert("Total amount cannot be negative")
      return
    }

    if (editingSale) {
      // Restore inventory from old sale first
      const oldSale = editingSale
      const oldItem = inventory.find((i) => i.id === oldSale.itemId) || 
        sales.find((s) => s.id === oldSale.id) ? {
          id: oldSale.itemId,
          name: oldSale.itemName,
          type: "",
          weight: 0,
          purity: "",
          pricePerGram: oldSale.pricePerUnit,
          quantity: 0,
          totalValue: oldSale.pricePerUnit,
          createdAt: "",
        } : null

      if (oldItem) {
        // Restore old quantity
        const restoredInventory = [...inventory]
        const existingItemIndex = restoredInventory.findIndex((i) => i.id === oldItem.id)
        
        if (existingItemIndex >= 0) {
          restoredInventory[existingItemIndex].quantity += oldSale.quantity
          restoredInventory[existingItemIndex].totalValue = 
            restoredInventory[existingItemIndex].pricePerGram * 
            restoredInventory[existingItemIndex].weight * 
            restoredInventory[existingItemIndex].quantity
        } else {
          // Item was removed, add it back
          restoredInventory.push({
            ...oldItem,
            quantity: oldSale.quantity,
            totalValue: oldSale.pricePerUnit * oldSale.quantity,
          })
        }
        setInventory(restoredInventory)
      }

      // Update sale
      const updatedSale: Sale = {
        ...editingSale,
        customerId: formData.customerId,
        customerName: customer.name,
        itemId: formData.itemId,
        itemName: item.name,
        quantity,
        pricePerUnit: item.totalValue,
        goldValue,
        makingCharges,
        subtotal,
        discount,
        totalAmount,
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentDetails || undefined,
      }

      // Update inventory - reduce quantity for new sale
      const updatedInventory = inventory.map((invItem) => {
        if (invItem.id === item.id) {
          const newQuantity = invItem.quantity - quantity
          return {
            ...invItem,
            quantity: newQuantity >= 0 ? newQuantity : 0,
            totalValue: newQuantity >= 0 ? (invItem.pricePerGram * invItem.weight * newQuantity) : 0,
          }
        }
        return invItem
      })
      const filteredInventory = updatedInventory.filter((invItem) => invItem.quantity > 0)
      
      saveInventory(filteredInventory)
      setInventory(filteredInventory)

      const updatedSales = sales.map((s) => (s.id === editingSale.id ? updatedSale : s))
      saveSales(updatedSales)
      setSales(updatedSales)
      setEditingSale(null)
    } else {
      // Create new sale
      const newSale: Sale = {
        id: Date.now().toString(),
        billNumber: getNextBillNumber(),
        customerId: formData.customerId,
        customerName: customer.name,
        itemId: formData.itemId,
        itemName: item.name,
        quantity,
        pricePerUnit: item.totalValue,
        goldValue,
        makingCharges,
        subtotal,
        discount,
        totalAmount,
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentDetails || undefined,
        createdAt: new Date().toISOString(),
      }

      // Update inventory - reduce quantity when item is sold
      const updatedInventory = inventory.map((invItem) => {
        if (invItem.id === item.id) {
          const newQuantity = invItem.quantity - quantity
          return {
            ...invItem,
            quantity: newQuantity >= 0 ? newQuantity : 0,
            totalValue: newQuantity >= 0 ? (invItem.pricePerGram * invItem.weight * newQuantity) : 0,
          }
        }
        return invItem
      })
      // Remove items with zero quantity
      const filteredInventory = updatedInventory.filter((invItem) => invItem.quantity > 0)
      
      // Save updated inventory
      saveInventory(filteredInventory)
      setInventory(filteredInventory)

      const updatedSales = [...sales, newSale]
      saveSales(updatedSales)
      setSales(updatedSales)
    }
    setFormData({
      customerId: "",
      itemId: "",
      quantity: "1",
      makingCharges: "0",
      discount: "0",
      paymentMethod: "cash",
      paymentDetails: "",
    })
    setShowForm(false)
  }

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale)
    setFormData({
      customerId: sale.customerId,
      itemId: sale.itemId,
      quantity: sale.quantity.toString(),
      makingCharges: sale.makingCharges.toString(),
      discount: sale.discount.toString(),
      paymentMethod: sale.paymentMethod,
      paymentDetails: sale.paymentDetails || "",
    })
    setShowForm(true)
  }

  const handleDelete = () => {
    if (!deleteSale) return

    // Restore inventory quantity
    const sale = deleteSale
    const currentInventory = getInventory()
    const item = currentInventory.find((i) => i.id === sale.itemId)

    if (item) {
      // Item exists, restore quantity
      const updatedInventory = currentInventory.map((invItem) => {
        if (invItem.id === sale.itemId) {
          return {
            ...invItem,
            quantity: invItem.quantity + sale.quantity,
            totalValue: invItem.pricePerGram * invItem.weight * (invItem.quantity + sale.quantity),
          }
        }
        return invItem
      })
      saveInventory(updatedInventory)
      setInventory(updatedInventory)
    } else {
      // Item was removed, recreate it
      const restoredItem = {
        id: sale.itemId,
        name: sale.itemName,
        type: "",
        weight: 0,
        purity: "",
        pricePerGram: sale.pricePerUnit,
        quantity: sale.quantity,
        totalValue: sale.pricePerUnit * sale.quantity,
        createdAt: sale.createdAt,
      }
      const updatedInventory = [...currentInventory, restoredItem]
      saveInventory(updatedInventory)
      setInventory(updatedInventory)
    }

    // Remove sale
    const updatedSales = sales.filter((s) => s.id !== deleteSale.id)
    saveSales(updatedSales)
    setSales(updatedSales)
    setDeleteSale(null)
  }

  const handleCancelEdit = () => {
    setEditingSale(null)
    setFormData({
      customerId: "",
      itemId: "",
      quantity: "1",
      makingCharges: "0",
      discount: "0",
      paymentMethod: "cash",
      paymentDetails: "",
    })
    setShowForm(false)
  }

  const formatCurrency = (amount: number) => {
    return `NPR ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Sales</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Record and track sales transactions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          New Sale
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
            {editingSale ? "Edit Sale" : "New Sale"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Customer *</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Item *</label>
                <select
                  required
                  value={formData.itemId}
                  onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="">Select item</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {formatCurrency(item.totalValue)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Quantity *</label>
                <Input
                  required
                  type="number"
                  min="1"
                  max={formData.itemId ? inventory.find((i) => i.id === formData.itemId)?.quantity || 999 : 999}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="1"
                />
                {formData.itemId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {inventory.find((i) => i.id === formData.itemId)?.quantity || 0}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Making Charges (Karigar) (NPR) *
                </label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.makingCharges}
                  onChange={(e) => setFormData({ ...formData, makingCharges: e.target.value })}
                  placeholder="Enter making charges (e.g., 500.00)"
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Labor charges for jewelry making - This is separate from gold value
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Discount (NPR)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Payment Method *</label>
                <select
                  required
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentMethod: e.target.value as "cash" | "card" | "esewa" | "khalti" | "other",
                    })
                  }
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card (Debit/Credit)</option>
                  <option value="esewa">eSewa</option>
                  <option value="khalti">Khalti</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {(formData.paymentMethod === "esewa" ||
                formData.paymentMethod === "khalti" ||
                formData.paymentMethod === "card" ||
                formData.paymentMethod === "other") && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Payment Details {formData.paymentMethod === "card" && "(Last 4 digits)"}
                    {(formData.paymentMethod === "esewa" || formData.paymentMethod === "khalti") &&
                      " (Transaction ID)"}
                    {formData.paymentMethod === "other" && " (Details)"}
                  </label>
                  <Input
                    value={formData.paymentDetails}
                    onChange={(e) => setFormData({ ...formData, paymentDetails: e.target.value })}
                    placeholder={
                      formData.paymentMethod === "card"
                        ? "e.g., 1234"
                        : formData.paymentMethod === "esewa" || formData.paymentMethod === "khalti"
                          ? "Transaction ID"
                          : "Payment details"
                    }
                  />
                </div>
              )}
            </div>
            {formData.itemId && (
              <div className="p-3 sm:p-4 bg-secondary rounded-lg space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Price Breakdown</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">
                      {inventory.find((i) => i.id === formData.itemId)?.metalType === "silver" ? "Silver" : "Gold"} Value:
                    </p>
                    <p className="font-medium text-foreground">
                      {formData.itemId && formData.quantity
                        ? formatCurrency(
                            (inventory.find((i) => i.id === formData.itemId)?.totalValue || 0) *
                              Number.parseInt(formData.quantity || "1")
                          )
                        : formatCurrency(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Making Charges:</p>
                    <p className="font-medium text-foreground">
                      {formatCurrency(Number.parseFloat(formData.makingCharges || "0"))}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Subtotal:</p>
                    <p className="font-medium text-foreground">
                      {formatCurrency(
                        (formData.itemId && formData.quantity
                          ? (inventory.find((i) => i.id === formData.itemId)?.totalValue || 0) *
                            Number.parseInt(formData.quantity || "1")
                          : 0) + Number.parseFloat(formData.makingCharges || "0")
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Discount:</p>
                    <p className="font-medium text-foreground">
                      -{formatCurrency(Number.parseFloat(formData.discount || "0"))}
                    </p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-border">
                    <p className="text-muted-foreground">Total Amount:</p>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(
                        (formData.itemId && formData.quantity
                          ? (inventory.find((i) => i.id === formData.itemId)?.totalValue || 0) *
                            Number.parseInt(formData.quantity || "1")
                          : 0) +
                          Number.parseFloat(formData.makingCharges || "0") -
                          Number.parseFloat(formData.discount || "0")
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" className="w-full sm:w-auto">{editingSale ? "Update Sale" : "Record Sale"}</Button>
              <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Sales History</h3>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Customer</label>
                <select
                  value={filters.customerId}
                  onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
                  className="w-full h-9 px-2 text-sm rounded-md border border-input bg-background text-foreground"
                >
                  <option value="">All Customers</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Payment Method</label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                  className="w-full h-9 px-2 text-sm rounded-md border border-input bg-background text-foreground"
                >
                  <option value="">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="esewa">eSewa</option>
                  <option value="khalti">Khalti</option>
                  <option value="other">Other</option>
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
                placeholder="Search by customer, item, or bill number..."
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
                  setFilters({ customerId: "", paymentMethod: "", dateFrom: "", dateTo: "", searchTerm: "" })
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
            let filteredSales = sales

            if (filters.customerId) {
              filteredSales = filteredSales.filter((sale) => sale.customerId === filters.customerId)
            }
            if (filters.paymentMethod) {
              filteredSales = filteredSales.filter((sale) => sale.paymentMethod === filters.paymentMethod)
            }
            if (filters.dateFrom) {
              filteredSales = filteredSales.filter(
                (sale) => new Date(sale.createdAt) >= new Date(filters.dateFrom)
              )
            }
            if (filters.dateTo) {
              filteredSales = filteredSales.filter(
                (sale) => new Date(sale.createdAt) <= new Date(filters.dateTo + "T23:59:59")
              )
            }
            if (filters.searchTerm) {
              const search = filters.searchTerm.toLowerCase()
              filteredSales = filteredSales.filter(
                (sale) =>
                  sale.customerName.toLowerCase().includes(search) ||
                  sale.itemName.toLowerCase().includes(search) ||
                  sale.billNumber?.toLowerCase().includes(search)
              )
            }

            // Pagination logic
            const totalPages = Math.ceil(filteredSales.length / itemsPerPage)
            const startIndex = (currentPage - 1) * itemsPerPage
            const endIndex = startIndex + itemsPerPage
            const paginatedSales = filteredSales.slice(startIndex, endIndex)

            return filteredSales.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No sales found</p>
            ) : (
              <>
                {paginatedSales.map((sale) => (
              <div key={sale.id} className="p-3 sm:p-4 bg-secondary rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground break-words">{sale.customerName}</p>
                      <span className="text-xs text-muted-foreground">
                        Bill #{sale.billNumber || sale.id.slice(-4)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">{sale.itemName}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-semibold text-primary break-words">{formatCurrency(sale.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleDateString("en-NP")}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm pt-2 sm:pt-3 border-t border-border">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium text-foreground">{sale.quantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {(() => {
                        const item = inventory.find((i) => i.id === sale.itemId)
                        return item?.metalType === "silver" ? "Silver" : "Gold"
                      })()} Value
                    </p>
                    <p className="font-medium text-foreground break-words">
                      {formatCurrency(
                        sale.goldValue !== undefined
                          ? sale.goldValue
                          : sale.subtotal - (sale.makingCharges || 0)
                      )}
                    </p>
                  </div>
                  <div className="bg-primary/5 p-2 rounded">
                    <p className="text-muted-foreground text-xs">Making Charges</p>
                    <p className="font-semibold text-foreground break-words">
                      {formatCurrency(sale.makingCharges || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Discount</p>
                    <p className="font-medium text-foreground break-words">{formatCurrency(sale.discount)}</p>
                  </div>
                </div>
                <div className="pt-2 sm:pt-3 border-t border-border mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Payment:</span>
                    <span className="text-xs sm:text-sm font-medium text-foreground capitalize break-words">
                      {sale.paymentMethod || "cash"}
                      {sale.paymentDetails && (
                        <span className="text-muted-foreground ml-1">({sale.paymentDetails})</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(sale)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteSale(sale)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setSelectedSaleForInvoice(sale)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">View / Print Bill</span>
                      <span className="sm:hidden">Bill</span>
                    </Button>
                  </div>
                </div>
              </div>
                ))}
                {filteredSales.length > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredSales.length}
                  />
                )}
              </>
            )
          })()}
        </div>
      </Card>

      {selectedSaleForInvoice && (
        <Invoice sale={selectedSaleForInvoice} onClose={() => setSelectedSaleForInvoice(null)} />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteSale} onOpenChange={() => setDeleteSale(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete sale <strong>Bill #{deleteSale?.billNumber}</strong> for{" "}
              <strong>{deleteSale?.customerName}</strong>? This will restore the inventory quantity. This action cannot be undone.
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
