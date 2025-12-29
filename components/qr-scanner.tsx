"use client"

import { useState, useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, Camera, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { parseQRCodeData } from "@/lib/qrcode"
import { getInventory, type InventoryItem } from "@/lib/storage"
import {
  getCurrentPhysicalInventoryCounts,
  saveCurrentPhysicalInventoryCounts,
  type PhysicalInventoryCount,
} from "@/lib/storage"
import { toast } from "sonner"

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedItems, setScannedItems] = useState<PhysicalInventoryCount[]>([])
  const [lastScannedItem, setLastScannedItem] = useState<{
    item: InventoryItem | null
    count: PhysicalInventoryCount | null
  } | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<"prompt" | "granted" | "denied" | "unknown">("unknown")
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const scannerId = "qr-reader"

  const checkPermissionStatus = async () => {
    if (typeof window === "undefined") return

    // Check if Permissions API is available
    if ("permissions" in navigator) {
      try {
        const result = await navigator.permissions.query({ name: "camera" as PermissionName })
        setPermissionStatus(result.state as "granted" | "denied" | "prompt")
        
        // Listen for permission changes
        result.onchange = () => {
          setPermissionStatus(result.state as "granted" | "denied" | "prompt")
          if (result.state === "granted") {
            setCameraError(null)
          }
        }
      } catch (error) {
        // Permissions API might not support 'camera' query in all browsers
        setPermissionStatus("unknown")
      }
    } else {
      setPermissionStatus("unknown")
    }

    // Check if camera is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
        setCameraError(
          "Camera access requires HTTPS. Please access this app via HTTPS or localhost for camera functionality."
        )
        setPermissionStatus("denied")
      } else {
        setCameraError("Camera access is not supported in this browser.")
        setPermissionStatus("denied")
      }
    }
  }

  useEffect(() => {
    // Load existing counts
    const counts = getCurrentPhysicalInventoryCounts()
    setScannedItems(counts)

    // Check permission status
    checkPermissionStatus()

    return () => {
      // Cleanup on unmount
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            html5QrCodeRef.current = null
          })
          .catch(() => {
            // Ignore errors during cleanup
          })
      }
    }
  }, [])

  const checkCameraPermission = async (): Promise<boolean> => {
    try {
      // Check if we're in a secure context (HTTPS or localhost)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          "Camera access is not available. Please use HTTPS or localhost. Some browsers require secure connections for camera access."
        )
        setPermissionStatus("denied")
        return false
      }

      // Try to get camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      // If successful, stop the stream immediately (we just needed permission)
      stream.getTracks().forEach((track) => track.stop())
      setCameraError(null)
      setPermissionStatus("granted")
      await checkPermissionStatus() // Update permission status
      return true
    } catch (error: any) {
      console.error("Camera permission error:", error)
      
      let errorMessage = ""
      let showInstructions = true
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setPermissionStatus("denied")
        errorMessage = "Camera permission was denied. "
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage = "No camera found on this device."
        showInstructions = false
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage = "Camera is already in use by another application. Please close other apps using the camera."
        showInstructions = false
      } else if (error.name === "OverconstrainedError" || error.name === "ConstraintNotSatisfiedError") {
        errorMessage = "Camera doesn't support the required settings. Trying alternative camera..."
        // Will try without facingMode constraint
        return true // Allow to continue with fallback
      } else {
        errorMessage = `Error: ${error.message || "Unknown error"}`
      }
      
      if (showInstructions) {
        errorMessage += getBrowserSpecificInstructions()
      }
      
      setCameraError(errorMessage)
      return false
    }
  }

  const getBrowserSpecificInstructions = (): string => {
    const userAgent = navigator.userAgent.toLowerCase()
    let instructions = "\n\nHow to enable camera access:\n"
    
    if (userAgent.includes("chrome")) {
      instructions += "• Click the camera icon (🚫 or 📷) in the address bar\n"
      instructions += "• Select 'Allow' for camera access\n"
      instructions += "• Or go to Settings > Privacy and security > Site settings > Camera\n"
    } else if (userAgent.includes("firefox")) {
      instructions += "• Click the camera icon in the address bar\n"
      instructions += "• Select 'Allow' for camera access\n"
      instructions += "• Or go to Settings > Privacy & Security > Permissions > Camera\n"
    } else if (userAgent.includes("safari")) {
      instructions += "• Go to Safari > Settings > Websites > Camera\n"
      instructions += "• Find this website and select 'Allow'\n"
      instructions += "• Or click the camera icon in the address bar\n"
    } else if (userAgent.includes("edge")) {
      instructions += "• Click the camera icon in the address bar\n"
      instructions += "• Select 'Allow' for camera access\n"
      instructions += "• Or go to Settings > Site permissions > Camera\n"
    } else {
      instructions += "• Look for camera permission in your browser settings\n"
      instructions += "• Allow camera access for this website\n"
    }
    
    instructions += "• Refresh the page after granting permission"
    
    return instructions
  }

  const requestPermissionManually = async () => {
    setIsRequestingPermission(true)
    setCameraError(null)
    
    try {
      const hasPermission = await checkCameraPermission()
      if (hasPermission) {
        // Permission granted, start scanner directly
        await startScannerAfterPermission()
      }
    } catch (error) {
      console.error("Error requesting permission:", error)
    } finally {
      setIsRequestingPermission(false)
    }
  }

  const startScanning = async () => {
    try {
      setCameraError(null)
      setIsRequestingPermission(true)

      // First, check and request camera permission
      const hasPermission = await checkCameraPermission()
      if (!hasPermission) {
        setIsRequestingPermission(false)
        return
      }

      // Permission granted, start the scanner
      await startScannerAfterPermission()
    } catch (error: any) {
      console.error("Error in startScanning:", error)
      setIsRequestingPermission(false)
      setCameraError("Failed to start scanner. " + (error.message || "Please try again."))
      toast.error("Failed to start scanner. See instructions below.")
    }
  }

  const startScannerAfterPermission = async () => {
    const html5QrCode = new Html5Qrcode(scannerId)
    html5QrCodeRef.current = html5QrCode

    try {

      // Try with back camera first
      try {
        await html5QrCode.start(
          { facingMode: "environment" }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            handleQRCodeScanned(decodedText)
          },
          (errorMessage) => {
            // Ignore scanning errors (they're frequent during scanning)
          }
        )
      } catch (startError: any) {
        // If back camera fails, try any available camera
        if (startError.name === "NotAllowedError" || startError.name === "OverconstrainedError") {
          console.log("Back camera not available, trying any camera...")
          await html5QrCode.start(
            { facingMode: "user" }, // Try front camera
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              handleQRCodeScanned(decodedText)
            },
            (errorMessage) => {
              // Ignore scanning errors
            }
          )
        } else {
          throw startError
        }
      }

      setIsScanning(true)
      setIsRequestingPermission(false)
      setCameraError(null)
      setPermissionStatus("granted")
      toast.success("QR Scanner started. Point camera at QR code.")
    } catch (error: any) {
      console.error("Error starting scanner:", error)
      setIsRequestingPermission(false)
      
      let errorMessage = "Failed to start camera. "
      if (error.name === "NotAllowedError") {
        setPermissionStatus("denied")
        errorMessage = "Camera permission denied. " + getBrowserSpecificInstructions()
      } else if (error.message) {
        errorMessage += error.message
      } else {
        errorMessage += "Please check your camera permissions and try again."
      }
      
      setCameraError(errorMessage)
      toast.error("Failed to start camera. See instructions below.")
      throw error // Re-throw so startScanning can handle it
    }
  }

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
        html5QrCodeRef.current = null
        setIsScanning(false)
        toast.info("Scanner stopped")
      } catch (error) {
        console.error("Error stopping scanner:", error)
      }
    }
  }

  const handleQRCodeScanned = (qrData: string) => {
    try {
      const parsedData = parseQRCodeData(qrData)
      if (!parsedData || !parsedData.id) {
        toast.error("Invalid QR code format")
        return
      }

      const inventory = getInventory()
      const item = inventory.find((inv) => inv.id === parsedData.id)

      if (!item) {
        toast.error("Item not found in inventory")
        setLastScannedItem({ item: null, count: null })
        return
      }

      // Check if already scanned
      const existingCount = scannedItems.find((count) => count.itemId === item.id)

      let updatedCount: PhysicalInventoryCount
      if (existingCount) {
        // Increment quantity
        updatedCount = {
          ...existingCount,
          scannedQuantity: existingCount.scannedQuantity + 1,
          discrepancy: existingCount.scannedQuantity + 1 - existingCount.expectedQuantity,
          scannedAt: new Date().toISOString(),
        }
        const updatedItems = scannedItems.map((count) =>
          count.itemId === item.id ? updatedCount : count
        )
        setScannedItems(updatedItems)
        saveCurrentPhysicalInventoryCounts(updatedItems)
      } else {
        // First scan of this item
        updatedCount = {
          id: Date.now().toString(),
          itemId: item.id,
          itemName: item.name,
          scannedQuantity: 1,
          expectedQuantity: item.quantity,
          discrepancy: 1 - item.quantity,
          scannedAt: new Date().toISOString(),
        }
        const updatedItems = [...scannedItems, updatedCount]
        setScannedItems(updatedItems)
        saveCurrentPhysicalInventoryCounts(updatedItems)
      }

      setLastScannedItem({ item, count: updatedCount })
      toast.success(`Scanned: ${item.name} (${updatedCount.scannedQuantity} total)`)
    } catch (error) {
      console.error("Error processing QR code:", error)
      toast.error("Error processing QR code")
    }
  }

  const clearScannedItems = () => {
    if (confirm("Are you sure you want to clear all scanned items?")) {
      setScannedItems([])
      saveCurrentPhysicalInventoryCounts([])
      setLastScannedItem(null)
      toast.success("Scanned items cleared")
    }
  }

  const formatCurrency = (amount: number) => {
    return `NPR ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">QR Code Scanner</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Scan QR codes to count physical inventory
          </p>
        </div>
        <div className="flex gap-2">
          {!isScanning ? (
            <Button 
              onClick={startScanning} 
              className="flex items-center gap-2"
              disabled={isRequestingPermission}
            >
              <Camera className="w-4 h-4" />
              {isRequestingPermission ? "Requesting Permission..." : "Start Scanning"}
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="destructive" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Stop Scanning
            </Button>
          )}
          {scannedItems.length > 0 && (
            <Button onClick={clearScannedItems} variant="outline" className="flex items-center gap-2">
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Scanner View */}
      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Camera Error Message */}
          {cameraError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-destructive mb-1">Camera Access Error</p>
                  <p className="text-sm text-destructive/90 whitespace-pre-line">{cameraError}</p>
                  {permissionStatus === "denied" && (
                    <div className="mt-3">
                      <Button
                        onClick={requestPermissionManually}
                        variant="outline"
                        size="sm"
                        disabled={isRequestingPermission}
                        className="w-full sm:w-auto"
                      >
                        {isRequestingPermission ? "Requesting..." : "Request Camera Permission Again"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Permission Status Indicator */}
          {!cameraError && permissionStatus !== "unknown" && (
            <div className={`p-3 rounded-lg text-sm ${
              permissionStatus === "granted" 
                ? "bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400"
                : permissionStatus === "denied"
                ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                : "bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400"
            }`}>
              <div className="flex items-center gap-2">
                {permissionStatus === "granted" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : permissionStatus === "denied" ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>
                  Camera permission: <strong>{permissionStatus === "granted" ? "Granted" : permissionStatus === "denied" ? "Denied" : "Not set"}</strong>
                </span>
              </div>
            </div>
          )}

          <div className="relative">
            <div
              id={scannerId}
              className={`w-full ${isScanning ? "min-h-[300px]" : "min-h-[200px] bg-secondary rounded-lg flex items-center justify-center"}`}
            >
              {!isScanning && !isRequestingPermission && (
                <div className="text-center text-muted-foreground">
                  <QrCode className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Click "Start Scanning" to begin</p>
                  {!cameraError && (
                    <p className="text-xs mt-2 opacity-75">
                      You'll be asked to allow camera access
                    </p>
                  )}
                </div>
              )}
              {isRequestingPermission && (
                <div className="text-center text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-2 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p>Requesting camera permission...</p>
                </div>
              )}
            </div>
          </div>

          {/* Last Scanned Item Info */}
          {lastScannedItem && lastScannedItem.item && (
            <Card className="p-4 bg-primary/10 border-primary/20">
              <div className="flex items-start gap-3">
                {lastScannedItem.count && lastScannedItem.count.discrepancy === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                ) : lastScannedItem.count && lastScannedItem.count.discrepancy > 0 ? (
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{lastScannedItem.item.name}</p>
                  <p className="text-sm text-muted-foreground">{lastScannedItem.item.type}</p>
                  {lastScannedItem.count && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Scanned: </span>
                        <span className="font-medium">{lastScannedItem.count.scannedQuantity}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expected: </span>
                        <span className="font-medium">{lastScannedItem.count.expectedQuantity}</span>
                      </div>
                      {lastScannedItem.count.discrepancy !== 0 && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Discrepancy: </span>
                          <span
                            className={`font-medium ${
                              lastScannedItem.count.discrepancy > 0
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {lastScannedItem.count.discrepancy > 0 ? "+" : ""}
                            {lastScannedItem.count.discrepancy}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </Card>

      {/* Scanned Items Summary */}
      {scannedItems.length > 0 && (
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Scanned Items ({scannedItems.length})
            </h3>
            <div className="text-sm text-muted-foreground">
              Total Scanned: {scannedItems.reduce((sum, item) => sum + item.scannedQuantity, 0)}
            </div>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {scannedItems.map((count) => {
              const item = getInventory().find((inv) => inv.id === count.itemId)
              return (
                <div
                  key={count.id}
                  className="p-3 bg-secondary rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{count.itemName}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>
                        Scanned: <span className="font-medium text-foreground">{count.scannedQuantity}</span>
                      </span>
                      <span>
                        Expected: <span className="font-medium text-foreground">{count.expectedQuantity}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {count.discrepancy === 0 ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Match</span>
                      </div>
                    ) : (
                      <div
                        className={`flex items-center gap-1 ${
                          count.discrepancy > 0 ? "text-yellow-600" : "text-red-600"
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {count.discrepancy > 0 ? "+" : ""}
                          {count.discrepancy}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

