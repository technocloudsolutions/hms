'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, X } from 'lucide-react';
import Image from 'next/image';

export interface UploadProps {
  onChange: (files: File[]) => void;
  value?: string[];
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
}

export function Upload({
  onChange,
  value = [],
  multiple = false,
  accept,
  maxSize,
}: UploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types if accept is specified
    if (accept) {
      const invalidFiles = files.filter(file => !file.type.match(accept.replace('*', '.*')));
      if (invalidFiles.length > 0) {
        console.error('Invalid file type');
        return;
      }
    }

    // Validate file sizes if maxSize is specified
    if (maxSize) {
      const oversizedFiles = files.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        console.error('File too large');
        return;
      }
    }

    onChange(files);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors">
        <Input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          multiple={multiple}
          accept={accept}
        />
        <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => inputRef.current?.click()}>
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm text-muted-foreground text-center">
            <p>Click to upload or drag and drop</p>
            <p className="text-xs">Maximum file size: 5MB</p>
          </div>
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <Image
                src={url}
                alt="Uploaded image"
                fill
                className="object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="h-4 w-4 text-white" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 