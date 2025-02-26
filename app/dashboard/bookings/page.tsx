'use client';

import React, { useEffect, Suspense } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { BookingDialog } from '@/components/bookings/BookingDialog';
import { useToast } from '@/components/ui/use-toast';
import { Booking, Room, Guest } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Loading component for Suspense
function BookingsLoading() {
  return <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>;
}

// Main component wrapped in Suspense
function BookingsContent() {
  const [open, setOpen] = React.useState(false);
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [initialBookingData, setInitialBookingData] = React.useState<Partial<Booking>>({});
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Fetch bookings, rooms, and guests
  const [bookingsSnapshot] = useCollection(collection(db, 'bookings'));
  const [roomsSnapshot] = useCollection(collection(db, 'rooms'));
  const [guestsSnapshot] = useCollection(collection(db, 'guests'));

  const bookings = bookingsSnapshot?.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as Booking[] || [];

  const rooms = roomsSnapshot?.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as Room[] || [];

  const guests = guestsSnapshot?.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as Guest[] || [];

  // Handle URL parameters
  useEffect(() => {
    const action = searchParams.get('action');
    const date = searchParams.get('date');
    const id = searchParams.get('id');

    if (action === 'new') {
      // Create a new booking
      let newBookingData: Partial<Booking> = {};
      
      // If date is provided, set it as check-in date
      if (date) {
        const checkInDate = new Date(date);
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + 1);
        
        newBookingData = {
          checkIn: Timestamp.fromDate(checkInDate),
          checkOut: Timestamp.fromDate(checkOutDate)
        };
        
        setInitialBookingData(newBookingData);
      }
      
      setSelectedBooking(null);
      setOpen(true);
    } else if (id) {
      // Edit an existing booking
      const booking = bookings.find(b => b.id === id);
      if (booking) {
        setSelectedBooking(booking);
        setInitialBookingData({});
        setOpen(true);
      }
    }
  }, [bookings, searchParams]);

  const handleCreateBooking = async (data: Partial<Booking>) => {
    try {
      const now = Timestamp.now();
      await addDoc(collection(db, 'bookings'), {
        ...data,
        createdAt: now,
        updatedAt: now
      });
      toast({
        title: 'Success',
        description: 'Booking created successfully',
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create booking',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateBooking = async (data: Partial<Booking>) => {
    if (!selectedBooking) return;
    try {
      const bookingRef = doc(db, 'bookings', selectedBooking.id);
      await updateDoc(bookingRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      toast({
        title: 'Success',
        description: 'Booking updated successfully',
      });
      setOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update booking',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    try {
      await deleteDoc(doc(db, 'bookings', booking.id));
      toast({
        title: 'Success',
        description: 'Booking deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete booking',
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<Booking, any>[] = [
    {
      accessorKey: 'guestId',
      header: 'Guest',
      cell: ({ row }) => {
        const guest = guests.find(g => g.id === row.getValue('guestId'));
        return guest?.name || 'Unknown Guest';
      },
    },
    {
      accessorKey: 'roomId',
      header: 'Room',
      cell: ({ row }) => {
        const room = rooms.find(r => r.id === row.getValue('roomId'));
        return room ? `Room ${room.number} - ${room.type}` : 'Unknown Room';
      },
    },
    {
      accessorKey: 'checkIn',
      header: 'Check In',
      cell: ({ row }) => {
        const checkIn = row.getValue('checkIn') as Timestamp;
        return checkIn?.toDate().toLocaleDateString() || 'N/A';
      },
    },
    {
      accessorKey: 'checkOut',
      header: 'Check Out',
      cell: ({ row }) => {
        const checkOut = row.getValue('checkOut') as Timestamp;
        return checkOut?.toDate().toLocaleDateString() || 'N/A';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment Status',
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => {
        const amount = row.getValue('totalAmount');
        return amount ? `$${amount}` : 'N/A';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const booking = row.original as Booking;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedBooking(booking);
                setOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteBooking(booking)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Bookings</h1>
          <div className="flex gap-2">
            <Link href="/dashboard/bookings/calendar">
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar View
              </Button>
            </Link>
            <Button onClick={() => {
              setSelectedBooking(null);
              setOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Booking
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={bookings}
          searchKey="guestId"
        />

        <BookingDialog
          open={open}
          onOpenChange={setOpen}
          onSubmit={selectedBooking ? handleUpdateBooking : handleCreateBooking}
          booking={selectedBooking || undefined}
          initialData={initialBookingData}
          mode={selectedBooking ? 'edit' : 'create'}
          rooms={rooms}
          guests={guests}
        />
      </div>
    </DashboardLayout>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<BookingsLoading />}>
      <BookingsContent />
    </Suspense>
  );
} 