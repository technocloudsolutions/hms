import { NextRequest, NextResponse } from 'next/server';
import { Service } from '@/lib/types';

// TODO: Implement service-related functions in firebase.ts
const getServices = async () => {
  // Placeholder
  return [];
};

const addService = async (serviceData: Omit<Service, 'id'>) => {
  // Placeholder
  return { id: 'new-service-id', ...serviceData };
};

const updateService = async (id: string, serviceData: Partial<Service>) => {
  // Placeholder
  return { id, ...serviceData };
};

const deleteService = async (id: string) => {
  // Placeholder
  return true;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // TODO: Implement getService by ID
      return NextResponse.json({ message: 'Not implemented yet' }, { status: 501 });
    }
    
    const services = await getServices();
    return NextResponse.json(services);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const serviceData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'price', 'status'];
    for (const field of requiredFields) {
      if (!serviceData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    const result = await addService(serviceData);
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
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }
    
    const serviceData = await request.json();
    const result = await updateService(id, serviceData);
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
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }
    
    await deleteService(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 