"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Download,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import {
  getCurrentPhysicalInventoryCounts,
  clearCurrentPhysicalInventoryCounts,
  getPhysicalInventoryReports,
  addPhysicalInventoryReport,
  type PhysicalInventoryReport,
  type PhysicalInventoryCount,
  getInventory,
} from "@/lib/storage"
import { toast } from "sonner"

export function PhysicalInventory() {
  const [currentCounts, setCurrentCounts] = useState<PhysicalInventoryCount[]>([])
  const [reports, setReports] = useState<PhysicalInventoryReport[]>([])
  const [selectedReport, setSelectedReport] = useState<PhysicalInventoryReport | null>(null)
  const [reportName, setReportName] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const counts = getCurrentPhysicalInventoryCounts()
    const allReports = getPhysicalInventoryReports()
    setCurrentCounts(counts)
    setReports(allReports.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()))
  }

  const generateReport = () => {
    if (currentCounts.length === 0) {
      toast.error("No scanned items to generate report from")
      return
    }

    const name = reportName.trim() || `Physical Inventory - ${new Date().toLocaleDateString()}`
    const totalItemsScanned = currentCounts.reduce((sum, item) => sum + item.scannedQuantity, 0)
    const totalItemsExpected = currentCounts.reduce((sum, item) => sum + item.expectedQuantity, 0)
    const itemsWithDiscrepancy = currentCounts.filter((item) => item.discrepancy !== 0).length

    const report: PhysicalInventoryReport = {
      id: Date.now().toString(),
      reportDate: new Date().toISOString(),
      totalItemsScanned,
      totalItemsExpected,
      itemsWithDiscrepancy,
      counts: [...currentCounts],
      createdAt: new Date().toISOString(),
    }

    addPhysicalInventoryReport(report)
    clearCurrentPhysicalInventoryCounts()
    setReportName("")
    loadData()
    toast.success("Report generated successfully")
  }

  const exportReport = (report: PhysicalInventoryReport) => {
    const inventory = getInventory()
    const reportData = report.counts.map((count) => {
      const item = inventory.find((inv) => inv.id === count.itemId)
      return {
        "Item Name": count.itemName,
        "Item Type": item?.type || "N/A",
        "Metal Type": item?.metalType || "N/A",
        "Purity": item?.purity || "N/A",
        "Weight (g)": item?.weight || 0,
        "Expected Quantity": count.expectedQuantity,
        "Scanned Quantity": count.scannedQuantity,
        "Discrepancy": count.discrepancy,
        "Status": count.discrepancy === 0 ? "Match" : count.discrepancy > 0 ? "Over" : "Short",
      }
    })

    // Create CSV content
    const headers = Object.keys(reportData[0])
    const csvContent = [
      headers.join(","),
      ...reportData.map((row) => headers.map((header) => `"${row[header as keyof typeof row]}"`).join(",")),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `physical-inventory-${report.reportDate.split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Report exported successfully")
  }

  const formatCurrency = (amount: number) => {
    return `NPR ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Physical Inventory Reports</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Generate and manage physical inventory count reports
          </p>
        </div>
      </div>

      {/* Current Counts Summary */}
      {currentCounts.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Current Scan Session</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Items Scanned</p>
              <p className="text-2xl font-semibold text-foreground">
                {currentCounts.reduce((sum, item) => sum + item.scannedQuantity, 0)}
              </p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Items Expected</p>
              <p className="text-2xl font-semibold text-foreground">
                {currentCounts.reduce((sum, item) => sum + item.expectedQuantity, 0)}
              </p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">With Discrepancy</p>
              <p className="text-2xl font-semibold text-foreground">
                {currentCounts.filter((item) => item.discrepancy !== 0).length}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Report name (optional)"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={generateReport} className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
          </div>
        </Card>
      )}

      {/* Reports List */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Inventory Reports</h3>
        {reports.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No reports generated yet. Scan items using QR Scanner to create a report.
          </p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="font-semibold text-foreground">{formatDate(report.reportDate)}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Items Scanned</p>
                        <p className="font-medium text-foreground">{report.totalItemsScanned}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Items Expected</p>
                        <p className="font-medium text-foreground">{report.totalItemsExpected}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">With Discrepancy</p>
                        <p className="font-medium text-foreground">{report.itemsWithDiscrepancy}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Items</p>
                        <p className="font-medium text-foreground">{report.counts.length}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      exportReport(report)
                    }}
                    className="flex items-center gap-2 ml-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>

                {/* Expanded Report Details */}
                {selectedReport?.id === report.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="font-semibold text-foreground mb-3">Report Details</h4>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {report.counts.map((count) => {
                        const item = getInventory().find((inv) => inv.id === count.itemId)
                        return (
                          <div
                            key={count.id}
                            className="p-3 bg-background rounded-lg flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{count.itemName}</p>
                              {item && (
                                <p className="text-sm text-muted-foreground">
                                  {item.type} | {item.metalType === "gold" ? "Gold" : "Silver"} {item.purity} |{" "}
                                  {item.weight}g
                                </p>
                              )}
                              <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                <span>
                                  Expected: <span className="font-medium text-foreground">{count.expectedQuantity}</span>
                                </span>
                                <span>
                                  Scanned: <span className="font-medium text-foreground">{count.scannedQuantity}</span>
                                </span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              {count.discrepancy === 0 ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-sm font-medium">Match</span>
                                </div>
                              ) : count.discrepancy > 0 ? (
                                <div className="flex items-center gap-1 text-yellow-600">
                                  <TrendingUp className="w-4 h-4" />
                                  <span className="text-sm font-medium">+{count.discrepancy} Over</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-red-600">
                                  <TrendingDown className="w-4 h-4" />
                                  <span className="text-sm font-medium">{count.discrepancy} Short</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

