'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type User = { username: string | null; name: string | null; role: string };

export function AuthUserMenu() {
  const pathname = usePathname(); const router = useRouter(); const [user, setUser] = useState<User | null>(null);
  useEffect(() => { if (pathname === '/login' || pathname === '/register') return; fetch('/api/auth/session').then((r) => r.json()).then((data) => setUser(data.authenticated ? data.user : null)).catch(() => setUser(null)); }, [pathname]);
  if (!user || pathname === '/login' || pathname === '/register') return null;
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.replace('/login'); router.refresh(); }
  return <div className="fixed right-40 top-4 z-50"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="max-w-40 truncate">{user.name || user.username}</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>{user.username}<span className="ml-2 text-xs font-normal text-muted-foreground">{user.role}</span></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onClick={logout}>退出登录</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>;
}
