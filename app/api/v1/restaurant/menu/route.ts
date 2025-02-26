import { NextRequest, NextResponse } from 'next/server';
import { getMenuItems, getMenuItemById, getMenuItemsByCategory, addMenuItem, updateMenuItem, deleteMenuItem } from '@/lib/firebase';
import { MenuItem } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    
    if (id) {
      const menuItem = await getMenuItemById(id);
      if (!menuItem) {
        return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
      }
      return NextResponse.json(menuItem);
    }
    
    if (category) {
      const menuItems = await getMenuItemsByCategory(category);
      return NextResponse.json(menuItems);
    }
    
    const menuItems = await getMenuItems();
    return NextResponse.json(menuItems);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const menuItemData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'category', 'mealPeriods'];
    for (const field of requiredFields) {
      if (!menuItemData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Validate category
    const validCategories = ['Appetizers', 'Soups', 'Salads', 'Main Course', 'Desserts', 'Beverages', 'Specials'];
    if (!validCategories.includes(menuItemData.category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate meal periods
    const validMealPeriods = ['Breakfast', 'Lunch', 'Dinner', 'All Day'];
    if (!menuItemData.mealPeriods.every((period: string) => validMealPeriods.includes(period))) {
      return NextResponse.json(
        { error: `Invalid meal period. Must be one of: ${validMealPeriods.join(', ')}` },
        { status: 400 }
      );
    }
    
    const result = await addMenuItem(menuItemData);
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
        { error: 'Menu item ID is required' },
        { status: 400 }
      );
    }
    
    const menuItemData = await request.json();
    
    // Validate category if provided
    if (menuItemData.category) {
      const validCategories = ['Appetizers', 'Soups', 'Salads', 'Main Course', 'Desserts', 'Beverages', 'Specials'];
      if (!validCategories.includes(menuItemData.category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }
    }
    
    // Validate meal periods if provided
    if (menuItemData.mealPeriods) {
      const validMealPeriods = ['Breakfast', 'Lunch', 'Dinner', 'All Day'];
      if (!menuItemData.mealPeriods.every((period: string) => validMealPeriods.includes(period))) {
        return NextResponse.json(
          { error: `Invalid meal period. Must be one of: ${validMealPeriods.join(', ')}` },
          { status: 400 }
        );
      }
    }
    
    const result = await updateMenuItem(id, menuItemData);
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
        { error: 'Menu item ID is required' },
        { status: 400 }
      );
    }
    
    await deleteMenuItem(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 