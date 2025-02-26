import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts, getBlogPostById, getBlogPostBySlug, addBlogPost, updateBlogPost, deleteBlogPost } from '@/lib/firebase';
import { BlogPost } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

const now = Timestamp.now();

const testPosts: Omit<BlogPost, 'id'>[] = [
  {
    title: "Experience Our New Luxury Spa Retreat",
    slug: "new-luxury-spa-retreat",
    content: "We are delighted to announce the opening of our new state-of-the-art spa retreat. Featuring six treatment rooms, a hydrotherapy pool, steam room, and relaxation areas, our spa offers a comprehensive range of treatments designed to rejuvenate both body and mind. Our expert therapists use only premium organic products to ensure the highest quality experience for our guests. Special opening offers available for hotel guests.",
    excerpt: "Discover tranquility at our newly opened luxury spa retreat with exclusive opening offers.",
    author: "Sarah Johnson",
    category: "News",
    status: "Published",
    tags: ["spa", "wellness", "luxury", "new-facilities"],
    featuredImage: "https://firebasestorage.googleapis.com/v0/b/hotel-management-system-82729.appspot.com/o/blog%2Fspa-retreat.jpg",
    publishDate: now,
    seo: {
      title: "New Luxury Spa Retreat at Our Hotel",
      description: "Experience ultimate relaxation at our new state-of-the-art spa retreat. Book your spa treatment today and enjoy exclusive opening offers.",
      keywords: ["spa", "wellness", "luxury spa", "hotel spa", "spa retreat"],
      focusKeyword: "luxury spa retreat",
      metaRobotsIndex: "index",
      metaRobotsFollow: "follow",
      openGraphTitle: "Experience Our New Luxury Spa Retreat",
      openGraphDescription: "Discover tranquility at our newly opened luxury spa retreat with exclusive opening offers.",
      twitterTitle: "New Luxury Spa Retreat - Special Opening Offers",
      twitterDescription: "Experience ultimate relaxation at our new state-of-the-art spa retreat."
    },
    createdAt: now,
    updatedAt: now
  },
  {
    title: "Summer Dining: New Seasonal Menu Launch",
    slug: "summer-dining-seasonal-menu",
    content: "Welcome the summer season with our new exquisite dining menu. Our award-winning chef has crafted a selection of dishes that celebrate the finest seasonal ingredients. From fresh Mediterranean seafood to locally sourced organic produce, each dish tells a story of flavor and tradition. Join us for an unforgettable culinary journey under the stars at our rooftop restaurant.",
    excerpt: "Experience the taste of summer with our new seasonal menu featuring fresh, local ingredients.",
    author: "Chef Michael Chen",
    category: "Dining",
    status: "Published",
    tags: ["dining", "summer", "seasonal-menu", "culinary"],
    featuredImage: "https://firebasestorage.googleapis.com/v0/b/hotel-management-system-82729.appspot.com/o/blog%2Fsummer-dining.jpg",
    publishDate: now,
    seo: {
      title: "Summer Dining: New Seasonal Menu at Our Restaurant",
      description: "Experience our new summer menu featuring fresh Mediterranean seafood and locally sourced ingredients at our rooftop restaurant.",
      keywords: ["summer dining", "seasonal menu", "hotel restaurant", "fine dining"],
      focusKeyword: "summer seasonal menu",
      metaRobotsIndex: "index",
      metaRobotsFollow: "follow",
      openGraphTitle: "Summer Dining: New Seasonal Menu Launch",
      openGraphDescription: "Experience the taste of summer with our new seasonal menu featuring fresh, local ingredients.",
      twitterTitle: "New Summer Menu at Our Restaurant",
      twitterDescription: "Join us for an unforgettable culinary journey under the stars."
    },
    createdAt: now,
    updatedAt: now
  },
  {
    title: "Exclusive Summer Getaway Package",
    slug: "summer-getaway-package",
    content: "Make this summer unforgettable with our exclusive getaway package. Book a minimum 3-night stay and enjoy complimentary breakfast, a romantic dinner for two, spa treatments, and a sunset yacht cruise. Early bird bookings receive an additional 15% discount and a room upgrade (subject to availability). Perfect for couples seeking a luxurious escape or families looking for an adventure-filled vacation.",
    excerpt: "Book our summer package and enjoy exclusive benefits including spa treatments and yacht cruise.",
    author: "Emma Thompson",
    category: "Offers",
    status: "Published",
    tags: ["summer", "special-offer", "package", "vacation"],
    featuredImage: "https://firebasestorage.googleapis.com/v0/b/hotel-management-system-82729.appspot.com/o/blog%2Fsummer-package.jpg",
    publishDate: now,
    seo: {
      title: "Exclusive Summer Getaway Package - Special Hotel Offer",
      description: "Book our summer package and enjoy spa treatments, yacht cruise, and more. Early bird discount available.",
      keywords: ["summer package", "hotel offer", "vacation package", "luxury getaway"],
      focusKeyword: "summer getaway package",
      metaRobotsIndex: "index",
      metaRobotsFollow: "follow",
      openGraphTitle: "Exclusive Summer Getaway Package",
      openGraphDescription: "Book our summer package and enjoy exclusive benefits including spa treatments and yacht cruise.",
      twitterTitle: "Summer Getaway Package - Early Bird Offer",
      twitterDescription: "Enjoy spa treatments, yacht cruise, and more with our summer package."
    },
    createdAt: now,
    updatedAt: now
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const seed = searchParams.get('seed');
    
    console.log('GET /api/v1/blog - Query params:', { id, slug, seed });
    
    // Special route to seed test data
    if (seed === 'true') {
      console.log('Starting blog post seeding...');
      console.log('Test posts to be added:', testPosts.length);
      
      try {
        console.log('Adding test posts one by one...');
        const results = [];
        
        for (const post of testPosts) {
          console.log('Adding post:', post.title);
          try {
            console.log('Post data:', JSON.stringify(post, null, 2));
            const result = await addBlogPost(post);
            console.log('Successfully added post:', result);
            results.push(result);
          } catch (postError: any) {
            console.error('Error adding individual post:', post.title);
            console.error('Error details:', postError);
            console.error('Error stack:', postError.stack);
          }
        }
        
        console.log('Seeding completed. Added posts:', results.length);
        return NextResponse.json({ 
          message: `Successfully seeded ${results.length} blog posts`, 
          posts: results 
        });
      } catch (seedError: any) {
        console.error('Error during seeding:', seedError);
        console.error('Error stack:', seedError.stack);
        return NextResponse.json({ 
          error: 'Failed to seed blog posts', 
          details: seedError.message,
          stack: seedError.stack 
        }, { status: 500 });
      }
    }
    
    // Handle regular GET requests
    if (id) {
      console.log('Fetching blog post by ID:', id);
      const post = await getBlogPostById(id);
      if (!post) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      return NextResponse.json(post);
    }
    
    if (slug) {
      console.log('Fetching blog post by slug:', slug);
      const post = await getBlogPostBySlug(slug);
      if (!post) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      return NextResponse.json(post);
    }
    
    console.log('Fetching all blog posts');
    const posts = await getBlogPosts();
    console.log('Retrieved posts:', posts);
    return NextResponse.json(posts);
  } catch (error: any) {
    console.error('Error in GET /api/v1/blog:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to process request', 
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request to /api/v1/blog');
    const blogData = await request.json();
    console.log('Received blog data:', JSON.stringify(blogData, null, 2));
    
    // Validate required fields
    const requiredFields = ['title', 'slug', 'content', 'excerpt', 'author', 'category', 'status'];
    console.log('Validating required fields:', requiredFields);
    for (const field of requiredFields) {
      if (!blogData[field]) {
        console.log(`Missing required field: ${field}`);
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    console.log('All required fields present');
    
    // Validate category
    const validCategories = ['News', 'Events', 'Travel', 'Dining', 'Lifestyle', 'Offers'];
    console.log('Validating category:', blogData.category);
    if (!validCategories.includes(blogData.category)) {
      console.log(`Invalid category: ${blogData.category}`);
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }
    console.log('Category is valid');
    
    // Validate status
    const validStatuses = ['Draft', 'Published', 'Archived'];
    console.log('Validating status:', blogData.status);
    if (!validStatuses.includes(blogData.status)) {
      console.log(`Invalid status: ${blogData.status}`);
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }
    console.log('Status is valid');
    
    console.log('All validation passed, adding blog post');
    const result = await addBlogPost(blogData);
    console.log('Blog post added successfully:', result);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/v1/blog:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to process request', 
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
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