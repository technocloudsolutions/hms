'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getInvoiceById, getExchangeRate, getGuestById, getRoomById } from '@/lib/firebase';
import { Invoice, Guest, Room } from '@/lib/types';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ArrowLeft, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import Head from 'next/head';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Image from 'next/image';
import InvoiceSignatures from '@/components/InvoiceSignatures';
import InvoiceImplLive from '@/components/InvoiceImplLive';

// Extend the Invoice type to include roomId property that might be present
interface ExtendedInvoice extends Invoice {
  roomId?: string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<ExtendedInvoice | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  // Use Record<string, any> to avoid type issues with Room
  const [room, setRoom] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [convertedCurrency, setConvertedCurrency] = useState<'USD' | 'LKR' | null>(null);
  const [convertedRate, setConvertedRate] = useState<number>(1);
  const [convertedTotal, setConvertedTotal] = useState<number>(0);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const id = params.id as string;
        const invoiceData = await getInvoiceById(id) as ExtendedInvoice | null;
        
        if (!invoiceData) {
          toast({
            title: 'Error',
            description: 'Invoice not found',
            variant: 'destructive',
          });
          router.push('/dashboard/invoices');
          return;
        }
        
        setInvoice(invoiceData);
        
        // Fetch real guest data
        if (invoiceData.guestId) {
          try {
            const guestData = await getGuestById(invoiceData.guestId);
            if (guestData) {
              setGuest(guestData);
            } else {
              // Fallback if guest not found
              setGuest({
                id: invoiceData.guestId,
                name: 'Guest',
                email: 'guest@example.com',
                phone: '+1234567890',
                address: 'Address not available',
                idType: 'Unknown',
                idNumber: 'Unknown',
                createdAt: invoiceData.createdAt,
                updatedAt: invoiceData.updatedAt,
              });
            }
          } catch (error) {
            console.error('Error fetching guest:', error);
            // Fallback if guest fetch fails
            setGuest({
              id: invoiceData.guestId,
              name: 'Guest',
              email: 'guest@example.com',
              phone: '+1234567890',
              address: 'Address not available',
              idType: 'Unknown',
              idNumber: 'Unknown',
              createdAt: invoiceData.createdAt,
              updatedAt: invoiceData.updatedAt,
            });
          }
        }
        
