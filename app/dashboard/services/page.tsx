'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ServiceDialog } from '@/components/services/ServiceDialog';
import { useToast } from '@/components/ui/use-toast';
import { Service } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';

export default function ServicesPage() {
  const [open, setOpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<Service | null>(null);
  const { toast } = useToast();

  // Fetch services
  const [servicesSnapshot] = useCollection(collection(db, 'services'));

  const services = servicesSnapshot?.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as Service[] || [];

  const handleCreateService = async (data: Partial<Service>) => {
    try {
      const now = Timestamp.now();
      await addDoc(collection(db, 'services'), {
        ...data,
        createdAt: now,
        updatedAt: now
      });
      toast({
        title: 'Success',
        description: 'Service added successfully',
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add service',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateService = async (data: Partial<Service>) => {
    if (!selectedService) return;
    try {
      const serviceRef = doc(db, 'services', selectedService.id);
      await updateDoc(serviceRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      toast({
        title: 'Success',
        description: 'Service updated successfully',
      });
      setOpen(false);
      setSelectedService(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update service',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteService = async (service: Service) => {
    try {
      await deleteDoc(doc(db, 'services', service.id));
      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<Service, any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as string;
        return (
          <Badge variant="outline">
            {category}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const price = row.getValue('price') as number;
        return `$${price}`;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as Service['status'];
        return (
          <Badge className={status === 'Available' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const service = row.original as Service;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedService(service);
                setOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteService(service)}
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
          <h1 className="text-3xl font-bold">Services</h1>
          <Button onClick={() => {
            setSelectedService(null);
            setOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={services}
          searchKey="name"
        />

        <ServiceDialog
          open={open}
          onOpenChange={setOpen}
          onSubmit={selectedService ? handleUpdateService : handleCreateService}
          service={selectedService || undefined}
          mode={selectedService ? 'edit' : 'create'}
        />
      </div>
    </DashboardLayout>
  );
} 