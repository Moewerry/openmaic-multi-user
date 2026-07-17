'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError('');
    const data = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ schoolUserId: data.get('schoolUserId'), password: data.get('password') }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setError(result.error || '登录失败'); setPending(false); return; }
    const requested = searchParams.get('returnTo');
    router.replace(requested?.startsWith('/') && !requested.startsWith('//') ? requested : '/');
    router.refresh();
  }
  return <form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="schoolUserId">学号/工号</Label><Input id="schoolUserId" name="schoolUserId" autoComplete="username" required /></div><div className="space-y-2"><Label htmlFor="password">密码</Label><Input id="password" name="password" type="password" autoComplete="current-password" required /></div>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<Button className="w-full" disabled={pending}>{pending ? '登录中…' : '登录'}</Button><p className="text-center text-sm text-muted-foreground">没有账号？ <Link className="text-primary hover:underline" href="/register">立即注册</Link></p></form>;
}
