'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Invoice, InvoiceItem, Booking, Guest, Room } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { getExchangeRate } from '@/lib/firebase';
import { PlusCircle, Trash2 } from 'lucide-react';

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Invoice>) => void;
  invoice?: Invoice;
  booking: Booking;
  guest: Guest;
  room: Room;
  mode: 'create' | 'edit';
}

const INVOICE_STATUS = ['Draft', 'Issued', 'Paid', 'Overdue', 'Cancelled'] as const;
const PAYMENT_METHODS = ['Credit Card', 'Cash', 'Bank Transfer', 'PayPal'] as const;
const CURRENCIES = ['USD', 'LKR'] as const;
const ITEM_TYPES = ['Room', 'Service', 'Activity', 'Food', 'Other'] as const;

export function InvoiceDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  invoice, 
  booking,
  guest,
  room,
  mode 
}: InvoiceDialogProps) {
  // Initialize form data
  const [formData, setFormData] = useState<Partial<Invoice>>(() => {
    // Create default values
    const defaultData: Partial<Invoice> = {
      bookingId: booking.id,
      guestId: booking.guestId,
      issueDate: Timestamp.now(),
      dueDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Due in 7 days
      items: [
        {
          description: `Room ${room.number} - ${room.type}`,
          quantity: calculateNights(booking.checkIn, booking.checkOut),
          unitPrice: room.price,
          amount: calculateNights(booking.checkIn, booking.checkOut) * room.price,
          type: 'Room'
        }
      ],
      subtotal: calculateNights(booking.checkIn, booking.checkOut) * room.price,
      taxRate: 10, // Default 10% tax
      taxAmount: calculateNights(booking.checkIn, booking.checkOut) * room.price * 0.1,
      discountAmount: 0,
      totalAmount: calculateNights(booking.checkIn, booking.checkOut) * room.price * 1.1,
      currency: 'USD',
      status: 'Draft',
      notes: '',
    };

    // Merge with invoice if editing
    return {
      ...defaultData,
      ...(invoice || {})
    };
  });

  // State for exchange rate
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Reset form data when invoice changes
  useEffect(() => {
    if (invoice) {
      setFormData(invoice);
    } else {
      // Create default values
      const defaultData: Partial<Invoice> = {
        bookingId: booking.id,
        guestId: booking.guestId,
        issueDate: Timestamp.now(),
        dueDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Due in 7 days
        items: [
          {
            description: `Room ${room.number} - ${room.type}`,
            quantity: calculateNights(booking.checkIn, booking.checkOut),
            unitPrice: room.price,
            amount: calculateNights(booking.checkIn, booking.checkOut) * room.price,
            type: 'Room'
          }
        ],
        subtotal: calculateNights(booking.checkIn, booking.checkOut) * room.price,
        taxRate: 10, // Default 10% tax
        taxAmount: calculateNights(booking.checkIn, booking.checkOut) * room.price * 0.1,
        discountAmount: 0,
        totalAmount: calculateNights(booking.checkIn, booking.checkOut) * room.price * 1.1,
        currency: 'USD',
        status: 'Draft',
        notes: '',
      };
      setFormData(defaultData);
    }
  }, [invoice, booking, room]);

  // Calculate nights between check-in and check-out
  function calculateNights(checkIn: any, checkOut: any): number {
    try {
      let checkInDate: Date;
      let checkOutDate: Date;

      // Handle Firebase Timestamp objects
      if (checkIn && typeof checkIn.toDate === 'function') {
        checkInDate = checkIn.toDate();
      } else if (checkIn instanceof Date) {
        checkInDate = checkIn;
      } else if (typeof checkIn === 'string' || typeof checkIn === 'number') {
        checkInDate = new Date(checkIn);
      } else {
        console.error('Invalid checkIn date format:', checkIn);
        return 1; // Default to 1 night if invalid format
      }

      if (checkOut && typeof checkOut.toDate === 'function') {
        checkOutDate = checkOut.toDate();
      } else if (checkOut instanceof Date) {
        checkOutDate = checkOut;
      } else if (typeof checkOut === 'string' || typeof checkOut === 'number') {
        checkOutDate = new Date(checkOut);
      } else {
        console.error('Invalid checkOut date format:', checkOut);
        // Default to checkIn + 1 day if invalid format
        checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + 1);
      }

      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.error('Error calculating nights:', error);
      return 1; // Default to 1 night on error
    }
  }

  // Helper function to convert Timestamp to YYYY-MM-DD format
  const timestampToDateString = (timestamp: any): string => {
    try {
      // Handle Firebase Timestamp objects
      if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString().split('T')[0];
      }
      
      // Handle Date objects
      if (timestamp instanceof Date) {
        return timestamp.toISOString().split('T')[0];
      }
      
      // Handle string or number timestamps
      if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        return new Date(timestamp).toISOString().split('T')[0];
      }
      
      return '';
    } catch (error) {
      console.error('Error converting timestamp to date string:', error);
      return '';
    }
  };

  // Helper function to create Timestamp from date string
  const dateStringToTimestamp = (dateString: string) => {
    return Timestamp.fromDate(new Date(dateString));
  };

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle currency change
  const handleCurrencyChange = async (currency: 'USD' | 'LKR') => {
    setIsLoading(true);
    try {
      if (currency !== formData.currency) {
        const rate = await getExchangeRate(formData.currency as string, currency);
        setExchangeRate(rate);
        
        // Update all monetary values with the new currency
        const updatedItems = formData.items?.map(item => ({
          ...item,
          unitPrice: parseFloat((item.unitPrice * rate).toFixed(2)),
          amount: parseFloat((item.amount * rate).toFixed(2))
        })) || [];
        
        const updatedSubtotal = parseFloat(((formData.subtotal || 0) * rate).toFixed(2));
        const updatedTaxAmount = parseFloat(((formData.taxAmount || 0) * rate).toFixed(2));
        const updatedDiscountAmount = parseFloat(((formData.discountAmount || 0) * rate).toFixed(2));
        const updatedTotalAmount = parseFloat(((formData.totalAmount || 0) * rate).toFixed(2));
        
        setFormData(prev => ({
          ...prev,
          currency,
          exchangeRate: rate,
          items: updatedItems,
          subtotal: updatedSubtotal,
          taxAmount: updatedTaxAmount,
          discountAmount: updatedDiscountAmount,
          totalAmount: updatedTotalAmount
        }));
      }
    } catch (error) {
      console.error('Error updating currency:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new invoice item
  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      type: 'Other'
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  // Remove an invoice item
  const removeInvoiceItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index)
    }));
  };

  // Update an invoice item
  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => {
      const updatedItems = [...(prev.items || [])];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      
      // Recalculate amount if quantity or unitPrice changes
      if (field === 'quantity' || field === 'unitPrice') {
        updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].unitPrice;
      }
      
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  // Recalculate totals when items, tax rate, or discount changes
  useEffect(() => {
    if (formData.items) {
      const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = subtotal * (formData.taxRate || 0) / 100;
      const totalAmount = subtotal + taxAmount - (formData.discountAmount || 0);
      
      setFormData(prev => ({
        ...prev,
        subtotal,
        taxAmount,
        totalAmount
      }));
    }
  }, [formData.items, formData.taxRate, formData.discountAmount]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Invoice' : 'Edit Invoice'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guest">Guest</Label>
              <Input
                id="guest"
                value={guest.name}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                value={`Room ${room.number} - ${room.type}`}
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate ? timestampToDateString(formData.issueDate) : ''}
                onChange={(e) => handleFormChange('issueDate', dateStringToTimestamp(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate ? timestampToDateString(formData.dueDate) : ''}
                onChange={(e) => handleFormChange('dueDate', dateStringToTimestamp(e.target.value))}
                min={formData.issueDate ? timestampToDateString(formData.issueDate) : ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Invoice Status</Label>
              <Select
                value={formData.status || 'Draft'}
                onValueChange={(value) => handleFormChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency || 'USD'}
                onValueChange={(value) => handleCurrencyChange(value as 'USD' | 'LKR')}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Invoice Items</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addInvoiceItem}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto p-2 border rounded-md">
              {formData.items?.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-2">
                  <div className="col-span-4">
                    <Label htmlFor={`item-${index}-description`} className="text-xs">Description</Label>
                    <Input
                      id={`item-${index}-description`}
                      value={item.description}
                      onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`item-${index}-type`} className="text-xs">Type</Label>
                    <Select
                      value={item.type}
                      onValueChange={(value) => updateInvoiceItem(index, 'type', value)}
                    >
                      <SelectTrigger id={`item-${index}-type`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ITEM_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor={`item-${index}-quantity`} className="text-xs">Qty</Label>
                    <Input
                      id={`item-${index}-quantity`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`item-${index}-unitPrice`} className="text-xs">Unit Price</Label>
                    <Input
                      id={`item-${index}-unitPrice`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`item-${index}-amount`} className="text-xs">Amount</Label>
                    <Input
                      id={`item-${index}-amount`}
                      type="number"
                      value={item.amount}
                      disabled
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInvoiceItem(index)}
                      disabled={formData.items?.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.taxRate || 0}
                onChange={(e) => handleFormChange('taxRate', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountAmount">Discount Amount</Label>
              <Input
                id="discountAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.discountAmount || 0}
                onChange={(e) => handleFormChange('discountAmount', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subtotal">Subtotal</Label>
              <Input
                id="subtotal"
                type="number"
                value={formData.subtotal || 0}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxAmount">Tax Amount</Label>
              <Input
                id="taxAmount"
                type="number"
                value={formData.taxAmount || 0}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount ({formData.currency})</Label>
              <Input
                id="totalAmount"
                type="number"
                value={formData.totalAmount || 0}
                disabled
              />
            </div>
          </div>

          {formData.status === 'Paid' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod || ''}
                  onValueChange={(value) => handleFormChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate ? timestampToDateString(formData.paymentDate) : ''}
                  onChange={(e) => handleFormChange('paymentDate', dateStringToTimestamp(e.target.value))}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleFormChange('notes', e.target.value)}
              placeholder="Add any additional notes here..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : mode === 'create' ? 'Create Invoice' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 