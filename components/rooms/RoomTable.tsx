'use client';

import React from 'react';
import { Room } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoomTableProps {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
}

export function RoomTable({ rooms, onEdit, onDelete }: RoomTableProps) {
  const columns: ColumnDef<Room, any>[] = [
    {
      accessorKey: 'number',
      header: 'Room',
      cell: ({ row }) => {
        const room = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">#{room.number}</span>
            <span className="text-sm text-muted-foreground">Floor {room.floor}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type & Bed',
      cell: ({ row }) => {
        const room = row.original;
        return (
          <div className="flex flex-col">
            <span>{room.type}</span>
            <span className="text-sm text-muted-foreground">{room.bedType} Bed</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Price & Size',
      cell: ({ row }) => {
        const room = row.original;
        return (
          <div className="flex flex-col">
            <span>${room.price}/night</span>
            <span className="text-sm text-muted-foreground">{room.size}m²</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as Room['status'];
        const statusColors = {
          Available: 'bg-green-500/10 text-green-500',
          Occupied: 'bg-yellow-500/10 text-yellow-500',
          Maintenance: 'bg-red-500/10 text-red-500',
          Reserved: 'bg-blue-500/10 text-blue-500',
          Cleaning: 'bg-purple-500/10 text-purple-500',
        };
        return (
          <Badge className={statusColors[status]}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => {
        const room = row.original;
        return (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span>{room.rating}</span>
            <span className="text-sm text-muted-foreground">({room.reviews})</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'amenities',
      header: 'Features',
      cell: ({ row }) => {
        const room = row.original;
        const amenities = room.amenities || [];
        const displayAmenities = amenities.slice(0, 2);
        const remainingCount = amenities.length - 2;

        return (
          <div className="flex items-center gap-2">
            {displayAmenities.map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs cursor-help">
                      +{remainingCount} more
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      {amenities.slice(2).map((amenity, index) => (
                        <div key={index}>{amenity}</div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'view',
      header: 'View & Details',
      cell: ({ row }) => {
        const room = row.original;
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{room.view}</Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <div>Capacity: {room.capacity} guests</div>
                    <div>Accessibility: {room.accessibility ? 'Yes' : 'No'}</div>
                    <div>Smoking: {room.smoking ? 'Allowed' : 'Not Allowed'}</div>
                    <div className="text-xs text-muted-foreground">{room.description}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const room = row.original as Room;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(room)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(room)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rooms}
      searchKey="number"
    />
  );
} 