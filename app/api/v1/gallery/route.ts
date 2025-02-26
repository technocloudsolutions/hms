import { NextRequest, NextResponse } from 'next/server';
import { getGalleryImages, getGalleryImageById, addGalleryImage, updateGalleryImage, deleteGalleryImage } from '@/lib/firebase';
import { GalleryImage } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const image = await getGalleryImageById(id);
      if (!image) {
        return NextResponse.json({ error: 'Gallery image not found' }, { status: 404 });
      }
      return NextResponse.json(image);
    }
    
    const images = await getGalleryImages();
    return NextResponse.json(images);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const imageData = await request.json();
    
    // Validate required fields
    const requiredFields = ['url', 'title', 'category'];
    for (const field of requiredFields) {
      if (!imageData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Validate category
    const validCategories = ['Rooms', 'Restaurant', 'Facilities', 'Events', 'Exterior', 'Interior', 'Pool', 'Spa', 'General'];
    if (!validCategories.includes(imageData.category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }
    
    const result = await addGalleryImage(imageData);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Gallery image ID is required' },
        { status: 400 }
      );
    }
    
    const imageData = await request.json();
    
    // Validate category if provided
    if (imageData.category) {
      const validCategories = ['Rooms', 'Restaurant', 'Facilities', 'Events', 'Exterior', 'Interior', 'Pool', 'Spa', 'General'];
      if (!validCategories.includes(imageData.category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }
    }
    
    const result = await updateGalleryImage(id, imageData);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Gallery image ID is required' },
        { status: 400 }
      );
    }
    
    await deleteGalleryImage(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 