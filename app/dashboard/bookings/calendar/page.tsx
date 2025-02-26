'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Booking, Room, Guest } from '@/lib/types';
import { collection, getDocs, query, where, Timestamp, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Helper function to get days in a month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper function to get the day of week (0-6) for the first day of the month
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Helper function to get month name
const getMonthName = (month: number) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
};

export default function BookingsCalendarPage() {
  const router = useRouter();
  const { toast } = useToast();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const date = new Date(today);
    const day = date.getDay();
    date.setDate(date.getDate() - day);
    return date;
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedView, setSelectedView] = useState<'month' | 'week'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);

  // Fetch bookings, rooms, and guests
  const [roomsSnapshot] = useCollection(collection(db, 'rooms'));
  const [bookingsSnapshot] = useCollection(collection(db, 'bookings'));
  const [guestsSnapshot] = useCollection(collection(db, 'guests'));

  // Memoize the filtered bookings to prevent unnecessary recalculations
  const filterBookingsForPeriod = useCallback((allBookings: Booking[], year: number, month: number) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    return allBookings.filter(booking => {
      try {
        if (!booking.checkIn || !booking.checkOut) return false;
        
        const checkIn = booking.checkIn.toDate();
        const checkOut = booking.checkOut.toDate();
        
        // A booking is in the current month if:
        // 1. Check-in date is before or equal to the end of the month AND
        // 2. Check-out date is after or equal to the start of the month
        return checkIn <= endDate && checkOut >= startDate;
      } catch (error) {
        console.error('Error processing booking dates:', error, booking);
        return false;
      }
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get rooms data from snapshot
        if (roomsSnapshot) {
          const roomsData = roomsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
            id: doc.id, 
            ...doc.data() 
          })) as Room[];
          setRooms(roomsData);
        }
        
        // Get bookings data from snapshot
        if (bookingsSnapshot) {
          const allBookings = bookingsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            return { 
              id: doc.id, 
              ...data 
            } as Booking;
          });
          
          // Filter bookings for the current month client-side
          const filteredBookings = filterBookingsForPeriod(allBookings, currentYear, currentMonth);
          setBookings(filteredBookings);
        }

        // Get guests data from snapshot
        if (guestsSnapshot) {
          const guestsData = guestsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
            id: doc.id, 
            ...doc.data() 
          })) as Guest[];
          setGuests(guestsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load bookings data. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load bookings data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    };
    
    fetchData();
  }, [currentYear, currentMonth, roomsSnapshot, bookingsSnapshot, guestsSnapshot, toast, filterBookingsForPeriod]);

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleAddBooking = () => {
    router.push('/dashboard/bookings?action=new');
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setOpen(true);
  };

  const handleBookingClick = (bookingId: string) => {
    // Instead of navigating, just show booking details in a dialog
    const selectedBooking = bookings.find(b => b.id === bookingId);
    if (selectedBooking) {
      // Make sure we never pass the actual guest object to the dialog
      console.log('Selected booking ID:', bookingId);
      console.log('Booking guest ID:', selectedBooking.guestId);
      
      // Deliberately remove any guest object references before setting state
      const cleanedBooking = {
        ...selectedBooking,
        // Ensure we're not accidentally storing a reference to the guest object
        guest: undefined
      };
      
      setSelectedBooking(cleanedBooking);
      setBookingDetailsOpen(true);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // The useCollection hook will automatically refresh the data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAddBookingForDate = () => {
    if (selectedDate) {
      router.push(`/dashboard/bookings?action=new&date=${formatDate(selectedDate)}`);
    }
  };

  const handleViewBookingsForDate = () => {
    if (selectedDate) {
      router.push(`/dashboard/bookings?date=${formatDate(selectedDate)}`);
    }
  };

  // Memoize the filtered bookings for the selected date
  const getDateBookings = useCallback((date: Date | null) => {
    if (!date) return [];
    
    return bookings.filter(booking => {
      if (!booking.checkIn || !booking.checkOut) return false;
      
      try {
        const checkIn = booking.checkIn.toDate();
        const checkOut = booking.checkOut.toDate();
        const selectedDateCopy = new Date(date);
        return selectedDateCopy >= new Date(checkIn.setHours(0,0,0,0)) && 
               selectedDateCopy <= new Date(checkOut.setHours(23,59,59,999));
      } catch (error) {
        console.error('Error processing booking dates:', error, booking);
        return false;
      }
    });
  }, [bookings]);

  // Add state for booking details dialog
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);

  // Add this before the return statement
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-500/10 text-green-500';
      case 'Cancelled':
        return 'bg-red-500/10 text-red-500';
      case 'Completed':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500/10 text-green-500';
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'Refunded':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };
  
  // Helper function to safely get guest information
  const getGuestName = (guestId: string): string => {
    if (!guestId) return 'Unknown Guest';
    if (!guests || guests.length === 0) return 'Loading guest...';
    
    try {
      const guest = guests.find(g => g.id === guestId);
      // Explicitly check that we have a name and it's a string before returning it
      if (guest && guest.name && typeof guest.name === 'string') {
        return guest.name;
      } else {
        console.log('Found guest without valid name:', guestId, guest ? JSON.stringify(guest) : 'undefined');
        return 'Unknown Guest';
      }
    } catch (error) {
      console.error('Error getting guest name:', error);
      return 'Error loading guest';
    }
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-border/50 bg-muted/20"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = formatDate(date);
      const isToday = formatDate(today) === dateString;
      
      // Find bookings for this day
      const dayBookings = bookings.filter(booking => {
        if (!booking.checkIn || !booking.checkOut) return false;
        
        try {
          const checkIn = booking.checkIn.toDate();
          const checkOut = booking.checkOut.toDate();
          return date >= new Date(checkIn.setHours(0,0,0,0)) && 
                 date <= new Date(checkOut.setHours(23,59,59,999));
        } catch (error) {
          console.error('Error processing booking dates:', error, booking);
          return false;
        }
      });
      
      days.push(
        <div 
          key={day} 
          className={`h-24 border border-border/50 p-1 overflow-hidden ${
            isToday ? 'bg-primary/5' : ''
          } hover:bg-muted/30 cursor-pointer transition-colors`}
          onClick={() => handleDayClick(date)}
          role="button"
          tabIndex={0}
          aria-label={`${day} ${getMonthName(currentMonth)}, ${currentYear}. ${dayBookings.length} bookings`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleDayClick(date);
            }
          }}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
              {day}
            </span>
            {dayBookings.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-1 rounded">
                {dayBookings.length}
              </span>
            )}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-[calc(100%-20px)]">
            {dayBookings.slice(0, 3).map(booking => {
              const room = rooms.find(r => r.id === booking.roomId);
              return (
                <div 
                  key={booking.id}
                  className="text-xs p-1 rounded bg-primary/10 truncate cursor-pointer hover:bg-primary/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookingClick(booking.id);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Booking for room ${room?.number || 'unknown'}, status: ${booking.status}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      handleBookingClick(booking.id);
                    }
                  }}
                >
                  {room?.number || 'Room'} - {booking.status}
                </div>
              );
            })}
            {dayBookings.length > 3 && (
              <div className="text-xs text-muted-foreground text-center">
                +{dayBookings.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center py-2 font-medium text-sm">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = [];
    
    // Create 7 days for the week view
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      const dateString = formatDate(date);
      const isToday = formatDate(today) === dateString;
      
      // Find bookings for this day
      const dayBookings = bookings.filter(booking => {
        if (!booking.checkIn || !booking.checkOut) return false;
        
        try {
          const checkIn = booking.checkIn.toDate();
          const checkOut = booking.checkOut.toDate();
          return date >= new Date(checkIn.setHours(0,0,0,0)) && 
                 date <= new Date(checkOut.setHours(23,59,59,999));
        } catch (error) {
          console.error('Error processing booking dates:', error, booking);
          return false;
        }
      });
      
      days.push(
        <div key={i} className="flex flex-col h-full">
          <div className={`text-center py-2 font-medium text-sm ${
            isToday ? 'text-primary' : ''
          }`}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
            <div className={`text-lg ${isToday ? 'text-primary' : ''}`}>
              {date.getDate()}
            </div>
          </div>
          <div 
            className={`flex-1 border border-border/50 p-2 overflow-y-auto ${
              isToday ? 'bg-primary/5' : ''
            } hover:bg-muted/30 cursor-pointer transition-colors`}
            onClick={() => handleDayClick(date)}
            role="button"
            tabIndex={0}
            aria-label={`${date.getDate()} ${getMonthName(date.getMonth())}, ${date.getFullYear()}. ${dayBookings.length} bookings`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleDayClick(date);
              }
            }}
          >
            {dayBookings.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center h-full flex items-center justify-center">
                No bookings
              </div>
            ) : (
              dayBookings.map(booking => {
                const room = rooms.find(r => r.id === booking.roomId);
                return (
                  <div 
                    key={booking.id}
                    className="text-xs p-2 mb-2 rounded bg-primary/10 cursor-pointer hover:bg-primary/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookingClick(booking.id);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Booking for room ${room?.number || 'unknown'}, from ${booking.checkIn.toDate().toLocaleDateString()} to ${booking.checkOut.toDate().toLocaleDateString()}, status: ${booking.status}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        handleBookingClick(booking.id);
                      }
                    }}
                  >
                    <div className="font-medium">Room {room?.number || 'N/A'}</div>
                    <div className="text-muted-foreground">
                      {booking.checkIn.toDate().toLocaleDateString()} - {booking.checkOut.toDate().toLocaleDateString()}
                    </div>
                    <div className={`mt-1 text-xs px-1 py-0.5 rounded-full inline-block ${
                      booking.status === 'Confirmed' ? 'bg-green-500/10 text-green-500' :
                      booking.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-2 h-[600px]">
        {days}
      </div>
    );
  };

  // Memoize the date bookings for the dialog
  const dateBookings = selectedDate ? getDateBookings(selectedDate) : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Bookings Calendar</h1>
            <p className="text-muted-foreground">View and manage bookings in calendar view</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading || refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
            
            {selectedView === 'month' ? (
              <>
                <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium min-w-[120px] text-center">
                  {getMonthName(currentMonth)} {currentYear}
                </div>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium min-w-[120px] text-center">
                  {currentWeekStart.toLocaleDateString()} - {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </div>
                <Button variant="outline" size="sm" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            
            <Select value={selectedView} onValueChange={(value: 'month' | 'week') => setSelectedView(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleAddBooking}>
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>
        
        <Card className="p-4">
          {isLoading ? (
            <div className="h-[600px] flex items-center justify-center">
              <div className="animate-pulse text-primary">Loading...</div>
            </div>
          ) : error ? (
            <div className="h-[600px] flex items-center justify-center flex-col gap-4">
              <div className="text-destructive">{error}</div>
              <Button onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="h-[600px] flex items-center justify-center flex-col gap-4">
              <div className="text-muted-foreground">No bookings found for this period</div>
              <Button onClick={handleAddBooking}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Booking
              </Button>
            </div>
          ) : (
            selectedView === 'month' ? renderMonthView() : renderWeekView()
          )}
        </Card>
        
        {/* Date Selection Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedDate ? `Bookings for ${selectedDate.toLocaleDateString()}` : 'Select Action'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                What would you like to do with this date?
              </p>
              
              {selectedDate && (
                <div className="border rounded-md p-3 bg-muted/20">
                  <h3 className="font-medium mb-2">Bookings on this date:</h3>
                  {dateBookings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No bookings for this date.</p>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {dateBookings.map((booking: Booking) => {
                        const room = rooms.find(r => r.id === booking.roomId);
                        return (
                          <div 
                            key={booking.id}
                            className="text-sm p-2 rounded bg-primary/10 cursor-pointer hover:bg-primary/20"
                            onClick={() => {
                              setOpen(false);
                              handleBookingClick(booking.id);
                            }}
                          >
                            <div className="font-medium">Room {room?.number || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">
                              {booking.checkIn.toDate().toLocaleDateString()} - {booking.checkOut.toDate().toLocaleDateString()}
                            </div>
                            <div className={`mt-1 text-xs px-1 py-0.5 rounded-full inline-block ${
                              booking.status === 'Confirmed' ? 'bg-green-500/10 text-green-500' :
                              booking.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                              'bg-blue-500/10 text-blue-500'
                            }`}>
                              {booking.status}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button onClick={handleAddBookingForDate}>
                  Create New Booking
                </Button>
                <Button variant="secondary" onClick={handleViewBookingsForDate}>
                  View All Bookings for This Date
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Booking Details Dialog */}
        <Dialog open={bookingDetailsOpen} onOpenChange={setBookingDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Guest</h3>
                    <p className="text-base font-medium">
                      {selectedBooking.guestId ? getGuestName(selectedBooking.guestId) : 'No guest selected'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Room</h3>
                    <p className="text-base font-medium">
                      {(() => {
                        const room = rooms.find(r => r.id === selectedBooking.roomId);
                        return room ? `Room ${room.number}` : 'Unknown Room';
                      })()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Check In</h3>
                    <p className="text-base font-medium">
                      {selectedBooking.checkIn ? selectedBooking.checkIn.toDate().toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Check Out</h3>
                    <p className="text-base font-medium">
                      {selectedBooking.checkOut ? selectedBooking.checkOut.toDate().toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p className={`text-base font-medium px-2 py-1 rounded-full inline-block ${getStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Payment Status</h3>
                    <p className={`text-base font-medium px-2 py-1 rounded-full inline-block ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                      {selectedBooking.paymentStatus || 'Not set'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
                  <p className="text-base font-medium">
                    ${selectedBooking.totalAmount.toLocaleString()}
                  </p>
                </div>

                <div className="pt-4 border-t flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setBookingDetailsOpen(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setBookingDetailsOpen(false);
                      router.push(`/dashboard/bookings?id=${selectedBooking.id}`);
                    }}
                  >
                    Edit Booking
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 