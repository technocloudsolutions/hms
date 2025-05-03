'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { GuestDialog } from '@/components/guests/GuestDialog';
import { useToast } from '@/components/ui/use-toast';
import { Guest } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function GuestsPage() {
  const [open, setOpen] = React.useState(false);
  const [selectedGuest, setSelectedGuest] = React.useState<Guest | null>(null);
  const { toast } = useToast();

  // Fetch guests
  const [guestsSnapshot] = useCollection(collection(db, 'guests'));

  const guests = guestsSnapshot?.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as Guest[] || [];

  const handleCreateGuest = async (data: Partial<Guest>) => {
    try {
      const now = Timestamp.now();
      await addDoc(collection(db, 'guests'), {
        ...data,
        createdAt: now,
        updatedAt: now
      });
      toast({
        title: 'Success',
        description: 'Guest added successfully',
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add guest',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateGuest = async (data: Partial<Guest>) => {
    if (!selectedGuest) return;
    try {
      const guestRef = doc(db, 'guests', selectedGuest.id);
      await updateDoc(guestRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      toast({
        title: 'Success',
        description: 'Guest updated successfully',
      });
      setOpen(false);
      setSelectedGuest(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update guest',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGuest = async (guest: Guest) => {
    try {
      await deleteDoc(doc(db, 'guests', guest.id));
      toast({
        title: 'Success',
        description: 'Guest deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete guest',
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<Guest, any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      accessorKey: 'address',
      header: 'Address',
    },
    {
      accessorKey: 'country',
      header: 'Country',
    },
    {
      accessorKey: 'idType',
      header: 'ID Type',
    },
    {
      accessorKey: 'idNumber',
      header: 'ID Number',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt') as Timestamp;
        return createdAt?.toDate().toLocaleDateString() || 'N/A';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const guest = row.original as Guest;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedGuest(guest);
                setOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteGuest(guest)}
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
          <h1 className="text-3xl font-bold">Guests</h1>
          <Button onClick={() => {
            setSelectedGuest(null);
            setOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Guest
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={guests}
          searchKey="name"
        />

        <GuestDialog
          open={open}
          onOpenChange={setOpen}
          onSubmit={selectedGuest ? handleUpdateGuest : handleCreateGuest}
          guest={selectedGuest || undefined}
          mode={selectedGuest ? 'edit' : 'create'}
        />
      </div>
    </DashboardLayout>
  );
} 