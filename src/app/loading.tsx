import React from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function Loading() {
  return (
    <LoadingScreen
      message="SATUDATA HEALTHCARE"
      subtitle="Memuat Data Portal & Jaringan Blockchain..."
      fullScreen={true}
    />
  );
}
