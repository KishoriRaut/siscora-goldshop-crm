"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, FileText, Filter, X } from "lucide-react"
import { getSales, saveSales, getCustomers, getInventory, saveInventory, getNextBillNumber, type Sale } from "@/lib/storage"
import { Invoice } from "@/components/invoice"

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<Sale | null>(null)
  const [showFilters, setShowFilters] = useState(false)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Sales</h2>
          <p className="text-muted-foreground">Record and track sales transactions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Sale
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">New Sale</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="md:col-span-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="p-4 bg-secondary rounded-lg space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Price Breakdown</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Gold Value:</p>
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
            <div className="flex gap-2">
              <Button type="submit">Record Sale</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Sales History</h3>
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

            return filteredSales.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No sales found</p>
            ) : (
              filteredSales.map((sale) => (
              <div key={sale.id} className="p-4 bg-secondary rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{sale.customerName}</p>
                      <span className="text-xs text-muted-foreground">
                        Bill #{sale.billNumber || sale.id.slice(-4)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{sale.itemName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{formatCurrency(sale.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleDateString("en-NP")}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm pt-3 border-t border-border">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium text-foreground">{sale.quantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gold Value</p>
                    <p className="font-medium text-foreground">
                      {formatCurrency(
                        sale.goldValue !== undefined
                          ? sale.goldValue
                          : sale.subtotal - (sale.makingCharges || 0)
                      )}
                    </p>
                  </div>
                  <div className="bg-primary/5 p-2 rounded">
                    <p className="text-muted-foreground text-xs">Making Charges (Karigar)</p>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(sale.makingCharges || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Discount</p>
                    <p className="font-medium text-foreground">{formatCurrency(sale.discount)}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-border mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Payment:</span>
                    <span className="text-sm font-medium text-foreground capitalize">
                      {sale.paymentMethod || "cash"}
                      {sale.paymentDetails && (
                        <span className="text-muted-foreground ml-1">({sale.paymentDetails})</span>
                      )}
                    </span>
                  </div>
                  <Button
                    onClick={() => setSelectedSaleForInvoice(sale)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View / Print Bill
                  </Button>
                </div>
              </div>
              ))
            )
          })()}
        </div>
      </Card>

      {selectedSaleForInvoice && (
        <Invoice sale={selectedSaleForInvoice} onClose={() => setSelectedSaleForInvoice(null)} />
      )}
    </div>
  )
}
