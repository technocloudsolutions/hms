'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to login page when component mounts
    router.push('/login');
  }, [router]);
  
  // This will briefly show while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Redirecting to login...</p>
    </div>
  );
}
