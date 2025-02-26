'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "@/components/ui/upload";
import { Timestamp } from 'firebase/firestore';
import { uploadImage, deleteImage } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  mealPeriods: string[];
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  preparationTime: number;
  calories: number;
  image: string;
  isAvailable: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<MenuItem>) => void;
  menuItem?: MenuItem;
  mode: 'create' | 'edit';
}

const MEAL_PERIODS = ['Breakfast', 'Lunch', 'Dinner', 'All Day'];
const CATEGORIES = [
  'Appetizers',
  'Soups',
  'Salads',
  'Main Course',
  'Desserts',
  'Beverages',
  'Specials'
];
const COMMON_ALLERGENS = [
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Tree Nuts',
  'Peanuts',
  'Wheat',
  'Soy'
];

export function MenuItemDialog({
  open,
  onOpenChange,
  onSubmit,
  menuItem,
  mode
}: MenuItemDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'Main Course',
    mealPeriods: ['All Day'],
    ingredients: [],
    allergens: [],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    preparationTime: 15,
    calories: 0,
    image: '',
    isAvailable: true,
    ...menuItem
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name?.trim()) {
      toast({
        title: 'Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.description?.trim()) {
      toast({
        title: 'Error',
        description: 'Description is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.price || formData.price <= 0) {
      toast({
        title: 'Error',
        description: 'Price must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.mealPeriods?.length) {
      toast({
        title: 'Error',
        description: 'At least one meal period must be selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to save menu item',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setLoading(true);
      
      // Delete existing image if updating
      if (formData.image && mode === 'edit') {
        await deleteImage(formData.image);
      }

      // Upload new image
      const imageUrl = await uploadImage(files[0], 'menu-items');
      setFormData({ ...formData, image: imageUrl });
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMealPeriodToggle = (period: string) => {
    const periods = formData.mealPeriods || [];
    const newPeriods = periods.includes(period)
      ? periods.filter(p => p !== period)
      : [...periods, period];
    setFormData({ ...formData, mealPeriods: newPeriods });
  };

  const handleAllergenToggle = (allergen: string) => {
    const allergens = formData.allergens || [];
    const newAllergens = allergens.includes(allergen)
      ? allergens.filter(a => a !== allergen)
      : [...allergens, allergen];
    setFormData({ ...formData, allergens: newAllergens });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Menu Item' : 'Edit Menu Item'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
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
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Meal Periods</Label>
            <div className="flex flex-wrap gap-2">
              {MEAL_PERIODS.map((period) => (
                <Button
                  key={period}
                  type="button"
                  variant={formData.mealPeriods?.includes(period) ? 'default' : 'outline'}
                  onClick={() => handleMealPeriodToggle(period)}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Allergens</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_ALLERGENS.map((allergen) => (
                <Button
                  key={allergen}
                  type="button"
                  variant={formData.allergens?.includes(allergen) ? 'default' : 'outline'}
                  onClick={() => handleAllergenToggle(allergen)}
                >
                  {allergen}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="vegetarian"
                checked={formData.isVegetarian}
                onCheckedChange={(checked) => setFormData({ ...formData, isVegetarian: checked })}
              />
              <Label htmlFor="vegetarian">Vegetarian</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="vegan"
                checked={formData.isVegan}
                onCheckedChange={(checked) => setFormData({ ...formData, isVegan: checked })}
              />
              <Label htmlFor="vegan">Vegan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="glutenFree"
                checked={formData.isGlutenFree}
                onCheckedChange={(checked) => setFormData({ ...formData, isGlutenFree: checked })}
              />
              <Label htmlFor="glutenFree">Gluten Free</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <div className="border rounded-lg p-4 bg-muted/10">
              <Upload 
                onChange={handleImageUpload} 
                value={formData.image ? [formData.image] : []} 
                multiple={false}
                accept="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="available"
              checked={formData.isAvailable}
              onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
            />
            <Label htmlFor="available">Available</Label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Add Menu Item' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 