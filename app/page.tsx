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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg md:text-xl font-semibold text-foreground truncate">
                  {shopInfo?.shopName || "Gold Shop CRM"}
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block truncate">
                  {shopInfo?.address || "सुन पसल व्यवस्थापन"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-1 sm:gap-2 shrink-0">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Top Navigation - Hidden on mobile, shown on tablet/desktop */}
      <nav className="hidden md:block bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide min-w-0">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-1 sm:gap-2 whitespace-nowrap shrink-0 text-xs sm:text-sm"
              size="sm"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <Button
              variant={activeTab === "customers" ? "default" : "ghost"}
              onClick={() => setActiveTab("customers")}
              className="flex items-center gap-1 sm:gap-2 whitespace-nowrap shrink-0 text-xs sm:text-sm"
              size="sm"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Customers</span>
            </Button>
            <Button
              variant={activeTab === "inventory" ? "default" : "ghost"}
              onClick={() => setActiveTab("inventory")}
              className="flex items-center gap-1 sm:gap-2 whitespace-nowrap shrink-0 text-xs sm:text-sm"
              size="sm"
            >
              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </Button>
            <Button
              variant={activeTab === "sales" ? "default" : "ghost"}
              onClick={() => setActiveTab("sales")}
              className="flex items-center gap-1 sm:gap-2 whitespace-nowrap shrink-0 text-xs sm:text-sm"
              size="sm"
            >
              <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Sales</span>
            </Button>
            <Button
              variant={activeTab === "gold-rates" ? "default" : "ghost"}
              onClick={() => setActiveTab("gold-rates")}
              className="flex items-center gap-1 sm:gap-2 whitespace-nowrap shrink-0 text-xs sm:text-sm"
              size="sm"
            >
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Rates</span>
            </Button>
            <Button
              variant={activeTab === "purchases" ? "default" : "ghost"}
              onClick={() => setActiveTab("purchases")}
              className="flex items-center gap-1 sm:gap-2 whitespace-nowrap shrink-0 text-xs sm:text-sm"
              size="sm"
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Purchases</span>
            </Button>
            <Button
              variant={activeTab === "import-export" ? "default" : "ghost"}
              onClick={() => setActiveTab("import-export")}
              className="flex items-center gap-1 sm:gap-2 whitespace-nowrap shrink-0 text-xs sm:text-sm"
              size="sm"
            >
              <Database className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Import/Export</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-20 md:pb-6 lg:pb-8">
        {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === "customers" && <Customers />}
        {activeTab === "inventory" && <Inventory />}
        {activeTab === "sales" && <Sales />}
        {activeTab === "gold-rates" && <GoldRates />}
        {activeTab === "purchases" && <Purchases />}
        {activeTab === "import-export" && <ImportExport />}
      </main>

      {/* Bottom Navigation - Shown on mobile, hidden on tablet/desktop */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors ${
              activeTab === "dashboard"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Sparkles className={`w-5 h-5 ${activeTab === "dashboard" ? "text-primary" : ""}`} />
            <span className="text-[10px] font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors ${
              activeTab === "customers"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Users className={`w-5 h-5 ${activeTab === "customers" ? "text-primary" : ""}`} />
            <span className="text-[10px] font-medium">Customers</span>
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors ${
              activeTab === "inventory"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Package className={`w-5 h-5 ${activeTab === "inventory" ? "text-primary" : ""}`} />
            <span className="text-[10px] font-medium">Inventory</span>
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors ${
              activeTab === "sales"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Receipt className={`w-5 h-5 ${activeTab === "sales" ? "text-primary" : ""}`} />
            <span className="text-[10px] font-medium">Sales</span>
          </button>
          <button
            onClick={() => setActiveTab("gold-rates")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors ${
              activeTab === "gold-rates"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <TrendingUp className={`w-5 h-5 ${activeTab === "gold-rates" ? "text-primary" : ""}`} />
            <span className="text-[10px] font-medium">Rates</span>
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors ${
              activeTab === "purchases"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <ShoppingCart className={`w-5 h-5 ${activeTab === "purchases" ? "text-primary" : ""}`} />
            <span className="text-[10px] font-medium">Buy</span>
          </button>
          <button
            onClick={() => setActiveTab("import-export")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors ${
              activeTab === "import-export"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Database className={`w-5 h-5 ${activeTab === "import-export" ? "text-primary" : ""}`} />
            <span className="text-[10px] font-medium">Data</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
