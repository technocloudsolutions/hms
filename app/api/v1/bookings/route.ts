import { NextRequest, NextResponse } from 'next/server';
import { getRecentBookings, addBooking, updateBooking, deleteBooking } from '@/lib/firebase';
import { Booking } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 10;
    
    if (id) {
      // TODO: Implement getBooking by ID
      return NextResponse.json({ message: 'Not implemented yet' }, { status: 501 });
    }
    
    const bookings = await getRecentBookings(limit);
    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();
    
    // Validate required fields
    const requiredFields = ['guestId', 'roomId', 'checkIn', 'checkOut', 'status', 'totalAmount', 'paymentStatus'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    const result = await addBooking(bookingData);
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
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    const bookingData = await request.json();
    const result = await updateBooking(id, bookingData);
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
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    await deleteBooking(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 