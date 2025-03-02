'use client';

import React from 'react';
import { doc, getDoc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '@/lib/firebase';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HotelSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  taxRate: number;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface AppSettings {
  darkMode: boolean;
}

interface AmenitiesSettings {
  items: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface MealPeriod {
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface RestaurantSettings {
  name: string;
  description: string;
  capacity: number;
  openTime: string;
  closeTime: string;
  isOpen24Hours: boolean;
  allowReservations: boolean;
  mealPeriods: MealPeriod[];
  tableCount: number;
  averageWaitTime: number;
  cuisine: string[];
  dressCode: 'Casual' | 'Smart Casual' | 'Formal';
}

export default function SettingsPage() {
  const [user] = useAuthState(auth);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);

  const [hotelSettings, setHotelSettings] = React.useState<HotelSettings>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    currency: 'USD',
    taxRate: 10,
  });

  const [userProfile, setUserProfile] = React.useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    role: 'Administrator',
  });

  const [appSettings, setAppSettings] = React.useState<AppSettings>({
    darkMode: theme === 'dark',
  });

  const [restaurantSettings, setRestaurantSettings] = React.useState<RestaurantSettings>({
    name: '',
    description: '',
    capacity: 50,
    openTime: '07:00',
    closeTime: '22:00',
    isOpen24Hours: false,
    allowReservations: true,
    mealPeriods: [
      { name: 'Breakfast', startTime: '07:00', endTime: '10:30', isActive: true },
      { name: 'Lunch', startTime: '12:00', endTime: '15:00', isActive: true },
      { name: 'Dinner', startTime: '18:00', endTime: '22:00', isActive: true },
    ],
    tableCount: 15,
    averageWaitTime: 20,
    cuisine: ['International'],
    dressCode: 'Smart Casual',
  });

  const [amenitiesSettings, setAmenitiesSettings] = React.useState<AmenitiesSettings>({
    items: [
      'Wi-Fi',
      'TV',
      'Air Conditioning',
      'Mini Bar',
      'Safe',
      'Room Service',
      'Coffee Maker',
      'Hair Dryer',
      'Iron',
      'Work Desk',
      'Bathtub',
      'Shower',
      'Balcony',
      'City View',
      'Pool Access',
      'Gym Access',
      'Spa Access',
      'Lounge Access',
    ],
  });

  const [newAmenity, setNewAmenity] = React.useState('');

  // Initialize user profile when component mounts
  React.useEffect(() => {
    const initializeSettings = async () => {
      if (!user) return;

      try {
        // Fetch user profile
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // Create initial profile if it doesn't exist
          const initialProfile = {
            name: user.displayName || '',
            email: user.email || '',
            phone: '',
            role: 'Administrator',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };
          await setDoc(userRef, initialProfile);
          setUserProfile(initialProfile);
        } else {
          setUserProfile(userDoc.data() as UserProfile);
        }

        // Fetch hotel settings
        const hotelSettingsRef = doc(db, 'settings', 'hotel');
        const hotelSettingsDoc = await getDoc(hotelSettingsRef);

        if (!hotelSettingsDoc.exists()) {
          // Create initial hotel settings if they don't exist
          const initialHotelSettings = {
            name: '',
            address: '',
            phone: '',
            email: '',
            website: '',
            checkInTime: '14:00',
            checkOutTime: '12:00',
            currency: 'USD',
            taxRate: 10,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };
          await setDoc(hotelSettingsRef, initialHotelSettings);
          setHotelSettings(initialHotelSettings);
        } else {
          setHotelSettings(hotelSettingsDoc.data() as HotelSettings);
        }

        // Fetch app settings
        const appSettingsRef = doc(db, 'users', user.uid, 'settings', 'app');
        const appSettingsDoc = await getDoc(appSettingsRef);

        if (!appSettingsDoc.exists()) {
          // Create initial app settings if they don't exist
          const initialAppSettings = {
            darkMode: theme === 'dark',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };
          await setDoc(appSettingsRef, initialAppSettings);
          setAppSettings(initialAppSettings);
        } else {
          setAppSettings(prev => ({
            ...prev,
            ...appSettingsDoc.data(),
            darkMode: theme === 'dark'
          }));
        }

        // Fetch restaurant settings
        const restaurantSettingsRef = doc(db, 'settings', 'restaurant');
        const restaurantSettingsDoc = await getDoc(restaurantSettingsRef);

        if (!restaurantSettingsDoc.exists()) {
          // Create initial restaurant settings if they don't exist
          const initialRestaurantSettings = {
            ...restaurantSettings,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };
          await setDoc(restaurantSettingsRef, initialRestaurantSettings);
          setRestaurantSettings(initialRestaurantSettings);
        } else {
          setRestaurantSettings(restaurantSettingsDoc.data() as RestaurantSettings);
        }

        // Fetch amenities settings
        const amenitiesSettingsRef = doc(db, 'settings', 'amenities');
        const amenitiesSettingsDoc = await getDoc(amenitiesSettingsRef);

        if (!amenitiesSettingsDoc.exists()) {
          // Create initial amenities settings if they don't exist
          const initialAmenitiesSettings = {
            items: [
              'Wi-Fi',
              'TV',
              'Air Conditioning',
              'Mini Bar',
              'Safe',
              'Room Service',
              'Coffee Maker',
              'Hair Dryer',
              'Iron',
              'Work Desk',
              'Bathtub',
              'Shower',
              'Balcony',
              'City View',
              'Pool Access',
              'Gym Access',
              'Spa Access',
              'Lounge Access',
            ],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };
          await setDoc(amenitiesSettingsRef, initialAmenitiesSettings);
          setAmenitiesSettings(initialAmenitiesSettings);
        } else {
          setAmenitiesSettings(amenitiesSettingsDoc.data() as AmenitiesSettings);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load settings',
          variant: 'destructive',
        });
      }
    };

    initializeSettings();
  }, [user, theme, toast]);

  const handleHotelSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Validate required fields
      if (!hotelSettings.name.trim()) {
        toast({
          title: 'Error',
          description: 'Hotel name is required',
          variant: 'destructive',
        });
        return;
      }

      // Validate tax rate
      if (hotelSettings.taxRate < 0 || hotelSettings.taxRate > 100) {
        toast({
          title: 'Error',
          description: 'Tax rate must be between 0 and 100',
          variant: 'destructive',
        });
        return;
      }

      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(hotelSettings.checkInTime) || !timeRegex.test(hotelSettings.checkOutTime)) {
        toast({
          title: 'Error',
          description: 'Invalid time format',
          variant: 'destructive',
        });
        return;
      }

      const settingsRef = doc(db, 'settings', 'hotel');
      await setDoc(settingsRef, {
        ...hotelSettings,
        name: hotelSettings.name.trim(),
        address: hotelSettings.address.trim(),
        phone: hotelSettings.phone.trim(),
        email: hotelSettings.email.toLowerCase().trim(),
        website: hotelSettings.website.trim(),
        currency: hotelSettings.currency.trim().toUpperCase(),
        updatedAt: Timestamp.now(),
      }, { merge: true });

      toast({
        title: 'Success',
        description: 'Hotel settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating hotel settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update hotel settings',
        variant: 'destructive',
      });
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Validate required fields
      if (!userProfile.name.trim() || !userProfile.email.trim()) {
        toast({
          title: 'Error',
          description: 'Name and email are required',
          variant: 'destructive',
        });
        return;
      }

      // Update profile with validation
      await setDoc(userRef, {
        ...userProfile,
        email: userProfile.email.toLowerCase().trim(),
        phone: userProfile.phone.trim(),
        updatedAt: Timestamp.now(),
      }, { merge: true });

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleAppSettingsChange = async (setting: keyof AppSettings, value: boolean) => {
    if (!user) return;

    try {
      const newSettings = { ...appSettings, [setting]: value };
      
      // Handle dark mode
      if (setting === 'darkMode') {
        setTheme(value ? 'dark' : 'light');
      }

      setAppSettings(newSettings);

      const settingsRef = doc(db, 'users', user.uid, 'settings', 'app');
      await updateDoc(settingsRef, {
        [setting]: value,
        updatedAt: Timestamp.now(),
      });

      toast({
        title: 'Success',
        description: 'App settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating app settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update app settings',
        variant: 'destructive',
      });
      // Revert the setting on error
      setAppSettings(prev => ({ ...prev, [setting]: !value }));
    }
  };

  const handleRestaurantSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Validate required fields
      if (!restaurantSettings.name.trim()) {
        toast({
          title: 'Error',
          description: 'Restaurant name is required',
          variant: 'destructive',
        });
        return;
      }

      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!restaurantSettings.isOpen24Hours) {
        if (!timeRegex.test(restaurantSettings.openTime) || !timeRegex.test(restaurantSettings.closeTime)) {
          toast({
            title: 'Error',
            description: 'Invalid time format',
            variant: 'destructive',
          });
          return;
        }
      }

      // Validate meal periods
      for (const period of restaurantSettings.mealPeriods) {
        if (!timeRegex.test(period.startTime) || !timeRegex.test(period.endTime)) {
          toast({
            title: 'Error',
            description: `Invalid time format for ${period.name}`,
            variant: 'destructive',
          });
          return;
        }
      }

      const settingsRef = doc(db, 'settings', 'restaurant');
      await setDoc(settingsRef, {
        ...restaurantSettings,
        name: restaurantSettings.name.trim(),
        description: restaurantSettings.description.trim(),
        updatedAt: Timestamp.now(),
      }, { merge: true });

      toast({
        title: 'Success',
        description: 'Restaurant settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating restaurant settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update restaurant settings',
        variant: 'destructive',
      });
    }
  };

  const handleAmenitiesSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const settingsRef = doc(db, 'settings', 'amenities');
      await setDoc(settingsRef, {
        ...amenitiesSettings,
        updatedAt: Timestamp.now(),
      }, { merge: true });

      toast({
        title: 'Success',
        description: 'Amenities settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating amenities settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update amenities settings',
        variant: 'destructive',
      });
    }
  };

  const handleAddAmenity = () => {
    if (!newAmenity.trim()) return;
    
    // Check if amenity already exists
    if (amenitiesSettings.items.includes(newAmenity.trim())) {
      toast({
        title: 'Error',
        description: 'This amenity already exists',
        variant: 'destructive',
      });
      return;
    }
    
    setAmenitiesSettings(prev => ({
      ...prev,
      items: [...prev.items, newAmenity.trim()]
    }));
    setNewAmenity('');
  };

  const handleRemoveAmenity = (amenity: string) => {
    setAmenitiesSettings(prev => ({
      ...prev,
      items: prev.items.filter(item => item !== amenity)
    }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-10">
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading settings...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="hotel">Hotel</TabsTrigger>
            <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="app">App Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your personal information and contact details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    />
                  </div>
                  <Button type="submit">Save Profile</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hotel">
            <Card>
              <CardHeader>
                <CardTitle>Hotel Settings</CardTitle>
                <CardDescription>
                  Configure your hotel's basic information and operational settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleHotelSettingsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hotelName">Hotel Name</Label>
                    <Input
                      id="hotelName"
                      value={hotelSettings.name}
                      onChange={(e) => setHotelSettings({ ...hotelSettings, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={hotelSettings.address}
                      onChange={(e) => setHotelSettings({ ...hotelSettings, address: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkIn">Check-in Time</Label>
                      <Input
                        id="checkIn"
                        type="time"
                        value={hotelSettings.checkInTime}
                        onChange={(e) => setHotelSettings({ ...hotelSettings, checkInTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOut">Check-out Time</Label>
                      <Input
                        id="checkOut"
                        type="time"
                        value={hotelSettings.checkOutTime}
                        onChange={(e) => setHotelSettings({ ...hotelSettings, checkOutTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        value={hotelSettings.currency}
                        onChange={(e) => setHotelSettings({ ...hotelSettings, currency: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        value={hotelSettings.taxRate}
                        onChange={(e) => setHotelSettings({ ...hotelSettings, taxRate: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <Button type="submit">Save Hotel Settings</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restaurant">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Settings</CardTitle>
                <CardDescription>
                  Configure your restaurant's information and meal service periods.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRestaurantSettingsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurantName">Restaurant Name</Label>
                    <Input
                      id="restaurantName"
                      value={restaurantSettings.name}
                      onChange={(e) => setRestaurantSettings({ ...restaurantSettings, name: e.target.value })}
                      placeholder="Main Restaurant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={restaurantSettings.description}
                      onChange={(e) => setRestaurantSettings({ ...restaurantSettings, description: e.target.value })}
                      placeholder="A fine dining experience..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Seating Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={restaurantSettings.capacity}
                        onChange={(e) => setRestaurantSettings({ ...restaurantSettings, capacity: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tableCount">Number of Tables</Label>
                      <Input
                        id="tableCount"
                        type="number"
                        value={restaurantSettings.tableCount}
                        onChange={(e) => setRestaurantSettings({ ...restaurantSettings, tableCount: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="24hours"
                      checked={restaurantSettings.isOpen24Hours}
                      onCheckedChange={(checked) => setRestaurantSettings({ ...restaurantSettings, isOpen24Hours: checked })}
                    />
                    <Label htmlFor="24hours">Open 24 Hours</Label>
                  </div>
                  {!restaurantSettings.isOpen24Hours && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="openTime">Opening Time</Label>
                        <Input
                          id="openTime"
                          type="time"
                          value={restaurantSettings.openTime}
                          onChange={(e) => setRestaurantSettings({ ...restaurantSettings, openTime: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="closeTime">Closing Time</Label>
                        <Input
                          id="closeTime"
                          type="time"
                          value={restaurantSettings.closeTime}
                          onChange={(e) => setRestaurantSettings({ ...restaurantSettings, closeTime: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <Label>Meal Periods</Label>
                    {restaurantSettings.mealPeriods.map((period, index) => (
                      <div key={period.name} className="grid grid-cols-4 gap-4 items-center border p-4 rounded-lg">
                        <div className="space-y-2">
                          <Label htmlFor={`mealName${index}`}>Name</Label>
                          <Input
                            id={`mealName${index}`}
                            value={period.name}
                            onChange={(e) => {
                              const newPeriods = [...restaurantSettings.mealPeriods];
                              newPeriods[index].name = e.target.value;
                              setRestaurantSettings({ ...restaurantSettings, mealPeriods: newPeriods });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`startTime${index}`}>Start Time</Label>
                          <Input
                            id={`startTime${index}`}
                            type="time"
                            value={period.startTime}
                            onChange={(e) => {
                              const newPeriods = [...restaurantSettings.mealPeriods];
                              newPeriods[index].startTime = e.target.value;
                              setRestaurantSettings({ ...restaurantSettings, mealPeriods: newPeriods });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`endTime${index}`}>End Time</Label>
                          <Input
                            id={`endTime${index}`}
                            type="time"
                            value={period.endTime}
                            onChange={(e) => {
                              const newPeriods = [...restaurantSettings.mealPeriods];
                              newPeriods[index].endTime = e.target.value;
                              setRestaurantSettings({ ...restaurantSettings, mealPeriods: newPeriods });
                            }}
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                          <Switch
                            id={`active${index}`}
                            checked={period.isActive}
                            onCheckedChange={(checked) => {
                              const newPeriods = [...restaurantSettings.mealPeriods];
                              newPeriods[index].isActive = checked;
                              setRestaurantSettings({ ...restaurantSettings, mealPeriods: newPeriods });
                            }}
                          />
                          <Label htmlFor={`active${index}`}>Active</Label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dressCode">Dress Code</Label>
                    <Select
                      value={restaurantSettings.dressCode}
                      onValueChange={(value: RestaurantSettings['dressCode']) => 
                        setRestaurantSettings({ ...restaurantSettings, dressCode: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select dress code" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Smart Casual">Smart Casual</SelectItem>
                        <SelectItem value="Formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit">Save Restaurant Settings</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="amenities">
            <Card>
              <CardHeader>
                <CardTitle>Amenities Settings</CardTitle>
                <CardDescription>
                  Manage the list of amenities available for rooms.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAmenitiesSettingsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newAmenity">Add New Amenity</Label>
                    <div className="flex gap-2">
                      <Input
                        id="newAmenity"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        placeholder="Enter amenity name"
                      />
                      <Button type="button" onClick={handleAddAmenity}>Add</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Current Amenities</Label>
                    <div className="border rounded-md p-4">
                      <div className="flex flex-wrap gap-2">
                        {amenitiesSettings.items.map((amenity) => (
                          <div key={amenity} className="flex items-center bg-muted rounded-full px-3 py-1">
                            <span className="mr-2">{amenity}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 rounded-full"
                              onClick={() => handleRemoveAmenity(amenity)}
                            >
                              <span className="sr-only">Remove</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-3 w-3"
                              >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit">Save Amenities Settings</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="app">
            <Card>
              <CardHeader>
                <CardTitle>App Settings</CardTitle>
                <CardDescription>
                  Customize your application preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <div className="text-sm text-muted-foreground">
                      Enable dark mode for a better viewing experience at night
                    </div>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={appSettings.darkMode}
                    onCheckedChange={(checked) => handleAppSettingsChange('darkMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 