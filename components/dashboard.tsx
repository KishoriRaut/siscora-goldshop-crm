"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Users, Package, Receipt, TrendingUp, ShoppingCart, ArrowRight } from "lucide-react"
import { getCustomers, getInventory, getSales, getCurrentGoldRate, getCurrentSilverRate, getPurchases } from "@/lib/storage"
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
  const [currentSilverRate, setCurrentSilverRate] = useState<ReturnType<typeof getCurrentSilverRate>>(null)

  useEffect(() => {
    const customers = getCustomers()
    const inventory = getInventory()
    const sales = getSales()
    const purchases = getPurchases()
    const goldRate = getCurrentGoldRate()
    const silverRate = getCurrentSilverRate()

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
    setCurrentSilverRate(silverRate)
  }, [])

  const formatCurrency = (amount: number) => {
    return `NPR ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Dashboard</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Overview of your gold & silver shop</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl sm:text-3xl font-semibold text-foreground mt-1 sm:mt-2">{stats.totalCustomers}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-lg flex items-center justify-center shrink-0 ml-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Inventory Items</p>
              <p className="text-2xl sm:text-3xl font-semibold text-foreground mt-1 sm:mt-2">{stats.totalItems}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-lg flex items-center justify-center shrink-0 ml-2">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl sm:text-3xl font-semibold text-foreground mt-1 sm:mt-2">{stats.totalSales}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-lg flex items-center justify-center shrink-0 ml-2">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-lg sm:text-xl font-semibold text-foreground mt-1 sm:mt-2 break-words">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-lg flex items-center justify-center shrink-0 ml-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Making Charges</p>
              <p className="text-xl sm:text-2xl font-semibold text-foreground mt-1 sm:mt-2 break-words">
                {formatCurrency(stats.totalMakingCharges)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Karigar income</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-lg flex items-center justify-center shrink-0 ml-2">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Gold & Silver Purchases</p>
              <p className="text-xl sm:text-2xl font-semibold text-foreground mt-1 sm:mt-2">{stats.totalPurchases}</p>
              <p className="text-xs text-muted-foreground mt-1 break-words">
                {formatCurrency(stats.totalPurchaseAmount)} total
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-lg flex items-center justify-center shrink-0 ml-2">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Net Profit</p>
              <p className="text-xl sm:text-2xl font-semibold text-foreground mt-1 sm:mt-2 break-words">
                {formatCurrency(stats.totalRevenue - stats.totalPurchaseAmount)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Sales - Purchases</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-lg flex items-center justify-center shrink-0 ml-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {currentGoldRate && (
          <Card className="p-4 sm:p-6 bg-primary/5 border-primary/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Current Gold Rates</h3>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {new Date(currentGoldRate.date).toLocaleDateString("en-NP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-background rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">24K Gold</p>
                <p className="text-lg sm:text-xl font-bold text-foreground break-words">{formatCurrency(currentGoldRate.purity24K)}</p>
                <p className="text-xs text-muted-foreground mt-1">per gram</p>
              </div>
              <div className="p-3 sm:p-4 bg-background rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">22K Gold</p>
                <p className="text-lg sm:text-xl font-bold text-foreground break-words">{formatCurrency(currentGoldRate.purity22K)}</p>
                <p className="text-xs text-muted-foreground mt-1">per gram</p>
              </div>
              <div className="p-3 sm:p-4 bg-background rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">18K Gold</p>
                <p className="text-lg sm:text-xl font-bold text-foreground break-words">{formatCurrency(currentGoldRate.purity18K)}</p>
                <p className="text-xs text-muted-foreground mt-1">per gram</p>
              </div>
            </div>
          </Card>
        )}
        {currentSilverRate && (
          <Card className="p-4 sm:p-6 bg-primary/5 border-primary/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Current Silver Rates</h3>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {new Date(currentSilverRate.date).toLocaleDateString("en-NP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-background rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">999 Silver (Pure)</p>
                <p className="text-lg sm:text-xl font-bold text-foreground break-words">{formatCurrency(currentSilverRate.purity999)}</p>
                <p className="text-xs text-muted-foreground mt-1">per gram</p>
              </div>
              <div className="p-3 sm:p-4 bg-background rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">925 Silver (Sterling)</p>
                <p className="text-lg sm:text-xl font-bold text-foreground break-words">{formatCurrency(currentSilverRate.purity925)}</p>
                <p className="text-xs text-muted-foreground mt-1">per gram</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
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
              <p className="font-medium text-foreground">Record purchase</p>
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
              <p className="font-medium text-foreground">Update rates</p>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-xs">Go to Gold & Silver Rates tab</p>
          </Button>
        </div>
      </Card>
    </div>
  )
}
