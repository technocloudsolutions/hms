'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Guest } from '@/lib/types';

interface GuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Guest>) => void;
  guest?: Guest;
  mode: 'create' | 'edit';
}

// Common countries list
const COMMON_COUNTRIES = [
  "Australia",
  "Canada",
  "China", 
  "France",
  "Germany",
  "India",
  "Italy",
  "Japan",
  "Russia",
  "Singapore",
  "South Korea",
  "Sri Lanka",
  "Thailand",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
];

export function GuestDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  guest, 
  mode 
}: GuestDialogProps) {
  const [formData, setFormData] = React.useState<Partial<Guest>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    idType: 'Passport',
    idNumber: '',
    ...guest
  });

  // Add this state to track if we're using a custom country
  const [isCustomCountry, setIsCustomCountry] = React.useState(false);

  // Initialize with proper state based on existing data
  React.useEffect(() => {
    if (guest && guest.country) {
      // Check if the guest's country is in our common list
      setIsCustomCountry(!COMMON_COUNTRIES.includes(guest.country));
    }
  }, [guest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Guest' : 'Edit Guest'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1234567890"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={!isCustomCountry ? formData.country || '' : 'other'}
              onValueChange={(value) => {
                if (value === 'other') {
                  setIsCustomCountry(true);
                  // Don't change the country value yet
                } else {
                  setIsCustomCountry(false);
                  setFormData({ ...formData, country: value });
                }
              }}
            >
              <SelectTrigger id="country">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
                <SelectItem value="other">Other (Specify)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCustomCountry && (
            <div className="space-y-2">
              <Label htmlFor="countryInput">Specify Country</Label>
              <Input
                id="countryInput"
                value={formData.country || ''}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    country: e.target.value,
                  });
                }}
                placeholder="Enter country name"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="idType">ID Type</Label>
              <Input
                id="idType"
                value={formData.idType}
                onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                placeholder="Passport"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                placeholder="AB123456"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full">
              {mode === 'create' ? 'Add Guest' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 