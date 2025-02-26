'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getBookingStats, getOccupancyStats, getGuestStats, saveReport, logActivity } from '@/lib/firebase';
import { ReportData } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { BarChart, LineChart, PieChart } from '@/components/reports/Charts';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [dateRange, setDateRange] = useState('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [bookingStats, setBookingStats] = useState<any>(null);
  const [occupancyStats, setOccupancyStats] = useState<any>(null);
  const [guestStats, setGuestStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }
      
      try {
        // Fetch stats based on active tab
        if (activeTab === 'bookings' || activeTab === 'revenue') {
          const stats = await getBookingStats(startDate, endDate);
          setBookingStats(stats);
        }
        
        if (activeTab === 'occupancy') {
          const stats = await getOccupancyStats(startDate, endDate);
          setOccupancyStats(stats);
        }
        
        if (activeTab === 'guests') {
          const stats = await getGuestStats(startDate, endDate);
          setGuestStats(stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [activeTab, dateRange]);

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      // In a real app, you would generate the actual file here
      // For now, we'll just save a record of the export
      
      let data;
      let name;
      
      switch (activeTab) {
        case 'bookings':
          data = bookingStats;
          name = `Booking Report - ${new Date().toLocaleDateString()}`;
          break;
        case 'revenue':
          data = bookingStats;
          name = `Revenue Report - ${new Date().toLocaleDateString()}`;
          break;
        case 'occupancy':
          data = occupancyStats;
          name = `Occupancy Report - ${new Date().toLocaleDateString()}`;
          break;
        case 'guests':
          data = guestStats;
          name = `Guest Report - ${new Date().toLocaleDateString()}`;
          break;
        default:
          data = bookingStats;
          name = `Report - ${new Date().toLocaleDateString()}`;
      }
      
      // Save report record
      const reportData: Omit<ReportData, 'id'> = {
        name,
        type: activeTab as any,
        dateRange: {
          start: Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
          end: Timestamp.fromDate(new Date())
        },
        data,
        createdBy: 'currentUserId', // In a real app, this would be the current user's ID
        createdAt: Timestamp.now(),
        format
      };
      
      await saveReport(reportData);
      
      // Log activity
      await logActivity({
        userId: 'currentUserId', // In a real app, this would be the current user's ID
        userName: 'John Doe', // In a real app, this would be the current user's name
        action: 'export',
        resourceType: 'report',
        details: `Exported ${activeTab} report as ${format.toUpperCase()}`,
        timestamp: Timestamp.now()
      });
      
      // In a real app, you would trigger the actual file download here
      alert(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-primary">Loading...</div>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'bookings':
        return bookingStats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-2">Total Bookings</h3>
                <p className="text-3xl font-bold">{bookingStats.totalBookings}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-2">Confirmed Bookings</h3>
                <p className="text-3xl font-bold">{bookingStats.confirmedBookings}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-2">Cancelled Bookings</h3>
                <p className="text-3xl font-bold">{bookingStats.cancelledBookings}</p>
              </Card>
            </div>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Bookings Over Time</h3>
              <div className="h-80">
                <LineChart 
                  data={bookingStats.bookingsByDay.map((day: any) => ({
                    date: day.date,
                    value: day.count
                  }))}
                  xKey="date"
                  yKey="value"
                  label="Bookings"
                />
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Booking Status Distribution</h3>
              <div className="h-80">
                <PieChart 
                  data={[
                    { name: 'Confirmed', value: bookingStats.confirmedBookings },
                    { name: 'Cancelled', value: bookingStats.cancelledBookings },
                    { name: 'Completed', value: bookingStats.completedBookings }
                  ]}
                />
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center p-6">No booking data available</div>
        );
        
      case 'revenue':
        return bookingStats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold">${bookingStats.totalRevenue.toLocaleString()}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-2">Paid Revenue</h3>
                <p className="text-3xl font-bold">${bookingStats.paidRevenue.toLocaleString()}</p>
              </Card>
            </div>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Revenue Over Time</h3>
              <div className="h-80">
                <BarChart 
                  data={bookingStats.revenueByDay.map((day: any) => ({
                    date: day.date,
                    value: day.revenue
                  }))}
                  xKey="date"
                  yKey="value"
                  label="Revenue"
                />
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center p-6">No revenue data available</div>
        );
        
      case 'occupancy':
        return occupancyStats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-2">Total Rooms</h3>
                <p className="text-3xl font-bold">{occupancyStats.totalRooms}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-2">Average Occupancy</h3>
                <p className="text-3xl font-bold">{occupancyStats.averageOccupancy.toFixed(1)}%</p>
              </Card>
            </div>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Occupancy Rate Over Time</h3>
              <div className="h-80">
                <LineChart 
                  data={occupancyStats.occupancyByDay.map((day: any) => ({
                    date: day.date,
                    value: day.occupancyRate
                  }))}
                  xKey="date"
                  yKey="value"
                  label="Occupancy Rate (%)"
                />
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center p-6">No occupancy data available</div>
        );
        
      case 'guests':
        return guestStats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-2">Total Guests</h3>
                <p className="text-3xl font-bold">{guestStats.totalGuests}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-2">New Guests</h3>
                <p className="text-3xl font-bold">{guestStats.newGuests}</p>
              </Card>
            </div>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">New Guests Over Time</h3>
              <div className="h-80">
                <BarChart 
                  data={guestStats.guestsByDay.map((day: any) => ({
                    date: day.date,
                    value: day.count
                  }))}
                  xKey="date"
                  yKey="value"
                  label="New Guests"
                />
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center p-6">No guest data available</div>
        );
        
      default:
        return <div className="text-center p-6">Select a report type</div>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">View and export detailed reports</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="pdf">
              <SelectTrigger className="w-[180px]">
                <Download className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Export as..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf" onSelect={() => handleExport('pdf')}>Export as PDF</SelectItem>
                <SelectItem value="csv" onSelect={() => handleExport('csv')}>Export as CSV</SelectItem>
                <SelectItem value="excel" onSelect={() => handleExport('excel')}>Export as Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="bookings" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
            <TabsTrigger value="guests">Guests</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {renderContent()}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 