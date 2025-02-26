'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { MenuItemDialog } from '@/components/restaurant/MenuItemDialog';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  mealPeriods: string[];
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  preparationTime: number;
  calories: number;
  image: string;
  isAvailable: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function MenuPage() {
  const [open, setOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null);
  const { toast } = useToast();

  // Fetch menu items
  const [menuItemsSnapshot] = useCollection(collection(db, 'menuItems'));

  const menuItems = menuItemsSnapshot?.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as MenuItem[] || [];

  const handleCreateMenuItem = async (data: Partial<MenuItem>) => {
    try {
      const now = Timestamp.now();
      await addDoc(collection(db, 'menuItems'), {
        ...data,
        createdAt: now,
        updatedAt: now
      });
      toast({
        title: 'Success',
        description: 'Menu item added successfully',
      });
      setOpen(false);
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add menu item',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateMenuItem = async (data: Partial<MenuItem>) => {
    if (!selectedItem) return;
    try {
      const itemRef = doc(db, 'menuItems', selectedItem.id);
      await updateDoc(itemRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      toast({
        title: 'Success',
        description: 'Menu item updated successfully',
      });
      setOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update menu item',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMenuItem = async (item: MenuItem) => {
    try {
      await deleteDoc(doc(db, 'menuItems', item.id));
      toast({
        title: 'Success',
        description: 'Menu item deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<MenuItem, any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
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
        return `$${price.toFixed(2)}`;
      },
    },
    {
      accessorKey: 'mealPeriods',
      header: 'Meal Periods',
      cell: ({ row }) => {
        const periods = row.getValue('mealPeriods') as string[];
        return (
          <div className="flex gap-1">
            {periods.map((period) => (
              <Badge key={period} variant="outline" className="text-xs">
                {period}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'isAvailable',
      header: 'Status',
      cell: ({ row }) => {
        const isAvailable = row.getValue('isAvailable') as boolean;
        return (
          <Badge className={isAvailable ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </Badge>
        );
      },
    },
    {
      id: 'dietary',
      header: 'Dietary',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex gap-1">
            {item.isVegetarian && (
              <Badge className="bg-green-500/10 text-green-500">Veg</Badge>
            )}
            {item.isVegan && (
              <Badge className="bg-green-500/10 text-green-500">Vegan</Badge>
            )}
            {item.isGlutenFree && (
              <Badge className="bg-blue-500/10 text-blue-500">GF</Badge>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original as MenuItem;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedItem(item);
                setOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteMenuItem(item)}
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
          <h1 className="text-3xl font-bold">Menu Items</h1>
          <Button onClick={() => {
            setSelectedItem(null);
            setOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={menuItems}
          searchKey="name"
        />

        <MenuItemDialog
          open={open}
          onOpenChange={setOpen}
          onSubmit={selectedItem ? handleUpdateMenuItem : handleCreateMenuItem}
          menuItem={selectedItem || undefined}
          mode={selectedItem ? 'edit' : 'create'}
        />
      </div>
    </DashboardLayout>
  );
} 