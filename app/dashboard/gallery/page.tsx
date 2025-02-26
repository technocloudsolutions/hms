'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, Timestamp, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db, uploadImages, deleteImage } from '@/lib/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Button } from '@/components/ui/button';
import { Upload } from '@/components/ui/upload';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Image from 'next/image';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  createdAt: Timestamp;
}

export default function GalleryPage() {
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  // Fetch gallery images
  const [imagesSnapshot] = useCollection(collection(db, 'gallery'));

  const images = imagesSnapshot?.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as GalleryImage[] || [];

  const handleUpload = async (files: File[]) => {
    try {
      setLoading(true);
      
      // Upload images to Firebase Storage
      const urls = await uploadImages(files, 'gallery');
      
      // Add image records to Firestore
      const uploadPromises = urls.map(url => 
        addDoc(collection(db, 'gallery'), {
          url,
          title: '',
          description: '',
          category: 'General',
          createdAt: Timestamp.now()
        })
      );
      
      await Promise.all(uploadPromises);
      
      toast({
        title: 'Success',
        description: 'Images uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload images',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    try {
      setLoading(true);
      
      // Delete image from Storage
      await deleteImage(image.url);
      
      // Delete image record from Firestore
      await deleteDoc(doc(db, 'gallery', image.id));
      
      toast({
        title: 'Success',
        description: 'Image deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Hotel Gallery</h1>
        </div>

        <div className="space-y-8">
          {/* Upload Section */}
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Add New Images</h2>
            <Upload
              onChange={handleUpload}
              value={[]}
              multiple={true}
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
            />
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
              >
                <Image
                  src={image.url}
                  alt={image.title || 'Gallery image'}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleDelete(image)}
                    disabled={loading}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 