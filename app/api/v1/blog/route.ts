import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts, getBlogPostById, getBlogPostBySlug, addBlogPost, updateBlogPost, deleteBlogPost } from '@/lib/firebase';
import { BlogPost } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    
    if (id) {
      const post = await getBlogPostById(id);
      if (!post) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      return NextResponse.json(post);
    }
    
    if (slug) {
      const post = await getBlogPostBySlug(slug);
      if (!post) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      return NextResponse.json(post);
    }
    
    const posts = await getBlogPosts();
    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const blogData = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'slug', 'content', 'excerpt', 'author', 'category', 'status'];
    for (const field of requiredFields) {
      if (!blogData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Validate category
    const validCategories = ['News', 'Events', 'Travel', 'Dining', 'Lifestyle', 'Offers'];
    if (!validCategories.includes(blogData.category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate status
    const validStatuses = ['Draft', 'Published', 'Archived'];
    if (!validStatuses.includes(blogData.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }
    
    const result = await addBlogPost(blogData);
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
        { error: 'Blog post ID is required' },
        { status: 400 }
      );
    }
    
    const blogData = await request.json();
    
    // Validate category if provided
    if (blogData.category) {
      const validCategories = ['News', 'Events', 'Travel', 'Dining', 'Lifestyle', 'Offers'];
      if (!validCategories.includes(blogData.category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }
    }
    
    // Validate status if provided
    if (blogData.status) {
      const validStatuses = ['Draft', 'Published', 'Archived'];
      if (!validStatuses.includes(blogData.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }
    
    const result = await updateBlogPost(id, blogData);
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
        { error: 'Blog post ID is required' },
        { status: 400 }
      );
    }
    
    await deleteBlogPost(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 