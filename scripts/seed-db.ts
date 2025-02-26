import { readFileSync } from 'fs';
import { join } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Read service account file
const serviceAccount = JSON.parse(
  readFileSync(join(process.cwd(), 'service-account.json'), 'utf-8')
);

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const now = Timestamp.now();

const rooms = [
  {
    number: '101',
    type: 'Single',
    price: 100,
    status: 'Available',
    amenities: ['WiFi', 'TV', 'AC', 'Mini Fridge', 'Safe'],
    description: 'Cozy single room with city view, perfect for solo travelers.',
    images: [],
    floor: 1,
    capacity: 1,
    size: 25,
    view: 'City',
    bedType: 'Single',
    lastCleaned: Timestamp.fromDate(new Date()),
    lastMaintenance: Timestamp.fromDate(new Date()),
    rating: 4.5,
    reviews: 12,
    specialOffers: ['Early Bird Discount', 'Extended Stay Deal'],
    accessibility: true,
    smoking: false,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date())
  },
  {
    number: '102',
    type: 'Double',
    price: 150,
    status: 'Occupied',
    amenities: ['WiFi', 'TV', 'AC', 'Mini Fridge', 'Safe', 'Desk', 'Balcony'],
    description: 'Spacious double room with mountain view and private balcony.',
    images: [],
    floor: 1,
    capacity: 2,
    size: 35,
    view: 'Mountain',
    bedType: 'Queen',
    lastCleaned: Timestamp.fromDate(new Date()),
    lastMaintenance: Timestamp.fromDate(new Date()),
    rating: 4.8,
    reviews: 18,
    specialOffers: ['Honeymoon Package'],
    accessibility: true,
    smoking: false,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date())
  },
  {
    number: '201',
    type: 'Suite',
    price: 250,
    status: 'Available',
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Safe', 'Desk', 'Balcony', 'Jacuzzi', 'Kitchen'],
    description: 'Luxury suite with ocean view, jacuzzi, and fully equipped kitchen.',
    images: [],
    floor: 2,
    capacity: 3,
    size: 50,
    view: 'Ocean',
    bedType: 'King',
    lastCleaned: Timestamp.fromDate(new Date()),
    lastMaintenance: Timestamp.fromDate(new Date()),
    rating: 5.0,
    reviews: 24,
    specialOffers: ['Luxury Package', 'Spa Included'],
    accessibility: true,
    smoking: false,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date())
  },
  {
    number: '202',
    type: 'Deluxe',
    price: 200,
    status: 'Maintenance',
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Safe', 'Desk', 'Garden Access'],
    description: 'Deluxe room with direct garden access and sitting area.',
    images: [],
    floor: 2,
    capacity: 2,
    size: 40,
    view: 'Garden',
    bedType: 'Queen',
    lastCleaned: Timestamp.fromDate(new Date()),
    lastMaintenance: Timestamp.fromDate(new Date()),
    rating: 4.7,
    reviews: 15,
    specialOffers: ['Weekend Special'],
    accessibility: false,
    smoking: false,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date())
  },
  {
    number: '301',
    type: 'Presidential',
    price: 500,
    status: 'Available',
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Safe', 'Office', 'Terrace', 'Jacuzzi', 'Kitchen', 'Private Pool'],
    description: 'Presidential suite with panoramic views, private pool, and luxury amenities.',
    images: [],
    floor: 3,
    capacity: 4,
    size: 100,
    view: 'Ocean',
    bedType: 'King',
    lastCleaned: Timestamp.fromDate(new Date()),
    lastMaintenance: Timestamp.fromDate(new Date()),
    rating: 5.0,
    reviews: 8,
    specialOffers: ['VIP Package', 'Butler Service'],
    accessibility: true,
    smoking: false,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date())
  }
];

const guests = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    address: '123 Main St, New York, NY',
    idType: 'Passport',
    idNumber: 'AB123456',
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date())
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    address: '456 Park Ave, Los Angeles, CA',
    idType: 'Driver License',
    idNumber: 'DL789012',
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date())
  }
];

const bookings = [
  {
    guestId: '1',
    roomId: '102',
    checkIn: Timestamp.fromDate(new Date()),
    checkOut: Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
    status: 'Confirmed',
    totalAmount: 450,
    paymentStatus: 'Paid',
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date())
  },
  {
    guestId: '2',
    roomId: '201',
    checkIn: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    checkOut: Timestamp.fromDate(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)),
    status: 'Confirmed',
    totalAmount: 750,
    paymentStatus: 'Pending',
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date())
  }
];

const services = [
  {
    name: 'Room Service - Breakfast',
    description: 'Continental breakfast served in your room',
    category: 'Room Service',
    price: 25,
    status: 'Available',
    createdAt: now,
    updatedAt: now,
  },
  {
    name: 'Laundry Service',
    description: 'Same-day laundry and dry cleaning service',
    category: 'Laundry',
    price: 30,
    status: 'Available',
    createdAt: now,
    updatedAt: now,
  },
  {
    name: 'Spa Massage',
    description: '60-minute full body massage',
    category: 'Spa & Wellness',
    price: 120,
    status: 'Available',
    createdAt: now,
    updatedAt: now,
  },
  {
    name: 'Airport Transfer',
    description: 'Luxury car transfer to/from airport',
    category: 'Transportation',
    price: 80,
    status: 'Available',
    createdAt: now,
    updatedAt: now,
  },
  {
    name: 'Event Space Rental',
    description: 'Conference room rental with AV equipment',
    category: 'Events',
    price: 500,
    status: 'Available',
    createdAt: now,
    updatedAt: now,
  },
];

async function seedDatabase() {
  try {
    // Add services
    console.log('Adding services...');
    const servicesRef = db.collection('services');
    for (const service of services) {
      await servicesRef.add(service);
    }
    console.log('Services added successfully!');

    // Add rooms
    const roomsRef = db.collection('rooms');
    for (const room of rooms) {
      await roomsRef.add(room);
    }
    console.log('Rooms added successfully');

    // Add guests
    const guestsRef = db.collection('guests');
    for (const guest of guests) {
      await guestsRef.add(guest);
    }
    console.log('Guests added successfully');

    // Add bookings
    const bookingsRef = db.collection('bookings');
    for (const booking of bookings) {
      await bookingsRef.add(booking);
    }
    console.log('Bookings added successfully');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 