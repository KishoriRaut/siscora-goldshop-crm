"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Phone, Mail } from "lucide-react"
import { getCustomers, saveCustomers, type Customer } from "@/lib/storage"

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  })

  useEffect(() => {
    setCustomers(getCustomers())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
    }
    const updatedCustomers = [...customers, newCustomer]
    saveCustomers(updatedCustomers)
    setCustomers(updatedCustomers)
    setFormData({ name: "", phone: "", email: "", address: "" })
    setShowForm(false)
  }

  const filteredCustomers = customers.filter(
    (customer) => customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.phone.includes(searchTerm),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Customers</h2>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">New Customer</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save Customer</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <div className="mb-4">
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

        <div className="space-y-3">
          {filteredCustomers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No customers found</p>
          ) : (
            filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-4 bg-secondary rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{customer.name}</p>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                      )}
                      {customer.address && <p>{customer.address}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(customer.createdAt).toLocaleDateString("en-NP")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
