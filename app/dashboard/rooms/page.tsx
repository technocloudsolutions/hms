'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Button } from '@/components/ui/button';
import { RoomDialog } from '@/components/rooms/RoomDialog';
import { RoomTable } from '@/components/rooms/RoomTable';
import { useToast } from '@/components/ui/use-toast';
import { Room } from '@/lib/types';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function RoomsPage() {
  const [open, setOpen] = React.useState(false);
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);
  const { toast } = useToast();

  // Fetch rooms
  const [roomsSnapshot] = useCollection(collection(db, 'rooms'));

  const rooms = roomsSnapshot?.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as Room[] || [];

  const handleCreateRoom = async (data: Partial<Room>) => {
    try {
      await addDoc(collection(db, 'rooms'), data);
      toast({
        title: 'Success',
        description: 'Room created successfully',
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create room',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRoom = async (data: Partial<Room>) => {
    if (!selectedRoom) return;
    try {
      const roomRef = doc(db, 'rooms', selectedRoom.id);
      await updateDoc(roomRef, data);
      toast({
        title: 'Success',
        description: 'Room updated successfully',
      });
      setOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update room',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    try {
      await deleteDoc(doc(db, 'rooms', room.id));
      toast({
        title: 'Success',
        description: 'Room deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete room',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Rooms</h1>
          <Button onClick={() => {
            setSelectedRoom(null);
            setOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </div>

        <RoomTable
          rooms={rooms}
          onEdit={(room) => {
            setSelectedRoom(room);
            setOpen(true);
          }}
          onDelete={handleDeleteRoom}
        />

        <RoomDialog
          open={open}
          onOpenChange={setOpen}
          onSubmit={selectedRoom ? handleUpdateRoom : handleCreateRoom}
          room={selectedRoom || undefined}
          mode={selectedRoom ? 'edit' : 'create'}
        />
      </div>
    </DashboardLayout>
  );
} 