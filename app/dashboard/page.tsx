'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import {
  BedDouble,
  Users,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
} from 'lucide-react';
import { getDashboardStats, getRecentBookings } from '@/lib/firebase';

interface DashboardStats {
  totalRooms: number;
  occupancyRate: number;
  guestsToday: number;
  bookingRate: number;
  revenue: number;
}

interface RecentBooking {
  guest: string;
  room: string;
  checkIn: string;
  status: string;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching dashboard data...');
        
        // Fetch dashboard stats
        const dashboardStats = await getDashboardStats();
        if (dashboardStats) {
          console.log('Dashboard stats received:', dashboardStats);
          setStats(dashboardStats);
        } else {
          console.log('No dashboard stats received');
        }

        // Fetch recent bookings
        const bookings = await getRecentBookings(4);
        console.log('Recent bookings received:', bookings);
        
        if (Array.isArray(bookings) && bookings.length > 0) {
          const formattedBookings = bookings.map(booking => {
            // Safely access nested properties
            const guestName = booking.guest?.name || 'Unknown';
            const roomNumber = booking.room?.number ? `Room ${booking.room.number}` : 'N/A';
            
            // Safely handle date conversion
            let checkInDate = 'N/A';
            try {
              if (booking.checkIn && booking.checkIn.seconds) {
                checkInDate = new Date(booking.checkIn.seconds * 1000).toLocaleDateString();
              }
            } catch (error) {
              console.error('Error formatting check-in date:', error);
            }
            
            // Determine status
            const status = booking.status === 'Completed' ? 'Checked Out' : 
                          booking.status === 'Confirmed' ? 'Checked In' : 'Reserved';
            
            return {
              guest: guestName,
              room: roomNumber,
              checkIn: checkInDate,
              status: status
            };
          });
          
          console.log('Formatted bookings:', formattedBookings);
          setRecentBookings(formattedBookings);
        } else {
          console.log('No bookings received or empty array');
          setRecentBookings([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default values in case of error
        setStats(null);
        setRecentBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsData = [
    {
      title: 'Total Rooms',
      value: stats?.totalRooms?.toString() || '0',
      change: '+5%',
      trend: 'up',
      icon: BedDouble,
    },
    {
      title: 'Guests Today',
      value: stats?.guestsToday?.toString() || '0',
      change: '+12%',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Bookings',
      value: `${stats?.bookingRate || 0}%`,
      change: `${((stats?.bookingRate || 0) - 80).toFixed(1)}%`,
      trend: ((stats?.bookingRate || 0) - 80) > 0 ? 'up' : 'down',
      icon: CalendarCheck,
    },
    {
      title: 'Revenue',
      value: `$${(stats?.revenue || 0).toLocaleString()}`,
      change: '+8%',
      trend: 'up',
      icon: DollarSign,
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-primary">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back to your hotel dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat) => (
            <Card key={stat.title} className="p-6 backdrop-blur-xl bg-card/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${
                      stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Bookings */}
        <Card className="backdrop-blur-xl bg-card/50">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left pb-3 text-muted-foreground font-medium">Guest</th>
                    <th className="text-left pb-3 text-muted-foreground font-medium">Room</th>
                    <th className="text-left pb-3 text-muted-foreground font-medium">Check In</th>
                    <th className="text-left pb-3 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking, index) => (
                      <tr key={index} className="border-b border-border/50 last:border-0">
                        <td className="py-3">{booking.guest || 'Unknown'}</td>
                        <td className="py-3">{booking.room || 'N/A'}</td>
                        <td className="py-3">{booking.checkIn || 'N/A'}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            booking.status === 'Checked In'
                              ? 'bg-green-500/10 text-green-500'
                              : booking.status === 'Reserved'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {booking.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-muted-foreground">
                        No recent bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 backdrop-blur-xl bg-card/50">
            <h2 className="text-xl font-semibold mb-4">Occupancy Rate</h2>
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                <Percent className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-3xl font-bold">{stats?.occupancyRate || 0}%</h3>
                <p className="text-muted-foreground">Current occupancy</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-card/50">
            <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-3xl font-bold">+12.5%</h3>
                <p className="text-muted-foreground">From last month</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 