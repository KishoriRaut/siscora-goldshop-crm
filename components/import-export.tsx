"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Upload, Database, FileText } from "lucide-react"
import {
  getCustomers,
  getInventory,
  getSales,
  getPurchases,
  getGoldRates,
  getSilverRates,
  saveCustomers,
  saveInventory,
  saveSales,
  savePurchases,
  saveGoldRates,
  saveSilverRates,
  type Customer,
  type InventoryItem,
  type Sale,
  type Purchase,
  type GoldRate,
  type SilverRate,
} from "@/lib/storage"

export function ImportExport() {
  const [isImporting, setIsImporting] = useState(false)

  const exportToJSON = () => {
    const data = {
      customers: getCustomers(),
      inventory: getInventory(),
      sales: getSales(),
      purchases: getPurchases(),
      goldRates: getGoldRates(),
      silverRates: getSilverRates(),
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gold-shop-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToCSV = (dataType: "customers" | "sales" | "purchases" | "inventory") => {
    let data: any[] = []
    let filename = ""
    let headers: string[] = []

    switch (dataType) {
      case "customers":
        data = getCustomers()
        filename = "customers"
        headers = ["ID", "Name", "Phone", "Email", "Address", "Created At"]
        break
      case "sales":
        data = getSales()
        filename = "sales"
        headers = [
          "Bill Number",
          "Customer Name",
          "Item Name",
          "Quantity",
          "Gold Value",
          "Making Charges",
          "Subtotal",
          "Discount",
          "Total Amount",
          "Payment Method",
          "Payment Details",
          "Date",
        ]
        break
      case "purchases":
        data = getPurchases()
        filename = "purchases"
        headers = [
          "Purchase Number",
          "Seller Name",
          "Item Name",
          "Type",
          "Metal Type",
          "Weight (g)",
          "Purity",
          "Price/Gram",
          "Quantity",
          "Total Amount",
          "Date",
        ]
        break
      case "inventory":
        data = getInventory()
        filename = "inventory"
        headers = ["Name", "Type", "Metal Type", "Weight (g)", "Purity", "Price/Gram", "Quantity", "Total Value"]
        break
    }

    const csvRows: string[] = []
    csvRows.push(headers.join(","))

    for (const row of data) {
      const values: string[] = []
      switch (dataType) {
        case "customers":
          values.push(row.id, row.name, row.phone, row.email || "", row.address || "", row.createdAt)
          break
        case "sales":
          values.push(
            row.billNumber || "",
            row.customerName,
            row.itemName,
            row.quantity.toString(),
            row.goldValue?.toString() || "",
            row.makingCharges?.toString() || "0",
            row.subtotal.toString(),
            row.discount.toString(),
            row.totalAmount.toString(),
            row.paymentMethod || "cash",
            row.paymentDetails || "",
            row.createdAt
          )
          break
      case "purchases":
        values.push(
          row.purchaseNumber || "",
          row.customerName,
          row.itemName,
          row.type,
          row.metalType || "gold",
          row.weight.toString(),
          row.purity,
          row.pricePerGram.toString(),
          row.quantity.toString(),
          row.totalAmount.toString(),
          row.createdAt
        )
        break
      case "inventory":
        values.push(
          row.name,
          row.type,
          row.metalType || "gold",
          row.weight.toString(),
          row.purity,
          row.pricePerGram.toString(),
          row.quantity.toString(),
          row.totalValue.toString()
        )
        break
      }
      csvRows.push(values.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    }

    const csv = csvRows.join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text)

        if (data.customers) saveCustomers(data.customers as Customer[])
        if (data.inventory) saveInventory(data.inventory as InventoryItem[])
        if (data.sales) saveSales(data.sales as Sale[])
        if (data.purchases) savePurchases(data.purchases as Purchase[])
        if (data.goldRates) saveGoldRates(data.goldRates as GoldRate[])
        if (data.silverRates) saveSilverRates(data.silverRates as SilverRate[])

        alert("Data imported successfully! Please refresh the page to see changes.")
        window.location.reload()
      } catch (error) {
        alert("Error importing data. Please check the file format.")
        console.error(error)
      } finally {
        setIsImporting(false)
        // Reset input
        event.target.value = ""
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Import / Export</h2>
        <p className="text-muted-foreground">Backup and restore your data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Export Data</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Button onClick={exportToJSON} className="w-full flex items-center gap-2" variant="default">
                <Database className="w-4 h-4" />
                Export All Data (JSON)
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Export all data as JSON backup file. Can be imported later.
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground mb-3">Export Individual Tables (CSV):</p>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => exportToCSV("customers")} variant="outline" size="sm" className="flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Customers
                </Button>
                <Button onClick={() => exportToCSV("sales")} variant="outline" size="sm" className="flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Sales
                </Button>
                <Button onClick={() => exportToCSV("purchases")} variant="outline" size="sm" className="flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Purchases
                </Button>
                <Button onClick={() => exportToCSV("inventory")} variant="outline" size="sm" className="flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Inventory
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Import Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Import Data</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  disabled={isImporting}
                />
                <Button
                  asChild
                  className="w-full flex items-center gap-2"
                  variant="default"
                  disabled={isImporting}
                >
                  <span>
                    <Upload className="w-4 h-4" />
                    {isImporting ? "Importing..." : "Import Data (JSON)"}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                Import previously exported JSON backup file. This will replace all current data.
              </p>
              <p className="text-xs text-red-500 mt-1 font-medium">
                ⚠️ Warning: This will overwrite all existing data!
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-muted">
        <h3 className="text-sm font-semibold text-foreground mb-2">Data Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Customers</p>
            <p className="font-semibold text-foreground">{getCustomers().length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Inventory Items</p>
            <p className="font-semibold text-foreground">{getInventory().length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Sales</p>
            <p className="font-semibold text-foreground">{getSales().length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Purchases</p>
            <p className="font-semibold text-foreground">{getPurchases().length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Gold Rates</p>
            <p className="font-semibold text-foreground">{getGoldRates().length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Silver Rates</p>
            <p className="font-semibold text-foreground">{getSilverRates().length}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

