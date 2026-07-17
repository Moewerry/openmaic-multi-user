'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RegisterForm() {
  const router = useRouter(); const [error, setError] = useState(''); const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(''); const data = new FormData(event.currentTarget);
    if (data.get('password') !== data.get('confirmPassword')) { setError('两次输入的密码不一致'); setPending(false); return; }
    const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: data.get('username'), name: data.get('name'), password: data.get('password') }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setError(result.error || '注册失败'); setPending(false); return; }
    router.replace('/'); router.refresh();
  }
  return <form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="username">用户名</Label><Input id="username" name="username" autoComplete="username" required /><p className="text-xs text-muted-foreground">3–128 位字母、数字、点、下划线或连字符</p></div><div className="space-y-2"><Label htmlFor="name">姓名</Label><Input id="name" name="name" autoComplete="name" required /></div><div className="space-y-2"><Label htmlFor="password">密码</Label><Input id="password" name="password" type="password" autoComplete="new-password" required /><p className="text-xs text-muted-foreground">8–128 位，至少包含一个字母和一个数字</p></div><div className="space-y-2"><Label htmlFor="confirmPassword">确认密码</Label><Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required /></div>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<Button className="w-full" disabled={pending}>{pending ? '注册中…' : '注册并登录'}</Button><p className="text-center text-sm text-muted-foreground">已有账号？ <Link className="text-primary hover:underline" href="/login">返回登录</Link></p></form>;
}
