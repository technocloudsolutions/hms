import { NextRequest, NextResponse } from 'next/server';
import { getGuests, addGuest, updateGuest, deleteGuest } from '@/lib/firebase';
import { Guest } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // TODO: Implement getGuest by ID
      return NextResponse.json({ message: 'Not implemented yet' }, { status: 501 });
    }
    
    const guests = await getGuests();
    return NextResponse.json(guests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guestData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'address', 'idType', 'idNumber'];
    for (const field of requiredFields) {
      if (!guestData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    const result = await addGuest(guestData);
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
        { error: 'Guest ID is required' },
        { status: 400 }
      );
    }
    
    const guestData = await request.json();
    const result = await updateGuest(id, guestData);
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
        { error: 'Guest ID is required' },
        { status: 400 }
      );
    }
    
    await deleteGuest(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 