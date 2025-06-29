// src/components/layout/AppHeader.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, UserCircle, LogOut as LogOutIcon } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/Logo';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function AppHeader() {
  const { isMobile } = useSidebar();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    // Use email as a fallback for initials
    const nameOrEmail = name || user?.email || 'User';
    const names = nameOrEmail.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return nameOrEmail.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      // First, sign out from Firebase client-side
      await signOut(auth);
      
      // Clear session cookie via API route
      await fetch('/api/session', {
        method: 'DELETE',
      });

      // Navigate to login
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
      // Navigate to login even if logout fails
      router.push('/login');
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || "User";
  const userEmail = user?.email || "Not logged in";
  const userAvatarUrl = user?.photoURL;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      {isMobile && <SidebarTrigger className="md:hidden"><Menu /></SidebarTrigger>}
      {!isMobile && (
        <Link href="/dashboard" className="hidden md:block" aria-label="Dashboard">
          <Logo />
        </Link>
      )}
      <div className="flex-1 md:hidden"> {/* Mobile logo centered */}
        {isMobile && (
          <div className="flex justify-center">
            <Link href="/dashboard" aria-label="Dashboard">
              <Logo />
            </Link>
          </div>
        )}
      </div>
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9">
                {userAvatarUrl ? (
                  <AvatarImage src={userAvatarUrl} alt={displayName} data-ai-hint="person face" />
                ) : (
                  <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}