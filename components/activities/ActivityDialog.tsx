'use client';

import React from 'react';
import { Activity } from '@/lib/types';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload } from '@/components/ui/upload';
import { uploadImages } from '@/lib/firebase';
import Image from 'next/image';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Timestamp } from 'firebase/firestore';

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Activity>) => void;
  activity?: Activity;
  mode: 'create' | 'edit';
}

const ACTIVITY_TYPES = ['Indoor', 'Outdoor', 'Sightseeing', 'Cultural', 'Adventure'] as const;
const DIFFICULTY_LEVELS = ['Easy', 'Moderate', 'Challenging'] as const;
const STATUS_OPTIONS = ['Active', 'Inactive', 'Seasonal'] as const;
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

type ActivityType = typeof ACTIVITY_TYPES[number];
type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];
type StatusOption = typeof STATUS_OPTIONS[number];
type Season = typeof SEASONS[number];
type Day = typeof DAYS[number];

export function ActivityDialog({
  open,
  onOpenChange,
  onSubmit,
  activity,
  mode
}: ActivityDialogProps) {
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
    article: {
      content: '',
      excerpt: '',
      author: '',
      publishedTime: Timestamp.now(),
      modifiedTime: Timestamp.now(),
      sections: [] as { title: string; content: string; }[]
    }
  };

  const [formData, setFormData] = React.useState<Partial<Activity>>({
    name: '',
    description: '',
    type: 'Outdoor' as ActivityType,
    duration: 2,
    price: 0,
    location: '',
    distance: 0,
    difficulty: 'Easy' as DifficultyLevel,
    maxParticipants: 10,
    included: [],
    requirements: [],
    images: [],
    schedule: {
      days: ['Monday' as Day],
      startTime: '09:00',
      endTime: '17:00',
    },
    isAvailable: true,
    rating: 0,
    reviews: 0,
    bookingRequired: true,
    minimumAge: 0,
    status: 'Active' as StatusOption,
    season: ['Summer' as Season],
    seo: activity?.seo || defaultSeo,
    ...activity
  });

  React.useEffect(() => {
    if (activity) {
      setFormData(activity);
    }
  }, [activity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleImageUpload = async (files: File[]) => {
    try {
      const urls = await uploadImages(files, 'activities');
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...urls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const handleArrayInput = (field: 'included' | 'requirements') => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value) {
        setFormData(prev => ({
          ...prev,
          [field]: [...(prev[field] || []), value]
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
        setFormData(prev => {
          const keywords = [...(prev.seo?.keywords || []), value];
          return {
            ...prev,
            seo: {
              ...(prev.seo || defaultSeo),
              keywords
            }
          };
        });
        e.currentTarget.value = '';
      }
    }
  };

  const handleAddSection = () => {
    setFormData(prev => {
      const sections = [
        ...(prev.seo?.article.sections || []),
        { title: '', content: '' }
      ];
      return {
        ...prev,
        seo: {
          ...(prev.seo || defaultSeo),
          article: {
            ...(prev.seo?.article || defaultSeo.article),
            sections
          }
        }
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Activity' : 'Edit Activity'}
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
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: ActivityType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance from Hotel (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: DifficultyLevel) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="1"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Schedule</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.schedule?.startTime}
                      onChange={(e) => setFormData({
                        ...formData,
                        schedule: { ...formData.schedule!, startTime: e.target.value }
                      })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.schedule?.endTime}
                      onChange={(e) => setFormData({
                        ...formData,
                        schedule: { ...formData.schedule!, endTime: e.target.value }
                      })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Operating Days</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={formData.schedule?.days.includes(day) ? 'default' : 'outline'}
                      onClick={() => {
                        const days = formData.schedule?.days || [];
                        const newDays = days.includes(day)
                          ? days.filter(d => d !== day)
                          : [...days, day];
                        setFormData({
                          ...formData,
                          schedule: { ...formData.schedule!, days: newDays as Day[] }
                        });
                      }}
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Seasons</Label>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map((season) => (
                    <Button
                      key={season}
                      type="button"
                      variant={formData.season?.includes(season) ? 'default' : 'outline'}
                      onClick={() => {
                        const seasons = formData.season || [];
                        const newSeasons = seasons.includes(season)
                          ? seasons.filter(s => s !== season)
                          : [...seasons, season];
                        setFormData({ ...formData, season: newSeasons as Season[] });
                      }}
                    >
                      {season}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Images</Label>
                <div className="rounded-lg border border-border p-4">
                  <Upload
                    onChange={handleImageUpload}
                    value={formData.images}
                    multiple={true}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                  />
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden group">
                          <Image
                            src={image}
                            alt={`Activity image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const newImages = formData.images?.filter((_, i) => i !== index);
                                setFormData({ ...formData, images: newImages });
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="included">Included Items</Label>
                <Input
                  placeholder="Press Enter to add item"
                  onKeyDown={handleArrayInput('included')}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.included?.map((item, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        const newIncluded = formData.included?.filter((_, i) => i !== index);
                        setFormData({ ...formData, included: newIncluded });
                      }}
                    >
                      {item} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Input
                  placeholder="Press Enter to add requirement"
                  onKeyDown={handleArrayInput('requirements')}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.requirements?.map((item, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        const newRequirements = formData.requirements?.filter((_, i) => i !== index);
                        setFormData({ ...formData, requirements: newRequirements });
                      }}
                    >
                      {item} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumAge">Minimum Age</Label>
                  <Input
                    id="minimumAge"
                    type="number"
                    min="0"
                    value={formData.minimumAge}
                    onChange={(e) => setFormData({ ...formData, minimumAge: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Activity['status']) => setFormData({ ...formData, status: value })}
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                />
                <Label htmlFor="isAvailable">Available for Booking</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="bookingRequired"
                  checked={formData.bookingRequired}
                  onCheckedChange={(checked) => setFormData({ ...formData, bookingRequired: checked })}
                />
                <Label htmlFor="bookingRequired">Booking Required</Label>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-4">
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

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Article Content</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Article Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.seo?.article.excerpt}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          seo: {
                            ...prev.seo!,
                            article: {
                              ...prev.seo!.article,
                              excerpt: e.target.value
                            }
                          }
                        }))
                      }
                      placeholder="Brief summary of the article"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Article Sections</Label>
                    <div className="space-y-4">
                      {formData.seo?.article.sections.map((section, index) => (
                        <div key={index} className="space-y-2 p-4 border rounded-lg">
                          <Input
                            value={section.title}
                            onChange={(e) => {
                              const newSections = [...(formData.seo?.article.sections || [])];
                              newSections[index].title = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                seo: {
                                  ...prev.seo!,
                                  article: {
                                    ...prev.seo!.article,
                                    sections: newSections
                                  }
                                }
                              }));
                            }}
                            placeholder="Section title"
                          />
                          <Textarea
                            value={section.content}
                            onChange={(e) => {
                              const newSections = [...(formData.seo?.article.sections || [])];
                              newSections[index].content = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                seo: {
                                  ...prev.seo!,
                                  article: {
                                    ...prev.seo!.article,
                                    sections: newSections
                                  }
                                }
                              }));
                            }}
                            placeholder="Section content"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newSections = formData.seo?.article.sections.filter((_, i) => i !== index);
                              setFormData(prev => ({
                                ...prev,
                                seo: {
                                  ...prev.seo!,
                                  article: {
                                    ...prev.seo!.article,
                                    sections: newSections
                                  }
                                }
                              }));
                            }}
                          >
                            Remove Section
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddSection}
                      >
                        Add Section
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="submit">
              {mode === 'create' ? 'Create Activity' : 'Update Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 