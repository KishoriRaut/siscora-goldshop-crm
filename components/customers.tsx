"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Phone, Mail, Edit, Trash2 } from "lucide-react"
import { getCustomers, saveCustomers, type Customer } from "@/lib/storage"
import { Pagination } from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: "customer" as "customer" | "seller" | "both",
  })

  useEffect(() => {
    setCustomers(getCustomers())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingCustomer) {
      // Update existing customer
      const updatedCustomers = customers.map((customer) =>
        customer.id === editingCustomer.id
          ? { ...customer, ...formData }
          : customer
      )
      saveCustomers(updatedCustomers)
      setCustomers(updatedCustomers)
      setEditingCustomer(null)
    } else {
      // Create new customer
      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      }
      const updatedCustomers = [...customers, newCustomer]
      saveCustomers(updatedCustomers)
      setCustomers(updatedCustomers)
    }
    
    setFormData({ name: "", phone: "", email: "", address: "", type: "customer" })
    setShowForm(false)
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      type: (customer.type || "customer") as "customer" | "seller" | "both",
    })
    setShowForm(true)
  }

  const handleDelete = () => {
    if (!deleteCustomer) return
    
    const updatedCustomers = customers.filter((c) => c.id !== deleteCustomer.id)
    saveCustomers(updatedCustomers)
    setCustomers(updatedCustomers)
    setDeleteCustomer(null)
  }

  const handleCancelEdit = () => {
    setEditingCustomer(null)
    setFormData({ name: "", phone: "", email: "", address: "", type: "customer" })
    setShowForm(false)
  }

  const filteredCustomers = customers.filter(
    (customer) => customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.phone.includes(searchTerm),
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex)

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Customers</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your customer database</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
            {editingCustomer ? "Edit Customer" : "New Customer"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone *</label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "customer" | "seller" | "both" })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="customer">Customer (Buyer)</option>
                  <option value="seller">Seller (Supplier)</option>
                  <option value="both">Both (Customer & Seller)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Customer: appears in Sales | Seller: appears in Purchases | Both: appears in both
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" className="w-full sm:w-auto">{editingCustomer ? "Update Customer" : "Save Customer"}</Button>
              <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4 sm:p-6">
        <div className="mb-3 sm:mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {paginatedCustomers.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 sm:py-8">No customers found</p>
          ) : (
            paginatedCustomers.map((customer) => (
              <div key={customer.id} className="p-3 sm:p-4 bg-secondary rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="font-semibold text-foreground break-words">{customer.name}</p>
                    <div className="flex flex-col gap-1 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 shrink-0" />
                        <span className="break-all">{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="break-all">{customer.email}</span>
                        </div>
                      )}
                      {customer.address && <p className="break-words">{customer.address}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:ml-4">
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {new Date(customer.createdAt).toLocaleDateString("en-NP")}
                    </p>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(customer)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCustomer(customer)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground sm:hidden mt-2">
                  {new Date(customer.createdAt).toLocaleDateString("en-NP")}
                </p>
              </div>
            ))
          )}
        </div>
        {filteredCustomers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredCustomers.length}
          />
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCustomer} onOpenChange={() => setDeleteCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteCustomer?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
