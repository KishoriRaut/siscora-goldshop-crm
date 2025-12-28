"use client"

import { useState } from "react"
import { Dashboard } from "@/components/dashboard"
import { Customers } from "@/components/customers"
import { Inventory } from "@/components/inventory"
import { Sales } from "@/components/sales"
import { GoldRates } from "@/components/gold-rates"
import { Sparkles, Users, Package, Receipt, TrendingUp, ShoppingCart, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Purchases } from "@/components/purchases"
import { ImportExport } from "@/components/import-export"

type Tab = "dashboard" | "customers" | "inventory" | "sales" | "gold-rates" | "purchases" | "import-export"

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")

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
                <h1 className="text-xl font-semibold text-foreground">Gold Shop CRM</h1>
                <p className="text-xs text-muted-foreground">सुन पसल व्यवस्थापन</p>
              </div>
            </div>
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
              Gold Rates
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
