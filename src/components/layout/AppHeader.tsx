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
import { logout } from '@/actions/auth.actions';
import { Logo } from '@/components/icons/Logo';

export function AppHeader() {
  const { isMobile } = useSidebar(); // Only call useSidebar if SidebarProvider is an ancestor

  // A simple function to get initials from a name, or a default if no name
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  };

  // Placeholder user data - replace with actual user data from context/session
  const user = {
    name: "Medical Student", // Placeholder
    email: "user@example.com", // Placeholder
    avatarUrl: undefined, // Placeholder for avatar image URL
  };


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
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.name || "User"} data-ai-hint="person face" />
                ) : (
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logout}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full text-left">
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
