'use client';

import React from 'react';
import { Plus, ImageIcon } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ActivityDialog } from '@/components/activities/ActivityDialog';
import { useToast } from '@/components/ui/use-toast';
import { Activity } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function ActivitiesPage() {
  const [open, setOpen] = React.useState(false);
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);
  const { toast } = useToast();

  // Fetch activities
  const [activitiesSnapshot] = useCollection(collection(db, 'activities'));

  const activities = activitiesSnapshot?.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as Activity[] || [];

  const handleCreateActivity = async (data: Partial<Activity>) => {
    try {
      const now = Timestamp.now();
      await addDoc(collection(db, 'activities'), {
        ...data,
        createdAt: now,
        updatedAt: now
      });
      toast({
        title: 'Success',
        description: 'Activity added successfully',
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add activity',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateActivity = async (data: Partial<Activity>) => {
    if (!selectedActivity) return;
    try {
      const activityRef = doc(db, 'activities', selectedActivity.id);
      await updateDoc(activityRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      toast({
        title: 'Success',
        description: 'Activity updated successfully',
      });
      setOpen(false);
      setSelectedActivity(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update activity',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteActivity = async (activity: Activity) => {
    try {
      await deleteDoc(doc(db, 'activities', activity.id));
      toast({
        title: 'Success',
        description: 'Activity deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete activity',
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<Activity, any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return (
          <Badge variant="outline">
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'duration',
      header: 'Duration & Price',
      cell: ({ row }) => {
        const activity = row.original;
        return (
          <div className="flex flex-col">
            <span>{activity.duration} hours</span>
            <span className="text-sm text-muted-foreground">${activity.price}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => {
        const activity = row.original;
        return (
          <div className="flex flex-col">
            <span>{activity.location}</span>
            <span className="text-sm text-muted-foreground">{activity.distance}km away</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'difficulty',
      header: 'Difficulty',
      cell: ({ row }) => {
        const difficulty = row.getValue('difficulty') as string;
        const colors = {
          Easy: 'bg-green-500/10 text-green-500',
          Moderate: 'bg-yellow-500/10 text-yellow-500',
          Challenging: 'bg-red-500/10 text-red-500',
        };
        return (
          <Badge className={colors[difficulty as keyof typeof colors]}>
            {difficulty}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as Activity['status'];
        const colors = {
          Active: 'bg-green-500/10 text-green-500',
          Inactive: 'bg-red-500/10 text-red-500',
          Seasonal: 'bg-blue-500/10 text-blue-500',
        };
        return (
          <Badge className={colors[status]}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const activity = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedActivity(activity);
                setOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteActivity(activity)}
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
          <h1 className="text-3xl font-bold">Activities & Sightseeing</h1>
          <Button onClick={() => {
            setSelectedActivity(null);
            setOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="group relative bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {activity.images?.[0] ? (
                  <Image
                    src={activity.images[0]}
                    alt={activity.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold truncate">{activity.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{activity.type}</Badge>
                  <Badge variant="outline">{activity.difficulty}</Badge>
                  <Badge variant={activity.isAvailable ? 'default' : 'destructive'}>
                    {activity.isAvailable ? 'Available' : 'Not Available'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="font-medium">${activity.price}</span>
                  <span className="text-sm text-muted-foreground">{activity.duration}h</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedActivity(activity);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteActivity(activity)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <ActivityDialog
          open={open}
          onOpenChange={setOpen}
          onSubmit={selectedActivity ? handleUpdateActivity : handleCreateActivity}
          activity={selectedActivity || undefined}
          mode={selectedActivity ? 'edit' : 'create'}
        />
      </div>
    </DashboardLayout>
  );
} 