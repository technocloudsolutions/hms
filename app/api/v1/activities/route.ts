import { NextRequest, NextResponse } from 'next/server';
import { Activity } from '@/lib/types';

// TODO: Implement activity-related functions in firebase.ts
const getActivities = async () => {
  // Placeholder
  return [];
};

const getActivityById = async (id: string) => {
  // Placeholder
  return null;
};

const addActivity = async (activityData: Omit<Activity, 'id'>) => {
  // Placeholder
  return { id: 'new-activity-id', ...activityData };
};

const updateActivity = async (id: string, activityData: Partial<Activity>) => {
  // Placeholder
  return { id, ...activityData };
};

const deleteActivity = async (id: string) => {
  // Placeholder
  return true;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const activity = await getActivityById(id);
      if (!activity) {
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
      }
      return NextResponse.json(activity);
    }
    
    const activities = await getActivities();
    return NextResponse.json(activities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const activityData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'type', 'duration', 'price', 'location'];
    for (const field of requiredFields) {
      if (!activityData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Validate activity type
    const validTypes = ['Indoor', 'Outdoor', 'Sightseeing', 'Cultural', 'Adventure'];
    if (!validTypes.includes(activityData.type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }
    
    const result = await addActivity(activityData);
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
        { error: 'Activity ID is required' },
        { status: 400 }
      );
    }
    
    const activityData = await request.json();
    
    // Validate activity type if provided
    if (activityData.type) {
      const validTypes = ['Indoor', 'Outdoor', 'Sightseeing', 'Cultural', 'Adventure'];
      if (!validTypes.includes(activityData.type)) {
        return NextResponse.json(
          { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }
    
    const result = await updateActivity(id, activityData);
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
        { error: 'Activity ID is required' },
        { status: 400 }
      );
    }
    
    await deleteActivity(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 