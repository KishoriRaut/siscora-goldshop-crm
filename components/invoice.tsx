"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Printer, X } from "lucide-react"
import { type Sale, getCustomers, getInventory } from "@/lib/storage"
import { getShopInfo } from "@/lib/auth"

interface InvoiceProps {
  sale: Sale
  onClose: () => void
}

export function Invoice({ sale, onClose }: InvoiceProps) {
  const customer = getCustomers().find((c) => c.id === sale.customerId)
  const item = getInventory().find((i) => i.id === sale.itemId)
  const shopInfo = getShopInfo()

  const formatCurrency = (amount: number) => {
    return `NPR ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handlePrint = () => {
    window.print()
  }

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header with actions */}
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between" data-print-hide>
          <h2 className="text-xl font-semibold text-foreground">Bill / Invoice</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} size="sm" className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Invoice Content - Print friendly */}
        <div className="p-6 space-y-6 print:p-8" data-invoice-content>
          {/* Shop Header */}
          <div className="text-center border-b border-border pb-4">
            <h1 className="text-2xl font-bold text-foreground">{shopInfo?.shopName || "Siscora Gold"}</h1>
            <p className="text-muted-foreground">Smart Gold Shop Management</p>
            {shopInfo?.address && (
              <p className="text-sm text-muted-foreground mt-2">{shopInfo.address}</p>
            )}
          </div>

          {/* Bill Info */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Bill Number:</p>
              <p className="font-semibold text-foreground text-lg">#{sale.billNumber || sale.id.slice(-4)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Date:</p>
              <p className="font-medium text-foreground">
                {new Date(sale.createdAt).toLocaleDateString("en-NP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          {customer && (
            <div className="border-b border-border pb-4">
              <h3 className="font-semibold text-foreground mb-2">Customer Details:</h3>
              <div className="text-sm space-y-1">
                <p className="text-foreground">
                  <span className="text-muted-foreground">Name:</span> {customer.name}
                </p>
                {customer.phone && (
                  <p className="text-foreground">
                    <span className="text-muted-foreground">Phone:</span> {customer.phone}
                  </p>
                )}
                {customer.address && (
                  <p className="text-foreground">
                    <span className="text-muted-foreground">Address:</span> {customer.address}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Item Details */}
          <div className="border-b border-border pb-4">
            <h3 className="font-semibold text-foreground mb-3">Item Details:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item Name:</span>
                <span className="font-medium text-foreground">{sale.itemName}</span>
              </div>
              {item && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="text-foreground">{item.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Purity:</span>
                    <span className="text-foreground">{item.purity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="text-foreground">{item.weight}g</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="text-foreground">{sale.quantity}</span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-b border-border pb-4">
            <h3 className="font-semibold text-foreground mb-3">Price Breakdown:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gold Value:</span>
                <span className="text-foreground">
                  {formatCurrency(
                    sale.goldValue !== undefined
                      ? sale.goldValue
                      : sale.subtotal - (sale.makingCharges || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Making Charges (Karigar):</span>
                <span className="text-foreground">{formatCurrency(sale.makingCharges || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-foreground">{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="text-foreground">-{formatCurrency(sale.discount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="border-t-2 border-foreground pt-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold text-foreground">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(sale.totalAmount)}</span>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                <span className="text-sm font-medium text-foreground capitalize">
                  {sale.paymentMethod || "cash"}
                  {sale.paymentDetails && (
                    <span className="text-muted-foreground ml-1">({sale.paymentDetails})</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground space-y-1">
            <p>Thank you for your business!</p>
            <p>धन्यवाद!</p>
            <p className="mt-4">This is a computer-generated invoice.</p>
          </div>
        </div>
      </div>

    </div>
  )
}

