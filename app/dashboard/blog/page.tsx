'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { BlogPostDialog } from '@/components/blog/BlogPostDialog';
import { BlogPost } from '@/lib/types';

export default function BlogPage() {
  const [open, setOpen] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState<BlogPost | null>(null);
  const { toast } = useToast();

  // Fetch blog posts
  const [postsSnapshot] = useCollection(collection(db, 'blogPosts'));

  const posts = postsSnapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as BlogPost[] || [];

  const handleCreatePost = async (data: Partial<BlogPost>) => {
    try {
      const now = Timestamp.now();
      await addDoc(collection(db, 'blogPosts'), {
        ...data,
        createdAt: now,
        updatedAt: now,
        publishDate: data.status === 'Published' ? now : null
      });
      toast({
        title: 'Success',
        description: 'Blog post created successfully',
      });
      setOpen(false);
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create blog post',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePost = async (data: Partial<BlogPost>) => {
    if (!selectedPost) return;
    try {
      const postRef = doc(db, 'blogPosts', selectedPost.id);
      await updateDoc(postRef, {
        ...data,
        updatedAt: Timestamp.now(),
        publishDate: data.status === 'Published' && !selectedPost.publishDate ? Timestamp.now() : selectedPost.publishDate
      });
      toast({
        title: 'Success',
        description: 'Blog post updated successfully',
      });
      setOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update blog post',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async (post: BlogPost) => {
    try {
      await deleteDoc(doc(db, 'blogPosts', post.id));
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog post',
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<BlogPost>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as string;
        return (
          <Badge variant="outline">
            {category}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'author',
      header: 'Author',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as BlogPost['status'];
        return (
          <Badge
            className={
              status === 'Published'
                ? 'bg-green-500/10 text-green-500'
                : status === 'Draft'
                ? 'bg-yellow-500/10 text-yellow-500'
                : 'bg-gray-500/10 text-gray-500'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'publishDate',
      header: 'Published',
      cell: ({ row }) => {
        const date = row.getValue('publishDate') as Timestamp;
        return date ? new Date(date.seconds * 1000).toLocaleDateString() : '-';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const post = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedPost(post);
                setOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeletePost(post)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <Button onClick={() => {
            setSelectedPost(null);
            setOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Blog Post
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={posts}
          searchKey="title"
        />

        <BlogPostDialog
          open={open}
          onOpenChange={setOpen}
          onSubmit={selectedPost ? handleUpdatePost : handleCreatePost}
          post={selectedPost || undefined}
          mode={selectedPost ? 'edit' : 'create'}
        />
      </div>
    </DashboardLayout>
  );
} 