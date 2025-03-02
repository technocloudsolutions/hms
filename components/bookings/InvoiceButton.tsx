'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Receipt } from 'lucide-react';
import { InvoiceDialog } from './InvoiceDialog';
import { Booking, Guest, Room, Invoice } from '@/lib/types';
import { createInvoice, getInvoicesByBookingId } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';

interface InvoiceButtonProps {
  booking: Booking;
  guest?: Guest;
  room?: Room;
  onInvoiceCreated?: () => void;
}

const InvoiceButton = ({ booking, guest, room, onInvoiceCreated }: InvoiceButtonProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingInvoices, setExistingInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const handleClick = async () => {
    if (!guest || !room) return;
    
    setLoading(true);
    try {
      const invoices = await getInvoicesByBookingId(booking.id);
      setExistingInvoices(invoices);
      
      if (invoices.length > 0) {
        // Navigate to the first invoice if one exists
        router.push(`/dashboard/invoices/${invoices[0].id}`);
        return;
      }
      
      setOpen(true);
    } catch (error) {
      console.error('Error checking for existing invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to check for existing invoices',
        variant: 'destructive',
      });
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<Invoice>) => {
    if (!guest || !room) return;
    
    setLoading(true);
    try {
      await createInvoice({
        ...data,
        bookingId: booking.id,
        guestId: guest.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      } as Invoice);
      
      toast({
        title: 'Success',
        description: 'Invoice created successfully',
      });
      
      setOpen(false);
      if (onInvoiceCreated) {
        onInvoiceCreated();
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleClick}
        disabled={loading || !guest || !room}
      >
        <Receipt className="h-4 w-4 mr-2" />
        {existingInvoices.length > 0 ? 'View Invoice' : 'Issue Invoice'}
      </Button>
      
      {open && guest && room && (
        <InvoiceDialog
          open={open}
          onOpenChange={setOpen}
          onSubmit={handleSubmit}
          booking={booking}
          guest={guest}
          room={room}
          mode="create"
        />
      )}
    </>
  );
};

export default InvoiceButton; 