        // Fetch real room data
        const roomId = invoiceData.roomId || 'default-room-id';
        try {
          const roomData = await getRoomById(roomId);
          if (roomData) {
            setRoom(roomData);
          } else {
            // Create fallback room data
            const extractedRoomNumber = 
              invoiceData.items?.[0]?.description?.split(' - ')?.[0]?.replace('Room ', '') || '101';
            
            const extractedRoomType = 
              (invoiceData.items?.[0]?.description?.split(' - ')?.[1] || 'Suite');
            
            setRoom({
              id: 'room-id',
              number: extractedRoomNumber,
              type: extractedRoomType,
              price: invoiceData.items?.[0]?.unitPrice || 150,
              status: 'Occupied',
              amenities: ['WiFi', 'TV', 'AC'],
              description: 'Room details not available',
              images: [],
              floor: 1,
              capacity: 2,
              size: 30,
              view: 'Ocean',
              bedType: 'King',
              lastCleaned: invoiceData.createdAt,
              lastMaintenance: invoiceData.createdAt,
              rating: 4.5,
              reviews: 10,
              specialOffers: [],
              accessibility: true,
              smoking: false,
            });
          }
        } catch (error) {
          console.error('Error fetching room:', error);
          // Fallback with room data
          setRoom({
            id: 'room-id',
            number: invoiceData.items?.[0]?.description?.split(' - ')?.[0]?.replace('Room ', '') || '101',
            type: 'Suite',
            price: invoiceData.items?.[0]?.unitPrice || 150,
            status: 'Occupied',
            amenities: ['WiFi', 'TV', 'AC'],
            description: 'Room details not available',
            images: [],
            floor: 1,
            capacity: 2,
            size: 30,
            view: 'Ocean',
            bedType: 'King',
            lastCleaned: invoiceData.createdAt,
            lastMaintenance: invoiceData.createdAt,
            rating: 4.5,
            reviews: 10,
            specialOffers: [],
            accessibility: true,
            smoking: false,
          });
        }
        
      } catch (error) {
        console.error('Error fetching invoice:', error);
        toast({
          title: 'Error',
          description: 'Failed to load invoice details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoice();
  }, [params.id, router, toast]);

  const handleCurrencyConversion = async () => {
    if (!invoice) return;
    
    try {
      const targetCurrency = invoice.currency === 'USD' ? 'LKR' : 'USD';
      const rate = await getExchangeRate(invoice.currency, targetCurrency);
      
      setConvertedCurrency(targetCurrency as 'USD' | 'LKR');
      setConvertedRate(rate);
      setConvertedTotal(invoice.totalAmount * rate);
      
      toast({
        title: 'Currency Converted',
        description: `Showing equivalent in ${targetCurrency}`,
      });
    } catch (error) {
      console.error('Error converting currency:', error);
      toast({
        title: 'Error',
        description: 'Failed to convert currency',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number | undefined, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Format date in a more readable format
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Update the PDF generation to better handle images, especially the logo
  const handleDownloadPDF = async () => {
    if (!invoice) return;

    try {
      // Show loading toast
      toast({
        title: 'Generating PDF',
        description: 'Please wait while we generate your invoice PDF...',
      });

      // Get the print-invoice element
      const element = document.getElementById('print-invoice');
      if (!element) {
        throw new Error('Could not find invoice element');
      }

      // Make the element visible temporarily for capturing
      const originalDisplay = element.style.display;
      element.style.display = 'block';

      // Update address text handling to prevent cropping in PDF
      const applyDarkTextStyles = (element: HTMLElement) => {
        element.style.color = '#000000';
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.textShadow = 'none';
        element.style.backgroundColor = '#ffffff';
        
        // Fix text cropping in the header section
        if (element.classList.contains('print-header')) {
          const addressDiv = element.querySelector('.text-muted-foreground');
          if (addressDiv) {
            (addressDiv as HTMLElement).style.lineHeight = '1.4';
            (addressDiv as HTMLElement).style.marginTop = '5px';
            
            // Make sure each paragraph in the address has sufficient height
            const paragraphs = addressDiv.querySelectorAll('p');
            paragraphs.forEach(p => {
              (p as HTMLElement).style.marginBottom = '4px';
              (p as HTMLElement).style.paddingBottom = '1px';
            });
          }
        }
        
        if (element.classList.contains('text-muted-foreground')) {
          element.style.color = '#333333';
          element.style.lineHeight = '1.4';
        }
        
        if (element.tagName === 'TABLE') {
          element.style.borderCollapse = 'collapse';
          element.style.border = '1px solid #ddd';
        }
        
        if (element.tagName === 'TH' || element.tagName === 'TD') {
          element.style.padding = '8px';
          element.style.border = '1px solid #ddd';
          element.style.color = '#000000';
        }
        
        if (element.tagName === 'TH') {
          element.style.fontWeight = 'bold';
          element.style.backgroundColor = '#f2f2f2';
          element.style.color = '#000000';
        }
        
        // Ensure images are visible and properly sized
        if (element.tagName === 'IMG') {
          element.style.maxWidth = '100%';
          element.style.height = 'auto';
          element.style.display = 'block';
        }
        
        // Improve logo image rendering
        if (element.classList.contains('print-logo')) {
          const img = element.querySelector('img');
          if (img) {
            img.style.width = '110px';
            img.style.height = '110px';
            img.style.objectFit = 'contain';
          }
        }
        
        Array.from(element.children).forEach(child => {
          applyDarkTextStyles(child as HTMLElement);
        });
      };
      
      // Create a clone of the element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Set the exact width for A4 paper size
      clone.style.width = '210mm'; // A4 width
      clone.style.padding = '10mm'; // Standard margin
      clone.style.backgroundColor = '#ffffff';
      clone.style.boxSizing = 'border-box';
      clone.style.borderRadius = '0'; // Remove any border radius for PDF
      clone.style.boxShadow = 'none'; // Remove any box shadows
      clone.style.border = 'none'; // Remove border for PDF
      
      // Apply styles to ensure text is visible
      applyDarkTextStyles(clone);
      
      // Temporarily append the clone to the document
      document.body.appendChild(clone);

      // Make sure images are loaded before taking screenshot
      const loadImage = (image: HTMLImageElement): Promise<void> => {
        return new Promise((resolve) => {
          if (image.complete) {
            resolve();
          } else {
            image.onload = () => resolve();
            image.onerror = () => resolve(); // Continue even if image fails
          }
        });
      };

      // Wait for all images to load
      const images = Array.from(clone.getElementsByTagName('img'));
      await Promise.all(images.map(img => loadImage(img)));

      // Use html2canvas with improved settings for better text quality
      const canvas = await html2canvas(clone, {
        scale: 2.5, // Higher scale for better image quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        imageTimeout: 15000, // Longer timeout for image loading
        removeContainer: false,
        width: 210 * 3.78, // A4 width in pixels (210mm * 3.78 pixels/mm at 96 DPI)
        height: 297 * 3.78 // A4 height in pixels
      });
      
      // Remove the clone from the document
      document.body.removeChild(clone);

      // Hide the element again
      element.style.display = originalDisplay;

      // Create PDF with proper dimensions (A4)
      const imgData = canvas.toDataURL('image/png', 1.0); // Use maximum quality
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: false, // Disable compression for better quality
        hotfixes: ['px_scaling']
      });

      // Calculate dimensions to fit the image properly on the page
      const imgWidth = 210; // A4 width in mm
      const imgHeight = 297; // A4 height in mm

      // Add the invoice image
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      
      // Add footer text with page number
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Rajini by The Waters - Invoice ${invoice.invoiceNumber} - Generated on ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
      
      // Save the PDF
      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);

      // Show success toast
      toast({
        title: 'PDF Downloaded',
        description: 'Your invoice has been downloaded successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'There was an error generating the PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invoice Not Found</h1>
            <Button onClick={() => router.push('/dashboard/invoices')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <style type="text/css" media="print">{`
          /* Print styles omitted for brevity */
        `}</style>
      </Head>
      <DashboardLayout>
        <div className="container mx-auto py-10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push('/dashboard/invoices')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-3xl font-bold">Invoice #{invoice?.invoiceNumber || invoice?.id}</h1>
              <Badge className={
                invoice?.status === 'Paid' ? 'bg-green-500/10 text-green-500' :
                invoice?.status === 'Overdue' ? 'bg-red-500/10 text-red-500' :
                invoice?.status === 'Issued' ? 'bg-blue-500/10 text-blue-500' :
                invoice?.status === 'Draft' ? 'bg-gray-500/10 text-gray-500' :
                'bg-yellow-500/10 text-yellow-500'
              }>
                {invoice?.status}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCurrencyConversion}>
                Show in {invoice?.currency === 'USD' ? 'LKR' : 'USD'}
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* New Invoice Component */}
          <div id="print-invoice" className="print-container">
            {invoice && guest && room && (
              <InvoiceImplLive 
                invoice={invoice} 
                guest={guest} 
                room={room} 
              />
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
} 