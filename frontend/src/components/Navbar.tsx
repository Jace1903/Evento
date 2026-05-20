'use client';

import { useUser, useClerk, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
              Evento
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-violet-600 transition-colors">Discover</Link>
            <Link href="/saved" className="hover:text-violet-600 transition-colors">Saved</Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => openUserProfile()}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-violet-600 transition-colors"
              >
                {user?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.imageUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-sm">
                    {user?.firstName?.[0] ?? user?.primaryEmailAddress?.emailAddress?.[0] ?? '?'}
                  </div>
                )}
                <span className="hidden sm:inline">{user?.firstName ?? 'Account'}</span>
              </button>
              <button
                onClick={() => signOut()}
                className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="hidden sm:block text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-full transition-colors">
                  Get started
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
