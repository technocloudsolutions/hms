import { Timestamp } from 'firebase/firestore';

export interface Room {
  id?: string;
  number: string;
  type: 'Single' | 'Double' | 'Suite' | 'Deluxe' | 'Presidential';
  price: number;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Cleaning';
  amenities: string[];
  description: string;
  images: string[];  // Array of image URLs
  floor: number;
  capacity: number;
  size: number;  // in square meters/feet
  view: 'City' | 'Ocean' | 'Garden' | 'Mountain' | 'Pool';
  bedType: 'Single' | 'Double' | 'Queen' | 'King';
  lastCleaned: Timestamp;
  lastMaintenance: Timestamp;
  rating: number;
  reviews: number;
  specialOffers: string[];
  accessibility: boolean;
  smoking: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  idType: string;
  idNumber: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Booking {
  id: string;
  guestId: string;
  roomId: string;
  checkIn: Timestamp;
  checkOut: Timestamp;
  status: 'Confirmed' | 'Cancelled' | 'Completed';
  totalAmount: number;
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  status: 'Available' | 'Unavailable';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GuestBooking extends Guest {
  bookings: Booking[];
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  type: 'Indoor' | 'Outdoor' | 'Sightseeing' | 'Cultural' | 'Adventure';
  duration: number; // in hours
  price: number;
  location: string;
  distance: number; // distance from hotel in km
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  maxParticipants: number;
  included: string[];
  requirements: string[];
  images: string[];
  schedule: {
    days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[];
    startTime: string;
    endTime: string;
  };
  isAvailable: boolean;
  rating: number;
  reviews: number;
  bookingRequired: boolean;
  minimumAge: number;
  status: 'Active' | 'Inactive' | 'Seasonal';
  season: ('Spring' | 'Summer' | 'Autumn' | 'Winter')[];
  // SEO Fields
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
    focusKeyword: string;
    metaRobotsIndex: 'index' | 'noindex';
    metaRobotsFollow: 'follow' | 'nofollow';
    openGraphTitle: string;
    openGraphDescription: string;
    openGraphImage?: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage?: string;
    article: {
      content: string;
      excerpt: string;
      author: string;
      publishedTime: Timestamp;
      modifiedTime: Timestamp;
      sections: {
        title: string;
        content: string;
      }[];
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  category: 'News' | 'Events' | 'Travel' | 'Dining' | 'Lifestyle' | 'Offers';
  tags: string[];
  featuredImage: string;
  status: 'Draft' | 'Published' | 'Archived';
  publishDate: Timestamp;
  // SEO Fields
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
    focusKeyword: string;
    metaRobotsIndex: 'index' | 'noindex';
    metaRobotsFollow: 'follow' | 'nofollow';
    openGraphTitle: string;
    openGraphDescription: string;
    openGraphImage?: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin?: Timestamp;
  isActive: boolean;
}

export type UserRole = 'admin' | 'manager' | 'receptionist' | 'staff';

export interface RolePermission {
  role: UserRole;
  permissions: {
    dashboard: boolean;
    rooms: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    bookings: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    guests: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    services: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    restaurant: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    activities: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    gallery: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    blog: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    reports: {
      view: boolean;
      export: boolean;
    };
    users: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    settings: boolean;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  relatedTo?: {
    type: 'booking' | 'guest' | 'room' | 'service' | 'system';
    id?: string;
  };
  createdAt: Timestamp;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export';
  resourceType: 'booking' | 'guest' | 'room' | 'service' | 'user' | 'system' | 'report';
  resourceId?: string;
  details?: string;
  timestamp: Timestamp;
  ipAddress?: string;
}

export interface ReportData {
  id: string;
  name: string;
  type: 'bookings' | 'revenue' | 'occupancy' | 'guests';
  dateRange: {
    start: Timestamp;
    end: Timestamp;
  };
  data: any;
  createdBy: string;
  createdAt: Timestamp;
  format?: 'pdf' | 'csv' | 'excel';
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  isFeatured?: boolean;
  displayOrder?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MenuItem {
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

export interface Invoice {
  id: string;
  bookingId: string;
  guestId: string;
  invoiceNumber: string;
  issueDate: Timestamp;
  dueDate: Timestamp;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: 'USD' | 'LKR';
  exchangeRate?: number; // For LKR conversion
  notes?: string;
  status: 'Draft' | 'Issued' | 'Paid' | 'Overdue' | 'Cancelled';
  paymentMethod?: 'Credit Card' | 'Cash' | 'Bank Transfer' | 'PayPal';
  paymentDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  type: 'Room' | 'Service' | 'Activity' | 'Food' | 'Other';
} 