'use client';

import React from 'react';
import { BlogPost } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload } from '@/components/ui/upload';
import { uploadImage } from '@/lib/firebase';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Timestamp } from 'firebase/firestore';

interface BlogPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<BlogPost>) => void;
  post?: BlogPost;
  mode: 'create' | 'edit';
}

const CATEGORIES = ['News', 'Events', 'Travel', 'Dining', 'Lifestyle', 'Offers'] as const;
const STATUS_OPTIONS = ['Draft', 'Published', 'Archived'] as const;

type Category = typeof CATEGORIES[number];
type Status = typeof STATUS_OPTIONS[number];

export function BlogPostDialog({
  open,
  onOpenChange,
  onSubmit,
  post,
  mode
}: BlogPostDialogProps) {
  const defaultSeo = {
    title: '',
    description: '',
    keywords: [] as string[],
    focusKeyword: '',
    metaRobotsIndex: 'index' as const,
    metaRobotsFollow: 'follow' as const,
    openGraphTitle: '',
    openGraphDescription: '',
    twitterTitle: '',
    twitterDescription: '',
  };

  const [formData, setFormData] = React.useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author: '',
    category: 'News' as Category,
    tags: [],
    featuredImage: '',
    status: 'Draft' as Status,
    seo: post?.seo || defaultSeo,
    ...post
  });

  React.useEffect(() => {
    if (post) {
      setFormData(post);
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      const imageUrl = await uploadImage(files[0], 'blog-posts');
      setFormData(prev => ({
        ...prev,
        featuredImage: imageUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), value]
        }));
        e.currentTarget.value = '';
      }
    }
  };

  const handleKeywordsInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value) {
        setFormData(prev => ({
          ...prev,
          seo: {
            ...(prev.seo || defaultSeo),
            keywords: [...(prev.seo?.keywords || []), value]
          }
        }));
        e.currentTarget.value = '';
      }
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Blog Post' : 'Edit Blog Post'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="seo">SEO & Content</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData({
                        ...formData,
                        title,
                        slug: generateSlug(title)
                      });
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  className="min-h-[200px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: Category) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Status) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  placeholder="Press Enter to add tag"
                  onKeyDown={handleTagInput}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags?.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        const newTags = formData.tags?.filter((_, i) => i !== index);
                        setFormData({ ...formData, tags: newTags });
                      }}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Featured Image</Label>
                <div className="rounded-lg border border-border p-4">
                  <Upload
                    onChange={handleImageUpload}
                    value={formData.featuredImage ? [formData.featuredImage] : []}
                    multiple={false}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seo?.title}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        seo: { ...prev.seo!, title: e.target.value }
                      }))
                    }
                    placeholder="SEO optimized title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="focusKeyword">Focus Keyword</Label>
                  <Input
                    id="focusKeyword"
                    value={formData.seo?.focusKeyword}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        seo: { ...prev.seo!, focusKeyword: e.target.value }
                      }))
                    }
                    placeholder="Main keyword to target"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seo?.description}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      seo: { ...prev.seo!, description: e.target.value }
                    }))
                  }
                  placeholder="SEO meta description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="Press Enter to add keyword"
                  onKeyDown={handleKeywordsInput}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.seo?.keywords?.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        const newKeywords = formData.seo?.keywords.filter((_, i) => i !== index);
                        setFormData(prev => ({
                          ...prev,
                          seo: { ...prev.seo!, keywords: newKeywords }
                        }));
                      }}
                    >
                      {keyword} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meta Robots Index</Label>
                  <Select
                    value={formData.seo?.metaRobotsIndex}
                    onValueChange={(value: 'index' | 'noindex') =>
                      setFormData(prev => ({
                        ...prev,
                        seo: { ...prev.seo!, metaRobotsIndex: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="index">Index</SelectItem>
                      <SelectItem value="noindex">No Index</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Meta Robots Follow</Label>
                  <Select
                    value={formData.seo?.metaRobotsFollow}
                    onValueChange={(value: 'follow' | 'nofollow') =>
                      setFormData(prev => ({
                        ...prev,
                        seo: { ...prev.seo!, metaRobotsFollow: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow">Follow</SelectItem>
                      <SelectItem value="nofollow">No Follow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ogTitle">OpenGraph Title</Label>
                  <Input
                    id="ogTitle"
                    value={formData.seo?.openGraphTitle}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        seo: { ...prev.seo!, openGraphTitle: e.target.value }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitterTitle">Twitter Title</Label>
                  <Input
                    id="twitterTitle"
                    value={formData.seo?.twitterTitle}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        seo: { ...prev.seo!, twitterTitle: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ogDescription">OpenGraph Description</Label>
                  <Textarea
                    id="ogDescription"
                    value={formData.seo?.openGraphDescription}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        seo: { ...prev.seo!, openGraphDescription: e.target.value }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitterDescription">Twitter Description</Label>
                  <Textarea
                    id="twitterDescription"
                    value={formData.seo?.twitterDescription}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        seo: { ...prev.seo!, twitterDescription: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="submit">
              {mode === 'create' ? 'Create Post' : 'Update Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 