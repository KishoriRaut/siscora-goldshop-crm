export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  address: string
  createdAt: string
}

export interface InventoryItem {
  id: string
  name: string
  type: string
  metalType: "gold" | "silver" // Metal type: gold or silver
  weight: number
  purity: string
  pricePerGram: number
  quantity: number
  totalValue: number
  createdAt: string
}

export interface Sale {
  id: string
  billNumber: string // Sequential bill number
  customerId: string
  customerName: string
  itemId: string
  itemName: string
  quantity: number
  pricePerUnit: number
  goldValue: number // Gold value only
  makingCharges: number // Karigar charges
  subtotal: number // Gold value + making charges
  discount: number
  totalAmount: number // Subtotal - discount
  paymentMethod: "cash" | "card" | "esewa" | "khalti" | "other" // Payment method
  paymentDetails?: string // Additional payment details (transaction ID, etc.)
  createdAt: string
}

export interface GoldRate {
  id: string
  date: string // ISO date string
  purity22K: number
  purity24K: number
  purity18K: number
  purity20K?: number
  notes?: string
  createdAt: string
}

export interface SilverRate {
  id: string
  date: string // ISO date string
  purity925: number // Sterling silver (92.5%)
  purity999: number // Pure silver (99.9%)
  notes?: string
  createdAt: string
}

export interface Purchase {
  id: string
  purchaseNumber: string // Sequential purchase number
  customerId: string
  customerName: string
  itemName: string // Description of item purchased
  type: string // e.g., Ring, Necklace, Bangle
  metalType: "gold" | "silver" // Metal type: gold or silver
  weight: number // Weight in grams
  purity: string // e.g., 22K, 24K, 18K for gold; 925, 999 for silver
  pricePerGram: number // Purchase price per gram
  totalWeight: number // Total weight (weight * quantity)
  quantity: number
  totalAmount: number // Total purchase amount
  notes?: string // Additional notes
  createdAt: string
}

export function getCustomers(): Customer[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("goldshop_customers")
  return data ? JSON.parse(data) : []
}

export function saveCustomers(customers: Customer[]) {
  localStorage.setItem("goldshop_customers", JSON.stringify(customers))
}

export function getInventory(): InventoryItem[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("goldshop_inventory")
  return data ? JSON.parse(data) : []
}

export function saveInventory(inventory: InventoryItem[]) {
  localStorage.setItem("goldshop_inventory", JSON.stringify(inventory))
}

export function getSales(): Sale[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("goldshop_sales")
  return data ? JSON.parse(data) : []
}

export function saveSales(sales: Sale[]) {
  localStorage.setItem("goldshop_sales", JSON.stringify(sales))
}

export function getGoldRates(): GoldRate[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("goldshop_rates")
  return data ? JSON.parse(data) : []
}

export function saveGoldRates(rates: GoldRate[]) {
  localStorage.setItem("goldshop_rates", JSON.stringify(rates))
}

export function getCurrentGoldRate(): GoldRate | null {
  const rates = getGoldRates()
  if (rates.length === 0) return null
  
  // Get the most recent rate (assuming rates are sorted by date)
  const sortedRates = [...rates].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  return sortedRates[0]
}

export function getGoldRateByDate(date: string): GoldRate | null {
  const rates = getGoldRates()
  const rate = rates.find(r => r.date === date)
  return rate || null
}

export function getSilverRates(): SilverRate[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("goldshop_silver_rates")
  return data ? JSON.parse(data) : []
}

export function saveSilverRates(rates: SilverRate[]) {
  localStorage.setItem("goldshop_silver_rates", JSON.stringify(rates))
}

export function getCurrentSilverRate(): SilverRate | null {
  const rates = getSilverRates()
  if (rates.length === 0) return null
  
  // Get the most recent rate (assuming rates are sorted by date)
  const sortedRates = [...rates].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  return sortedRates[0]
}

export function getSilverRateByDate(date: string): SilverRate | null {
  const rates = getSilverRates()
  const rate = rates.find(r => r.date === date)
  return rate || null
}

export function getNextBillNumber(): string {
  if (typeof window === "undefined") return "0001"
  const sales = getSales()
  if (sales.length === 0) return "0001"
  
  // Get the highest bill number
  const billNumbers = sales
    .map(sale => {
      if (sale.billNumber) return sale.billNumber
      // For old sales without bill number, try to extract from ID or use index
      return "0"
    })
    .map(num => {
      const parsed = Number.parseInt(num)
      return isNaN(parsed) ? 0 : parsed
    })
  
  const maxBillNumber = Math.max(...billNumbers, 0)
  const nextNumber = maxBillNumber + 1
  
  // Format as 4-digit number with leading zeros
  return nextNumber.toString().padStart(4, "0")
}

export function getPurchases(): Purchase[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("goldshop_purchases")
  return data ? JSON.parse(data) : []
}

export function savePurchases(purchases: Purchase[]) {
  localStorage.setItem("goldshop_purchases", JSON.stringify(purchases))
}

export function getNextPurchaseNumber(): string {
  if (typeof window === "undefined") return "P0001"
  const purchases = getPurchases()
  if (purchases.length === 0) return "P0001"
  
  // Get the highest purchase number
  const purchaseNumbers = purchases
    .map(purchase => {
      if (purchase.purchaseNumber) {
        // Extract number from format like "P0001"
        const num = purchase.purchaseNumber.replace("P", "")
        return num
      }
      return "0"
    })
    .map(num => {
      const parsed = Number.parseInt(num)
      return isNaN(parsed) ? 0 : parsed
    })
  
  const maxPurchaseNumber = Math.max(...purchaseNumbers, 0)
  const nextNumber = maxPurchaseNumber + 1
  
  // Format as P + 4-digit number with leading zeros
  return `P${nextNumber.toString().padStart(4, "0")}`
}
