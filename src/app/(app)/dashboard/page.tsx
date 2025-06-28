// src/app/(app)/dashboard/page.tsx
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - CalisthenicsAI',
  description: 'Your personal calisthenics progress dashboard.',
};

// Dynamically import the client component with SSR disabled
const DashboardClientPage = dynamic(
  () => import('@/components/dashboard/DashboardClientPage'),
  { 
    ssr: false,
    loading: () => (
      <div className="container mx-auto flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    )
  }
);

export default function DashboardPage() {
  return <DashboardClientPage />;
}