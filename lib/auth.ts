// Authentication and setup utilities

export interface ShopInfo {
  shopName: string
  address: string
  passwordHash: string
  setupCompleted: boolean
  setupDate: string
}

const SHOP_INFO_KEY = "goldshop_setup_info"

export function getShopInfo(): ShopInfo | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(SHOP_INFO_KEY)
  return data ? JSON.parse(data) : null
}

export function saveShopInfo(shopInfo: ShopInfo) {
  localStorage.setItem(SHOP_INFO_KEY, JSON.stringify(shopInfo))
}

export function isSetupComplete(): boolean {
  const shopInfo = getShopInfo()
  return shopInfo?.setupCompleted === true
}

// Hash password using Web Crypto API (industry standard)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// Check if user is authenticated (session)
const AUTH_SESSION_KEY = "goldshop_auth_session"

export function setAuthSession() {
  if (typeof window === "undefined") return
  // Session expires in 24 hours
  const sessionData = {
    authenticated: true,
    timestamp: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData))
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  const sessionData = sessionStorage.getItem(AUTH_SESSION_KEY)
  if (!sessionData) return false

  try {
    const session = JSON.parse(sessionData)
    // Check if session is still valid
    if (Date.now() > session.expiresAt) {
      clearAuthSession()
      return false
    }
    return session.authenticated === true
  } catch {
    return false
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(AUTH_SESSION_KEY)
}


