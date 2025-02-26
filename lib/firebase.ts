import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  writeBatch,
  getDoc
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { User as CustomUser, UserRole, ActivityLog, Notification, ReportData, Activity, BlogPost, GalleryImage, MenuItem, Booking, Guest } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyAh049bHx7iEyt6bIxoo52vQb5v3cqiysw",
  authDomain: "hmsys-a7364.firebaseapp.com",
  projectId: "hmsys-a7364",
  storageBucket: "hmsys-a7364.firebasestorage.app",
  messagingSenderId: "440403800339",
  appId: "1:440403800339:web:a3de682a18a1c3f1016ae6",
  measurementId: "G-X0B0T59JKH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Image upload helper functions
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be less than 5MB');
    }

    // Create a unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}_${file.name}`;
    const fullPath = `${path}/${uniqueFilename}`;

    // Upload the file
    const storageRef = ref(storage, fullPath);
    await uploadBytes(storageRef, file);

    // Get and return the download URL
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadImages = async (files: File[], folder: string): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

export const deleteImage = async (url: string) => {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Types
export interface Room {
  id: string;
  number: string;
  type: 'Single' | 'Double' | 'Suite';
  price: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  amenities: string[];
}

export interface Service {
  id: string;
  name: string;
  price: number;
  category: 'Room Service' | 'Laundry' | 'Dining' | 'Spa';
  available: boolean;
}

// Auth functions
export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Room functions
export const getRooms = async () => {
  try {
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, orderBy('number'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Room[];
  } catch (error: any) {
    console.error('Error getting rooms:', error);
    return [];
  }
};

export const addRoom = async (roomData: Omit<Room, 'id'>) => {
  try {
    const roomsRef = collection(db, 'rooms');
    const docRef = await addDoc(roomsRef, roomData);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateRoom = async (id: string, roomData: Partial<Room>) => {
  try {
    const roomRef = doc(db, 'rooms', id);
    await updateDoc(roomRef, roomData);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteRoom = async (id: string) => {
  try {
    const roomRef = doc(db, 'rooms', id);
    await deleteDoc(roomRef);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Guest functions
export const getGuests = async () => {
  try {
    const guestsRef = collection(db, 'guests');
    const q = query(guestsRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Guest[];
  } catch (error: any) {
    console.error('Error getting guests:', error);
    return [];
  }
};

export const addGuest = async (guestData: Omit<Guest, 'id'>) => {
  try {
    const guestsRef = collection(db, 'guests');
    const docRef = await addDoc(guestsRef, guestData);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateGuest = async (id: string, guestData: Partial<Guest>) => {
  try {
    const guestRef = doc(db, 'guests', id);
    await updateDoc(guestRef, guestData);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteGuest = async (id: string) => {
  try {
    const guestRef = doc(db, 'guests', id);
    await deleteDoc(guestRef);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Booking functions
export const getRecentBookings = async (bookingLimit: number = 5) => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    // Apply limit manually
    const bookings = querySnapshot.docs
      .slice(0, bookingLimit)
      .map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get room and guest details for each booking
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking: any) => {
        const roomDoc = await getDoc(doc(db, 'rooms', booking.roomId));
        const guestDoc = await getDoc(doc(db, 'guests', booking.guestId));
        
        return {
          ...booking,
          room: roomDoc.exists() ? { id: roomDoc.id, ...roomDoc.data() } : null,
          guest: guestDoc.exists() ? { id: guestDoc.id, ...guestDoc.data() } : null
        };
      })
    );
    
    return bookingsWithDetails;
  } catch (error: any) {
    console.error('Error getting recent bookings:', error);
    return [];
  }
};

export const addBooking = async (bookingData: Omit<Booking, 'id'>) => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const docRef = await addDoc(bookingsRef, bookingData);
    
    // Update room status
    const roomRef = doc(db, 'rooms', bookingData.roomId);
    await updateDoc(roomRef, { status: 'Occupied' });
    
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateBooking = async (id: string, bookingData: Partial<Booking>) => {
  try {
    const bookingRef = doc(db, 'bookings', id);
    await updateDoc(bookingRef, bookingData);
    
    // If status is updated to Completed or Cancelled, update room status
    if (bookingData.status === 'Completed' || bookingData.status === 'Cancelled') {
      const booking = (await getDocs(query(collection(db, 'bookings'), where('id', '==', id)))).docs[0]?.data() as Booking;
      const roomRef = doc(db, 'rooms', booking.roomId);
      await updateDoc(roomRef, { status: 'Available' });
    }
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteBooking = async (id: string) => {
  try {
    const bookingRef = doc(db, 'bookings', id);
    await deleteDoc(bookingRef);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getDashboardStats = async () => {
  try {
    // Get total rooms
    const roomsSnapshot = await getDocs(collection(db, 'rooms'));
    const totalRooms = roomsSnapshot.size;
    const occupiedRooms = roomsSnapshot.docs.filter(
      doc => doc.data().status === 'Occupied'
    ).length;

    // Get guests today - modified to avoid composite index requirement
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);
    
    // Use a simpler query with just one condition
    const guestsSnapshot = await getDocs(
      query(
        collection(db, 'guests')
      )
    );
    
    // Filter in memory instead of in the query
    const guestsToday = guestsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.status === 'Checked In' && 
             data.checkIn && 
             data.checkIn >= todayTimestamp;
    }).length;

    // Get bookings stats
    const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
    const totalBookings = bookingsSnapshot.size;
    const completedBookings = bookingsSnapshot.docs.filter(
      doc => doc.data().status === 'Completed'
    ).length;

    // Get revenue
    const revenue = bookingsSnapshot.docs.reduce((total, doc) => {
      const booking = doc.data();
      return total + (booking.status === 'Completed' ? booking.totalAmount : 0);
    }, 0);

    return {
      totalRooms,
      occupancyRate: Math.round((occupiedRooms / totalRooms) * 100),
      guestsToday,
      bookingRate: Math.round((completedBookings / totalBookings) * 100),
      revenue
    };
  } catch (error: any) {
    console.error('Error getting dashboard stats:', error);
    return null;
  }
};

// User Management Functions
export const getUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const getUserById = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', userId)));
    if (userDoc.empty) {
      return null;
    }
    return { id: userDoc.docs[0].id, ...userDoc.docs[0].data() };
  } catch (error: any) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const createUser = async (userData: Omit<CustomUser, 'id'>) => {
  try {
    const usersRef = collection(db, 'users');
    const docRef = await addDoc(usersRef, userData);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateUser = async (id: string, userData: Partial<CustomUser>) => {
  try {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, userData);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteUser = async (id: string) => {
  try {
    const userRef = doc(db, 'users', id);
    await deleteDoc(userRef);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getRolePermissions = async (role: UserRole) => {
  try {
    const permissionsRef = collection(db, 'rolePermissions');
    const q = query(permissionsRef, where('role', '==', role));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
  } catch (error: any) {
    console.error('Error getting role permissions:', error);
    return null;
  }
};

// Notification Functions
export const getNotifications = async (userId: string, limitCount = 10) => {
  try {
    // Simpler query that doesn't require a composite index
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef, 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    // Sort and limit manually after fetching
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Notification))
      .sort((a, b) => {
        // Sort by createdAt in descending order
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limitCount);
  } catch (error: any) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

export const createNotification = async (notificationData: Omit<Notification, 'id'>) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const docRef = await addDoc(notificationsRef, notificationData);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const markNotificationAsRead = async (id: string) => {
  try {
    const notificationRef = doc(db, 'notifications', id);
    await updateDoc(notificationRef, { isRead: true });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef, 
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });
    
    await batch.commit();
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Activity Logging Functions
export const logActivity = async (activityData: Omit<ActivityLog, 'id'>) => {
  try {
    const activitiesRef = collection(db, 'activityLogs');
    const docRef = await addDoc(activitiesRef, activityData);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const getActivityLogs = async (limitCount = 50) => {
  try {
    const logsRef = collection(db, 'activityLogs');
    const q = query(
      logsRef,
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    // Apply limit manually
    return querySnapshot.docs
      .slice(0, limitCount)
      .map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.error('Error getting activity logs:', error);
    return [];
  }
};

export const getUserActivityLogs = async (userId: string, limitCount = 50) => {
  try {
    const logsRef = collection(db, 'activityLogs');
    const q = query(
      logsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    // Apply limit manually
    return querySnapshot.docs
      .slice(0, limitCount)
      .map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.error('Error getting user activity logs:', error);
    return [];
  }
};

// Reporting Functions
export const getBookingStats = async (startDate: Date, endDate: Date) => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    const q = query(
      bookingsRef,
      where('checkIn', '>=', startTimestamp),
      where('checkIn', '<=', endTimestamp)
    );
    
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    
    // Calculate statistics
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;
    const completedBookings = bookings.filter(b => b.status === 'Completed').length;
    
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const paidRevenue = bookings
      .filter(b => b.paymentStatus === 'Paid')
      .reduce((sum, booking) => sum + booking.totalAmount, 0);
    
    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue,
      paidRevenue,
      bookingsByDay: calculateBookingsByDay(bookings, startDate, endDate),
      revenueByDay: calculateRevenueByDay(bookings, startDate, endDate),
    };
  } catch (error: any) {
    console.error('Error getting booking stats:', error);
    return null;
  }
};

export const getOccupancyStats = async (startDate: Date, endDate: Date) => {
  try {
    // Get all rooms
    const roomsRef = collection(db, 'rooms');
    const roomsSnapshot = await getDocs(roomsRef);
    const totalRooms = roomsSnapshot.docs.length;
    
    // Get bookings for the period
    const bookingsRef = collection(db, 'bookings');
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    const q = query(
      bookingsRef,
      where('status', '!=', 'Cancelled')
    );
    
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calculate occupancy for each day in the range
    const occupancyByDay = calculateOccupancyByDay(bookings, totalRooms, startDate, endDate);
    
    // Calculate average occupancy
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const averageOccupancy = occupancyByDay.reduce((sum, day) => sum + day.occupancyRate, 0) / totalDays;
    
    return {
      totalRooms,
      averageOccupancy,
      occupancyByDay,
    };
  } catch (error: any) {
    console.error('Error getting occupancy stats:', error);
    return null;
  }
};

export const getGuestStats = async (startDate: Date, endDate: Date) => {
  try {
    const guestsRef = collection(db, 'guests');
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    // Use a simpler query without multiple conditions
    const q = query(guestsRef);
    
    const querySnapshot = await getDocs(q);
    
    // Filter in memory instead of in the query
    const guests = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as any))
      .filter(guest => {
        return guest.createdAt && 
               guest.createdAt >= startTimestamp && 
               guest.createdAt <= endTimestamp;
      });
    
    return {
      totalGuests: guests.length,
      newGuests: guests.length,
      guestsByDay: calculateGuestsByDay(guests, startDate, endDate),
    };
  } catch (error: any) {
    console.error('Error getting guest stats:', error);
    return null;
  }
};

export const saveReport = async (reportData: Omit<ReportData, 'id'>) => {
  try {
    const reportsRef = collection(db, 'reports');
    const docRef = await addDoc(reportsRef, reportData);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const getReports = async (limitCount = 10) => {
  try {
    const reportsRef = collection(db, 'reports');
    const q = query(
      reportsRef,
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    // Apply limit manually
    return querySnapshot.docs
      .slice(0, limitCount)
      .map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.error('Error getting reports:', error);
    return [];
  }
};

// Helper functions for statistics calculations
const calculateBookingsByDay = (bookings: Booking[], startDate: Date, endDate: Date) => {
  const days = getDaysArray(startDate, endDate);
  
  return days.map(day => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayBookings = bookings.filter((booking: Booking) => {
      const checkIn = booking.checkIn.toDate();
      return checkIn >= dayStart && checkIn <= dayEnd;
    });
    
    return {
      date: day,
      count: dayBookings.length
    };
  });
};

const calculateRevenueByDay = (bookings: Booking[], startDate: Date, endDate: Date) => {
  const days = getDaysArray(startDate, endDate);
  
  return days.map(day => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayBookings = bookings.filter((booking: Booking) => {
      const checkIn = booking.checkIn.toDate();
      return checkIn >= dayStart && checkIn <= dayEnd;
    });
    
    const revenue = dayBookings.reduce((sum: number, booking: Booking) => sum + booking.totalAmount, 0);
    
    return {
      date: day,
      revenue
    };
  });
};

const calculateOccupancyByDay = (bookings: Booking[], totalRooms: number, startDate: Date, endDate: Date) => {
  const days = getDaysArray(startDate, endDate);
  
  return days.map(day => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    const occupiedRooms = bookings.filter((booking: Booking) => {
      const checkIn = booking.checkIn.toDate();
      const checkOut = booking.checkOut.toDate();
      return (checkIn <= dayEnd && checkOut >= dayStart);
    });
    
    const uniqueRoomIds = [...new Set(occupiedRooms.map((booking: Booking) => booking.roomId))];
    const occupancyRate = (uniqueRoomIds.length / totalRooms) * 100;
    
    return {
      date: day,
      occupancyRate: Math.round(occupancyRate)
    };
  });
};

const calculateGuestsByDay = (guests: Guest[], startDate: Date, endDate: Date) => {
  const days = getDaysArray(startDate, endDate);
  
  return days.map(day => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayGuests = guests.filter((guest: Guest) => {
      const createdAt = guest.createdAt.toDate();
      return createdAt >= dayStart && createdAt <= dayEnd;
    });
    
    return {
      date: day,
      count: dayGuests.length
    };
  });
};

const getDaysArray = (start: Date, end: Date) => {
  const arr = [];
  const dt = new Date(start);
  
  while (dt <= end) {
    arr.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }
  
  return arr;
};

// Service functions
export const getServices = async () => {
  try {
    const servicesRef = collection(db, 'services');
    const q = query(servicesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[];
  } catch (error: any) {
    console.error('Error getting services:', error);
    return [];
  }
};

export const getServiceById = async (id: string) => {
  try {
    const serviceDoc = await getDoc(doc(db, 'services', id));
    if (!serviceDoc.exists()) {
      return null;
    }
    return { id: serviceDoc.id, ...serviceDoc.data() } as Service;
  } catch (error: any) {
    console.error('Error getting service by ID:', error);
    return null;
  }
};

export const addService = async (serviceData: Omit<Service, 'id'>) => {
  try {
    const servicesRef = collection(db, 'services');
    const docRef = await addDoc(servicesRef, {
      ...serviceData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { id: docRef.id, ...serviceData };
  } catch (error: any) {
    console.error('Error adding service:', error);
    throw error;
  }
};

export const updateService = async (id: string, serviceData: Partial<Service>) => {
  try {
    const serviceRef = doc(db, 'services', id);
    await updateDoc(serviceRef, {
      ...serviceData,
      updatedAt: Timestamp.now()
    });
    return { id, ...serviceData };
  } catch (error: any) {
    console.error('Error updating service:', error);
    throw error;
  }
};

export const deleteService = async (id: string) => {
  try {
    const serviceRef = doc(db, 'services', id);
    await deleteDoc(serviceRef);
    return true;
  } catch (error: any) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

// Activity functions
export const getActivities = async () => {
  try {
    const activitiesRef = collection(db, 'activities');
    const q = query(activitiesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Activity[];
  } catch (error: any) {
    console.error('Error getting activities:', error);
    return [];
  }
};

export const getActivityById = async (id: string) => {
  try {
    const activityDoc = await getDoc(doc(db, 'activities', id));
    if (!activityDoc.exists()) {
      return null;
    }
    return { id: activityDoc.id, ...activityDoc.data() } as Activity;
  } catch (error: any) {
    console.error('Error getting activity by ID:', error);
    return null;
  }
};

export const addActivity = async (activityData: Omit<Activity, 'id'>) => {
  try {
    const activitiesRef = collection(db, 'activities');
    const docRef = await addDoc(activitiesRef, {
      ...activityData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { id: docRef.id, ...activityData };
  } catch (error: any) {
    console.error('Error adding activity:', error);
    throw error;
  }
};

export const updateActivity = async (id: string, activityData: Partial<Activity>) => {
  try {
    const activityRef = doc(db, 'activities', id);
    await updateDoc(activityRef, {
      ...activityData,
      updatedAt: Timestamp.now()
    });
    return { id, ...activityData };
  } catch (error: any) {
    console.error('Error updating activity:', error);
    throw error;
  }
};

export const deleteActivity = async (id: string) => {
  try {
    const activityRef = doc(db, 'activities', id);
    await deleteDoc(activityRef);
    return true;
  } catch (error: any) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};

// Blog functions
export const getBlogPosts = async () => {
  try {
    const blogRef = collection(db, 'blog');
    const q = query(blogRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogPost[];
  } catch (error: any) {
    console.error('Error getting blog posts:', error);
    return [];
  }
};

export const getBlogPostById = async (id: string) => {
  try {
    const blogDoc = await getDoc(doc(db, 'blog', id));
    if (!blogDoc.exists()) {
      return null;
    }
    return { id: blogDoc.id, ...blogDoc.data() } as BlogPost;
  } catch (error: any) {
    console.error('Error getting blog post by ID:', error);
    return null;
  }
};

export const getBlogPostBySlug = async (slug: string) => {
  try {
    const blogRef = collection(db, 'blog');
    const q = query(blogRef, where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as BlogPost;
  } catch (error: any) {
    console.error('Error getting blog post by slug:', error);
    return null;
  }
};

export const addBlogPost = async (blogData: Omit<BlogPost, 'id'>) => {
  try {
    // Check if slug already exists
    const existingPost = await getBlogPostBySlug(blogData.slug);
    if (existingPost) {
      throw new Error('A blog post with this slug already exists');
    }
    
    const blogRef = collection(db, 'blog');
    const docRef = await addDoc(blogRef, {
      ...blogData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { id: docRef.id, ...blogData };
  } catch (error: any) {
    console.error('Error adding blog post:', error);
    throw error;
  }
};

export const updateBlogPost = async (id: string, blogData: Partial<BlogPost>) => {
  try {
    // If slug is being updated, check if it already exists
    if (blogData.slug) {
      const existingPost = await getBlogPostBySlug(blogData.slug);
      if (existingPost && existingPost.id !== id) {
        throw new Error('A blog post with this slug already exists');
      }
    }
    
    const blogRef = doc(db, 'blog', id);
    await updateDoc(blogRef, {
      ...blogData,
      updatedAt: Timestamp.now()
    });
    return { id, ...blogData };
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};

export const deleteBlogPost = async (id: string) => {
  try {
    const blogRef = doc(db, 'blog', id);
    await deleteDoc(blogRef);
    return true;
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

// Gallery functions
export const getGalleryImages = async () => {
  try {
    const galleryRef = collection(db, 'gallery');
    const q = query(galleryRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryImage[];
  } catch (error: any) {
    console.error('Error getting gallery images:', error);
    return [];
  }
};

export const getGalleryImageById = async (id: string) => {
  try {
    const imageDoc = await getDoc(doc(db, 'gallery', id));
    if (!imageDoc.exists()) {
      return null;
    }
    return { id: imageDoc.id, ...imageDoc.data() } as GalleryImage;
  } catch (error: any) {
    console.error('Error getting gallery image by ID:', error);
    return null;
  }
};

export const addGalleryImage = async (imageData: Omit<GalleryImage, 'id'>) => {
  try {
    const galleryRef = collection(db, 'gallery');
    const docRef = await addDoc(galleryRef, {
      ...imageData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { id: docRef.id, ...imageData };
  } catch (error: any) {
    console.error('Error adding gallery image:', error);
    throw error;
  }
};

export const updateGalleryImage = async (id: string, imageData: Partial<GalleryImage>) => {
  try {
    const imageRef = doc(db, 'gallery', id);
    await updateDoc(imageRef, {
      ...imageData,
      updatedAt: Timestamp.now()
    });
    return { id, ...imageData };
  } catch (error: any) {
    console.error('Error updating gallery image:', error);
    throw error;
  }
};

export const deleteGalleryImage = async (id: string) => {
  try {
    // Get the image to delete its URL from storage
    const imageDoc = await getDoc(doc(db, 'gallery', id));
    if (imageDoc.exists()) {
      const imageData = imageDoc.data() as GalleryImage;
      if (imageData.url) {
        // Delete the image from storage
        await deleteImage(imageData.url);
      }
    }
    
    // Delete the document from Firestore
    const imageRef = doc(db, 'gallery', id);
    await deleteDoc(imageRef);
    return true;
  } catch (error: any) {
    console.error('Error deleting gallery image:', error);
    throw error;
  }
};

// Restaurant Menu functions
export const getMenuItems = async () => {
  try {
    console.log('Firebase: getMenuItems called');
    const menuRef = collection(db, 'menuItems');
    console.log('Firebase: executing query without orderBy');
    const querySnapshot = await getDocs(menuRef);
    console.log('Firebase: query executed, doc count:', querySnapshot.docs.length);
    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuItem[];
    console.log('Firebase: returning items:', items);
    return items;
  } catch (error: any) {
    console.error('Firebase: Error getting menu items:', error);
    return [];
  }
};

export const getMenuItemById = async (id: string) => {
  try {
    const menuItemDoc = await getDoc(doc(db, 'menuItems', id));
    if (!menuItemDoc.exists()) {
      return null;
    }
    return { id: menuItemDoc.id, ...menuItemDoc.data() } as MenuItem;
  } catch (error: any) {
    console.error('Error getting menu item by ID:', error);
    return null;
  }
};

export const getMenuItemsByCategory = async (category: string) => {
  try {
    console.log('Firebase: getMenuItemsByCategory called with category:', category);
    const menuRef = collection(db, 'menuItems');
    // Use only the where clause without orderBy
    const q = query(menuRef, where('category', '==', category));
    console.log('Firebase: executing query with category filter');
    const querySnapshot = await getDocs(q);
    console.log('Firebase: query executed, doc count:', querySnapshot.docs.length);
    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuItem[];
    console.log('Firebase: returning items:', items);
    return items;
  } catch (error: any) {
    console.error('Firebase: Error getting menu items by category:', error);
    return [];
  }
};

export const addMenuItem = async (menuItemData: Omit<MenuItem, 'id'>) => {
  try {
    console.log('Firebase: addMenuItem called with data:', menuItemData);
    const menuRef = collection(db, 'menuItems');
    const docData = {
      ...menuItemData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    console.log('Firebase: adding document with data:', docData);
    const docRef = await addDoc(menuRef, docData);
    console.log('Firebase: document added with ID:', docRef.id);
    return { id: docRef.id, ...menuItemData };
  } catch (error: any) {
    console.error('Firebase: Error adding menu item:', error);
    throw error;
  }
};

export const updateMenuItem = async (id: string, menuItemData: Partial<MenuItem>) => {
  try {
    const menuItemRef = doc(db, 'menuItems', id);
    await updateDoc(menuItemRef, {
      ...menuItemData,
      updatedAt: Timestamp.now()
    });
    return { id, ...menuItemData };
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};

export const deleteMenuItem = async (id: string) => {
  try {
    // Get the menu item to delete its image from storage if it exists
    const menuItemDoc = await getDoc(doc(db, 'menuItems', id));
    if (menuItemDoc.exists()) {
      const menuItemData = menuItemDoc.data() as MenuItem;
      if (menuItemData.image) {
        // Delete the image from storage
        await deleteImage(menuItemData.image);
      }
    }
    
    // Delete the document from Firestore
    const menuItemRef = doc(db, 'menuItems', id);
    await deleteDoc(menuItemRef);
    return true;
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

// Statistics functions
export const getStatistics = async (startDate: Date, endDate: Date) => {
  try {
    // Get all bookings
    const bookingsRef = collection(db, 'bookings');
    const bookingsSnapshot = await getDocs(bookingsRef);
    const bookings = bookingsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Booking[];
    
    // Get all guests
    const guestsRef = collection(db, 'guests');
    const guestsSnapshot = await getDocs(guestsRef);
    const guests = guestsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Guest[];
    
    // Get total rooms count
    const roomsRef = collection(db, 'rooms');
    const roomsSnapshot = await getDocs(roomsRef);
    const totalRooms = roomsSnapshot.size;
    
    // Calculate statistics
    const bookingsByDay = calculateBookingsByDay(bookings, startDate, endDate);
    const revenueByDay = calculateRevenueByDay(bookings, startDate, endDate);
    const occupancyByDay = calculateOccupancyByDay(bookings, totalRooms, startDate, endDate);
    const guestsByDay = calculateGuestsByDay(guests, startDate, endDate);
    
    // Calculate totals
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const totalGuests = guests.length;
    
    return {
      bookingsByDay,
      revenueByDay,
      occupancyByDay,
      guestsByDay,
      totalBookings,
      totalRevenue,
      totalGuests,
      totalRooms
    };
  } catch (error: any) {
    console.error('Error getting statistics:', error);
    throw error;
  }
}; 