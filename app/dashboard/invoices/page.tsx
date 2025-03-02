'use client';

import React, { useState } from 'react';
import { collection, doc, Timestamp, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/use-toast';
import { Invoice, Booking, Guest, Room } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, Trash2 } from 'lucide-react';
import { deleteInvoice } from '@/lib/firebase';
import Link from 'next/link';

export default function InvoicesPage() {
  const { toast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Fetch invoices, bookings, rooms, and guests
  const [invoicesSnapshot] = useCollection(collection(db, 'invoices'));
  const [bookingsSnapshot] = useCollection(collection(db, 'bookings'));
  const [roomsSnapshot] = useCollection(collection(db, 'rooms'));
  const [guestsSnapshot] = useCollection(collection(db, 'guests'));

  const invoices = invoicesSnapshot?.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as Invoice[] || [];

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

  const handleDeleteInvoice = async (invoice: Invoice) => {
    try {
      const result = await deleteInvoice(invoice.id);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: 'Success',
        description: 'Invoice deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to delete invoice: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<Invoice, any>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
    },
    {
      accessorKey: 'guestId',
      header: 'Guest',
      cell: ({ row }) => {
        const guest = guests.find(g => g.id === row.getValue('guestId'));
        return guest?.name || 'Unknown Guest';
      },
    },
    {
      accessorKey: 'issueDate',
      header: 'Issue Date',
      cell: ({ row }) => {
        const issueDate = row.getValue('issueDate') as Timestamp;
        return issueDate?.toDate().toLocaleDateString() || 'N/A';
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const dueDate = row.getValue('dueDate') as Timestamp;
        return dueDate?.toDate().toLocaleDateString() || 'N/A';
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: ({ row }) => {
        const invoice = row.original as Invoice;
        return `${invoice.currency} ${invoice.totalAmount.toFixed(2)}`;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const colors: Record<string, string> = {
          Draft: 'bg-gray-500/10 text-gray-500',
          Issued: 'bg-blue-500/10 text-blue-500',
          Paid: 'bg-green-500/10 text-green-500',
          Overdue: 'bg-red-500/10 text-red-500',
          Cancelled: 'bg-yellow-500/10 text-yellow-500',
        };
        return (
          <Badge className={colors[status] || ''}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const invoice = row.original as Invoice;
        return (
          <div className="flex gap-2">
            <Link href={`/dashboard/invoices/${invoice.id}`}>
              <Button
                variant="outline"
                size="icon"
                title="View Invoice"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="icon"
              title="Delete Invoice"
              onClick={() => handleDeleteInvoice(invoice)}
            >
              <Trash2 className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold">Invoices</h1>
          <Link href="/dashboard/bookings">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Manage Bookings
            </Button>
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={invoices}
          searchKey="invoiceNumber"
        />
      </div>
    </DashboardLayout>
  );
} 