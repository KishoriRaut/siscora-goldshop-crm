"use client"

import { useState, useEffect } from "react"
import { Dashboard } from "@/components/dashboard"
import { Customers } from "@/components/customers"
import { Inventory } from "@/components/inventory"
import { Sales } from "@/components/sales"
import { GoldRates } from "@/components/gold-rates"
import { Sparkles, Users, Package, Receipt, TrendingUp, ShoppingCart, Database, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Purchases } from "@/components/purchases"
import { ImportExport } from "@/components/import-export"
import { Setup } from "@/components/setup"
import { Login } from "@/components/login"
import { isSetupComplete, isAuthenticated, clearAuthSession, getShopInfo } from "@/lib/auth"

type Tab = "dashboard" | "customers" | "inventory" | "sales" | "gold-rates" | "purchases" | "import-export"
type AppState = "setup" | "login" | "app"

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [appState, setAppState] = useState<AppState>("app")
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const setupComplete = isSetupComplete()
      const authenticated = isAuthenticated()

      if (!setupComplete) {
        setAppState("setup")
      } else if (!authenticated) {
        setAppState("login")
      } else {
        setAppState("app")
      }
      setIsChecking(false)
    }

    checkAuth()
  }, [])

  const handleSetupComplete = () => {
    setAppState("app")
  }

  const handleLoginSuccess = () => {
    setAppState("app")
  }

  const handleLogout = () => {
    clearAuthSession()
    setAppState("login")
  }

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show setup screen
  if (appState === "setup") {
    return <Setup onComplete={handleSetupComplete} />
  }

  // Show login screen
  if (appState === "login") {
    return <Login onSuccess={handleLoginSuccess} />
  }

  // Get shop info for display (only when app is loaded)
  const shopInfo = getShopInfo()

  // Show main app
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {shopInfo?.shopName || "Gold Shop CRM"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {shopInfo?.address || "सुन पसल व्यवस्थापन"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide min-w-0">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "customers" ? "default" : "ghost"}
              onClick={() => setActiveTab("customers")}
              className="flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Users className="w-4 h-4" />
              Customers
            </Button>
            <Button
              variant={activeTab === "inventory" ? "default" : "ghost"}
              onClick={() => setActiveTab("inventory")}
              className="flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Package className="w-4 h-4" />
              Inventory
            </Button>
            <Button
              variant={activeTab === "sales" ? "default" : "ghost"}
              onClick={() => setActiveTab("sales")}
              className="flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Receipt className="w-4 h-4" />
              Sales
            </Button>
            <Button
              variant={activeTab === "gold-rates" ? "default" : "ghost"}
              onClick={() => setActiveTab("gold-rates")}
              className="flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <TrendingUp className="w-4 h-4" />
              Rates
            </Button>
            <Button
              variant={activeTab === "purchases" ? "default" : "ghost"}
              onClick={() => setActiveTab("purchases")}
              className="flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
              Purchases
            </Button>
            <Button
              variant={activeTab === "import-export" ? "default" : "ghost"}
              onClick={() => setActiveTab("import-export")}
              className="flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Database className="w-4 h-4" />
              Import/Export
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === "customers" && <Customers />}
        {activeTab === "inventory" && <Inventory />}
        {activeTab === "sales" && <Sales />}
        {activeTab === "gold-rates" && <GoldRates />}
        {activeTab === "purchases" && <Purchases />}
        {activeTab === "import-export" && <ImportExport />}
      </main>
    </div>
  )
}
