'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { Btn, Input, Label } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { getRandomPraise } from '@/lib/praise';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      sessionStorage.setItem('praise', getRandomPraise());
      router.push('/home');
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      sessionStorage.setItem('praise', getRandomPraise());
      router.push('/home');
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <AppShell>
      <section className="px-5 py-8">
        <div className="mb-7 text-center">
          <div className="text-5xl">📅</div>
          <h1 className="mt-2 text-xl font-bold">My Schedule</h1>
          <p className="mt-1 text-[13px] text-[#888]">予定と締切を、いつでもすぐ確認</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Label htmlFor="password">パスワード</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <Btn type="submit" disabled={loading}>
            {loading ? '処理中…' : isSignUp ? '新規登録' : 'ログイン'}
          </Btn>
        </form>

        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-4 w-full text-center text-sm text-[#4f6ef7]"
        >
          {isSignUp ? 'すでにアカウントがある → ログイン' : '初めての方 → 新規登録'}
        </button>
      </section>
    </AppShell>
  );
}
