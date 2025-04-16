'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Booking, Room, Guest } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { getDateFromAny, formatDateForInput } from '@/lib/utils';

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Booking>) => void;
  booking?: Booking;
  initialData?: Partial<Booking>;
  mode: 'create' | 'edit';
  rooms: Room[];
  guests: Guest[];
}

const BOOKING_STATUS = ['Confirmed', 'Cancelled', 'Completed'] as const;
const PAYMENT_STATUS = ['Pending', 'Paid', 'Refunded'] as const;

export function BookingDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  booking, 
  initialData = {},
  mode,
  rooms,
  guests 
}: BookingDialogProps) {
  // Initialize form data only once when the component mounts or when props change
  const [formData, setFormData] = useState<Partial<Booking>>(() => {
    // Create default values
    const defaultData: Partial<Booking> = {
      guestId: '',
      roomId: '',
      checkIn: Timestamp.fromDate(new Date()),
      checkOut: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      status: 'Confirmed' as const,
      totalAmount: 0,
      paymentStatus: 'Pending' as const
    };

    // Merge with initialData and booking
    return {
      ...defaultData,
      ...initialData,
      ...(booking || {}),
      // Ensure guestId is always a string
      guestId: booking?.guestId || initialData?.guestId || ''
    };
  });

  // Reset form data when booking or initialData changes
  useEffect(() => {
    // Create default values
    const defaultData: Partial<Booking> = {
      guestId: '',
      roomId: '',
      checkIn: Timestamp.fromDate(new Date()),
      checkOut: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      status: 'Confirmed' as const,
      totalAmount: 0,
      paymentStatus: 'Pending' as const
    };

    // Merge with initialData and booking
    setFormData({
      ...defaultData,
      ...initialData,
      ...(booking || {}),
      // Ensure guestId is always a string
      guestId: booking?.guestId || initialData?.guestId || ''
    });
  }, [booking, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Helper function to create Timestamp from date string
  const dateStringToTimestamp = (dateString: string) => {
    return Timestamp.fromDate(new Date(dateString));
  };

  // Calculate total amount when room or dates change
  useEffect(() => {
    if (formData.roomId && formData.checkIn && formData.checkOut) {
      const room = rooms.find(r => r.id === formData.roomId);
      if (room) {
        const checkInDate = getDateFromAny(formData.checkIn);
        const checkOutDate = getDateFromAny(formData.checkOut);
        
        if (!checkInDate || !checkOutDate) {
          console.error('Invalid date format for booking calculation');
          return;
        }
        
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Only update if the calculated amount is different
        if (room.price * nights !== formData.totalAmount) {
          setFormData(prev => ({
            ...prev,
            totalAmount: room.price * nights
          }));
        }
      }
    }
  }, [formData.roomId, formData.checkIn, formData.checkOut, rooms, formData.totalAmount]);

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Booking' : 'Edit Booking'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guest">Guest</Label>
            <Select
              value={formData.guestId || ''}
              onValueChange={(value) => handleFormChange('guestId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select guest" />
              </SelectTrigger>
              <SelectContent>
                {guests.map((guest) => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">Room</Label>
            <Select
              value={formData.roomId || ''}
              onValueChange={(value) => handleFormChange('roomId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.filter(room => room.status === 'Available').map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {`Room ${room.number} - ${room.type} ($${room.price}/night)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check In</Label>
              <Input
                id="checkIn"
                type="date"
                value={formData.checkIn ? formatDateForInput(formData.checkIn) : ''}
                onChange={(e) => handleFormChange('checkIn', dateStringToTimestamp(e.target.value))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check Out</Label>
              <Input
                id="checkOut"
                type="date"
                value={formData.checkOut ? formatDateForInput(formData.checkOut) : ''}
                onChange={(e) => handleFormChange('checkOut', dateStringToTimestamp(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Booking Status</Label>
            <Select
              value={formData.status || 'Confirmed'}
              onValueChange={(value) => handleFormChange('status', value as Booking['status'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {BOOKING_STATUS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Payment Status</Label>
            <Select
              value={formData.paymentStatus || 'Pending'}
              onValueChange={(value) => handleFormChange('paymentStatus', value as Booking['paymentStatus'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Amount</Label>
            <Input
              id="totalAmount"
              type="number"
              value={formData.totalAmount || 0}
              onChange={(e) => handleFormChange('totalAmount', Number(e.target.value))}
              disabled
            />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full">
              {mode === 'create' ? 'Create Booking' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 