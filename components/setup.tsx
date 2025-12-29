"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Store, MapPin, Lock } from "lucide-react"
import { saveShopInfo, hashPassword, type ShopInfo } from "@/lib/auth"

interface SetupProps {
  onComplete: () => void
}

export function Setup({ onComplete }: SetupProps) {
  const [formData, setFormData] = useState({
    shopName: "",
    address: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.shopName.trim()) {
      newErrors.shopName = "Shop name is required"
    } else if (formData.shopName.trim().length < 2) {
      newErrors.shopName = "Shop name must be at least 2 characters"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "Address must be at least 5 characters"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    try {
      // Hash the password
      const passwordHash = await hashPassword(formData.password)

      // Save shop information
      const shopInfo: ShopInfo = {
        shopName: formData.shopName.trim(),
        address: formData.address.trim(),
        passwordHash,
        setupCompleted: true,
        setupDate: new Date().toISOString(),
      }

      saveShopInfo(shopInfo)

      // Set authentication session
      const { setAuthSession } = await import("@/lib/auth")
      setAuthSession()

      // Complete setup
      onComplete()
    } catch (error) {
      console.error("Setup error:", error)
      setErrors({ submit: "An error occurred. Please try again." })
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
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">Welcome to Gold Shop CRM</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Let's set up your shop information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Store className="w-4 h-4" />
              Shop Name *
            </label>
            <Input
              type="text"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              placeholder="Enter your shop name"
              className={errors.shopName ? "border-destructive" : ""}
              required
            />
            {errors.shopName && <p className="text-sm text-destructive mt-1">{errors.shopName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Shop Address *
            </label>
            <Input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter your shop address"
              className={errors.address ? "border-destructive" : ""}
              required
            />
            {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Create Password *
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter a secure password"
              className={errors.password ? "border-destructive" : ""}
              required
            />
            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
            <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirm Password *
            </label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm your password"
              className={errors.confirmPassword ? "border-destructive" : ""}
              required
            />
            {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
          </div>

          {errors.submit && <p className="text-sm text-destructive text-center">{errors.submit}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Setting up..." : "Complete Setup"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          This information will be used for invoices and reports
        </p>
      </Card>
    </div>
  )
}


