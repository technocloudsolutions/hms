'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Room } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Timestamp } from 'firebase/firestore';
import { Upload } from '@/components/ui/upload';
import { uploadImages } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Room>) => void;
  room?: Room;
  mode: 'create' | 'edit';
}

const ROOM_TYPES = ['Single', 'Double', 'Suite', 'Deluxe', 'Presidential'] as const;
const ROOM_STATUS = ['Available', 'Occupied', 'Maintenance', 'Reserved', 'Cleaning'] as const;
const ROOM_VIEWS = ['City', 'Ocean', 'Garden', 'Mountain', 'Pool'] as const;
const BED_TYPES = ['Single', 'Double', 'Queen', 'King'] as const;
const DEFAULT_AMENITIES = [
  'Wi-Fi',
  'TV',
  'Air Conditioning',
  'Mini Bar',
  'Safe',
  'Room Service',
  'Coffee Maker',
  'Hair Dryer',
  'Iron',
  'Work Desk',
  'Bathtub',
  'Shower',
  'Balcony',
  'City View',
  'Pool Access',
  'Gym Access',
  'Spa Access',
  'Lounge Access',
] as const;

export function RoomDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  room, 
  mode 
}: RoomDialogProps) {
  const [formData, setFormData] = React.useState<Partial<Room>>({
    number: '',
    type: 'Single',
    price: 0,
    status: 'Available',
    amenities: [],
    description: '',
    images: [],
    floor: 1,
    capacity: 1,
    size: 0,
    view: 'City',
    bedType: 'Single',
    lastCleaned: Timestamp.now(),
    lastMaintenance: Timestamp.now(),
    rating: 5,
    reviews: 0,
    specialOffers: [],
    accessibility: false,
    smoking: false,
    ...room
  });

  const [isUploading, setIsUploading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...(prev.amenities || []), amenity]
    }));
  };

  const handleImageUpload = async (files: File[]) => {
    try {
      setIsUploading(true);
      const urls = await uploadImages(files, `rooms/${formData.number}`);
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...urls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Room' : 'Edit Room'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Room Number</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="101"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                  min={1}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Room Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as Room['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Room['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price per Night ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  min={0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Room Size (m²)</Label>
                <Input
                  id="size"
                  type="number"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: Number(e.target.value) })}
                  min={0}
                  required
                />
              </div>
            </div>
          </div>

          {/* Room Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Room Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="view">View</Label>
                <Select
                  value={formData.view}
                  onValueChange={(value) => setFormData({ ...formData, view: value as Room['view'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_VIEWS.map((view) => (
                      <SelectItem key={view} value={view}>
                        {view}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedType">Bed Type</Label>
                <Select
                  value={formData.bedType}
                  onValueChange={(value) => setFormData({ ...formData, bedType: value as Room['bedType'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bed type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BED_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  min={1}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  min={0}
                  max={5}
                  step={0.1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Luxurious room with stunning views..."
                className="h-20"
                required
              />
            </div>
          </div>

          {/* Room Images */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Room Images</h3>
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </div>
              )}
            </div>
            <Upload
              value={formData.images}
              onChange={handleImageUpload}
              className="h-32"
            />
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Amenities</h3>
            <div className="grid grid-cols-3 gap-2">
              {DEFAULT_AMENITIES.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center space-x-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities?.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Features</h3>
            <div className="flex space-x-8">
              <div className="flex items-center space-x-2">
                <Switch
                  id="accessibility"
                  checked={formData.accessibility}
                  onCheckedChange={(checked) => setFormData({ ...formData, accessibility: checked })}
                />
                <Label htmlFor="accessibility">Accessibility</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="smoking"
                  checked={formData.smoking}
                  onCheckedChange={(checked) => setFormData({ ...formData, smoking: checked })}
                />
                <Label htmlFor="smoking">Smoking Allowed</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : mode === 'create' ? (
                'Add Room'
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 