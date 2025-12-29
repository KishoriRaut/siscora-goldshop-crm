"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Lock, Eye, EyeOff } from "lucide-react"
import { getShopInfo, verifyPassword, setAuthSession } from "@/lib/auth"

interface LoginProps {
  onSuccess: () => void
}

export function Login({ onSuccess }: LoginProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const shopInfo = getShopInfo()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!password) {
      setError("Password is required")
      return
    }

    if (!shopInfo) {
      setError("Shop information not found. Please contact support.")
      return
    }

    setIsLoading(true)

    try {
      const isValid = await verifyPassword(password, shopInfo.passwordHash)

      if (isValid) {
        // Set authentication session
        setAuthSession()
        onSuccess()
      } else {
        setError("Incorrect password. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-md p-4 sm:p-6 md:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">Gold Shop CRM</h1>
          {shopInfo && (
            <div className="mt-4">
              <p className="text-sm font-medium text-foreground">{shopInfo.shopName}</p>
              <p className="text-xs text-muted-foreground mt-1">{shopInfo.address}</p>
            </div>
          )}
          <p className="text-muted-foreground mt-4">Enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password *
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                placeholder="Enter your password"
                className={error ? "border-destructive pr-10" : "pr-10"}
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Secure access to your gold shop management system
        </p>
      </Card>
    </div>
  )
}


