"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Users, Package, Receipt, TrendingUp, ShoppingCart, ArrowRight } from "lucide-react"
import { getCustomers, getInventory, getSales, getCurrentGoldRate, getPurchases } from "@/lib/storage"
import { Button } from "@/components/ui/button"

interface DashboardProps {
  onNavigate?: (tab: "customers" | "inventory" | "sales" | "purchases" | "gold-rates") => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalItems: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalMakingCharges: 0,
    totalPurchases: 0,
    totalPurchaseAmount: 0,
  })
  const [currentGoldRate, setCurrentGoldRate] = useState<ReturnType<typeof getCurrentGoldRate>>(null)

  useEffect(() => {
    const customers = getCustomers()
    const inventory = getInventory()
    const sales = getSales()
    const purchases = getPurchases()
    const goldRate = getCurrentGoldRate()

    const revenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const makingCharges = sales.reduce((sum, sale) => sum + (sale.makingCharges || 0), 0)
    const purchaseAmount = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0)

    setStats({
      totalCustomers: customers.length,
      totalItems: inventory.length,
      totalSales: sales.length,
      totalRevenue: revenue,
      totalMakingCharges: makingCharges,
      totalPurchases: purchases.length,
      totalPurchaseAmount: purchaseAmount,
    })
    setCurrentGoldRate(goldRate)
  }, [])

  const formatCurrency = (amount: number) => {
    return `NPR ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your gold shop</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-3xl font-semibold text-foreground mt-2">{stats.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Inventory Items</p>
              <p className="text-3xl font-semibold text-foreground mt-2">{stats.totalItems}</p>
            </div>
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-3xl font-semibold text-foreground mt-2">{stats.totalSales}</p>
            </div>
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-semibold text-foreground mt-2">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Making Charges</p>
              <p className="text-2xl font-semibold text-foreground mt-2">
                {formatCurrency(stats.totalMakingCharges)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Karigar income</p>
            </div>
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gold Purchases</p>
              <p className="text-2xl font-semibold text-foreground mt-2">{stats.totalPurchases}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(stats.totalPurchaseAmount)} total
              </p>
            </div>
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className="text-2xl font-semibold text-foreground mt-2">
                {formatCurrency(stats.totalRevenue - stats.totalPurchaseAmount)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Sales - Purchases</p>
            </div>
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>
      </div>

      {currentGoldRate && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Current Gold Rates</h3>
            <span className="text-sm text-muted-foreground">
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
              <p className="text-xl font-bold text-foreground">{formatCurrency(currentGoldRate.purity24K)}</p>
              <p className="text-xs text-muted-foreground mt-1">per gram</p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">22K Gold</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(currentGoldRate.purity22K)}</p>
              <p className="text-xs text-muted-foreground mt-1">per gram</p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">18K Gold</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(currentGoldRate.purity18K)}</p>
              <p className="text-xs text-muted-foreground mt-1">per gram</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start justify-start hover:bg-accent cursor-pointer"
            onClick={() => onNavigate?.("customers")}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <p className="font-medium text-foreground">Add new customer</p>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-xs">Go to Customers tab</p>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start justify-start hover:bg-accent cursor-pointer"
            onClick={() => onNavigate?.("inventory")}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <p className="font-medium text-foreground">Add inventory item</p>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-xs">Go to Inventory tab</p>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start justify-start hover:bg-accent cursor-pointer"
            onClick={() => onNavigate?.("sales")}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <p className="font-medium text-foreground">Record new sale</p>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-xs">Go to Sales tab</p>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start justify-start hover:bg-accent cursor-pointer"
            onClick={() => onNavigate?.("purchases")}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <p className="font-medium text-foreground">Record gold purchase</p>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-xs">Go to Purchases tab</p>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start justify-start hover:bg-accent cursor-pointer"
            onClick={() => onNavigate?.("gold-rates")}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <p className="font-medium text-foreground">Update gold rates</p>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-xs">Go to Gold Rates tab</p>
          </Button>
        </div>
      </Card>
    </div>
  )
}
