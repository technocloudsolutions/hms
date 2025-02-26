'use client';

import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

// Note: In a real application, you would use a charting library like Chart.js, Recharts, or D3.js
// For this example, we'll create placeholder components that simulate charts

interface LineChartProps {
  data: Array<{ date: string; value: number }>;
  xKey: string;
  yKey: string;
  label: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, xKey, yKey, label }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find min and max values
    const values = data.map(item => item.value);
    const maxValue = Math.max(...values) * 1.1; // Add 10% padding
    const minValue = 0;

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw y-axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = height - padding - (i / ySteps) * chartHeight;
      const value = minValue + (i / ySteps) * (maxValue - minValue);
      ctx.fillText(value.toFixed(0), padding - 5, y);
      
      // Draw horizontal grid lines
      ctx.beginPath();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.5;
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw x-axis labels (show only a subset to avoid overcrowding)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const xLabelsToShow = Math.min(7, data.length);
    const xStep = Math.max(1, Math.floor(data.length / xLabelsToShow));
    
    for (let i = 0; i < data.length; i += xStep) {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const date = new Date(data[i].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      ctx.fillText(date, x, height - padding + 5);
    }

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    
    data.forEach((point, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = height - padding - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Draw points
    data.forEach((point, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = height - padding - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
      
      ctx.beginPath();
      ctx.fillStyle = '#3b82f6';
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw label
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(label, padding, padding - 20);
  }, [data, xKey, yKey, label]);

  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
      width={800}
      height={400}
    />
  );
};

interface BarChartProps {
  data: Array<{ date: string; value: number }>;
  xKey: string;
  yKey: string;
  label: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, xKey, yKey, label }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find min and max values
    const values = data.map(item => item.value);
    const maxValue = Math.max(...values) * 1.1; // Add 10% padding
    const minValue = 0;

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw y-axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = height - padding - (i / ySteps) * chartHeight;
      const value = minValue + (i / ySteps) * (maxValue - minValue);
      ctx.fillText(value.toFixed(0), padding - 5, y);
      
      // Draw horizontal grid lines
      ctx.beginPath();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.5;
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw x-axis labels (show only a subset to avoid overcrowding)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;
    
    const xLabelsToShow = Math.min(7, data.length);
    const xStep = Math.max(1, Math.floor(data.length / xLabelsToShow));
    
    for (let i = 0; i < data.length; i += xStep) {
      const x = padding + i * (barWidth + barSpacing) + barWidth / 2;
      const date = new Date(data[i].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      ctx.fillText(date, x, height - padding + 5);
    }

    // Draw bars
    data.forEach((point, i) => {
      const x = padding + i * (barWidth + barSpacing);
      const barHeight = ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
      const y = height - padding - barHeight;
      
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x, y, barWidth, barHeight);
    });

    // Draw label
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(label, padding, padding - 20);
  }, [data, xKey, yKey, label]);

  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
      width={800}
      height={400}
    />
  );
};

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    // Calculate total value
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // Colors for the pie slices
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

    // Draw pie chart
    let startAngle = 0;
    
    data.forEach((item, i) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
      
      startAngle = endAngle;
    });

    // Draw legend
    const legendX = width - 150;
    const legendY = 40;
    const legendItemHeight = 25;
    
    data.forEach((item, i) => {
      const y = legendY + i * legendItemHeight;
      
      // Draw color box
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(legendX, y, 15, 15);
      
      // Draw text
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${item.name}: ${item.value}`, legendX + 25, y + 7);
    });
  }, [data]);

  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
      width={800}
      height={400}
    />
  );
}; 