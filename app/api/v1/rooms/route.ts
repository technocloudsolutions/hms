import { NextRequest, NextResponse } from 'next/server';
import { getRooms, addRoom, updateRoom, deleteRoom } from '@/lib/firebase';
import { Room } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // TODO: Implement getRoom by ID
      return NextResponse.json({ message: 'Not implemented yet' }, { status: 501 });
    }
    
    const rooms = await getRooms();
    return NextResponse.json(rooms);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const roomData = await request.json();
    
    // Validate required fields
    const requiredFields = ['number', 'type', 'price', 'status'];
    for (const field of requiredFields) {
      if (!roomData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    const result = await addRoom(roomData);
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
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }
    
    const roomData = await request.json();
    const result = await updateRoom(id, roomData);
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
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }
    
    await deleteRoom(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 