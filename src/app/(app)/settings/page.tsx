// src/app/(app)/settings/page.tsx
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Settings - CalisthenicsAI',
  description: 'Manage your CalisthenicsAI account settings and preferences.',
};

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Settings</CardTitle>
          <CardDescription>Configure your application preferences and manage your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <SettingsIcon className="h-16 w-16 text-primary mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Settings Page Under Construction</h2>
          <p className="text-muted-foreground">
            This is where you'll manage your profile, notification preferences, linked accounts, and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
