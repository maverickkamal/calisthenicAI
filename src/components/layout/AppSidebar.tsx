// src/components/layout/AppSidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/Logo';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  LineChart,
  BookOpen,
  Lightbulb,
  Settings,
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/log-workout', label: 'Log Workout', icon: Dumbbell },
  { href: '/training-plan', label: 'My Plan', icon: ClipboardList },
  { href: '/progress', label: 'Progress', icon: LineChart },
  { href: '/journal', label: 'AI Journal', icon: BookOpen },
  { href: '/recommendations', label: 'AI Coach', icon: Lightbulb },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

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

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="border-b">
        <Link href="/dashboard" className="flex items-center gap-2 py-2" aria-label="Dashboard">
           <div className="group-data-[collapsible=icon]:hidden">
             <Logo />
           </div>
           <Dumbbell className="h-6 w-6 text-primary hidden group-data-[collapsible=icon]:block" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                 <SidebarMenuButton asChild tooltip="Settings">
                     <Link href="/settings">
                         <Settings className="h-5 w-5" />
                         <span>Settings</span>
                     </Link>
                 </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                 <SidebarMenuButton 
                   onClick={handleLogout} 
                   className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" 
                   tooltip="Log Out"
                 >
                     <LogOut className="h-5 w-5" />
                     <span>Log Out</span>
                 </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}