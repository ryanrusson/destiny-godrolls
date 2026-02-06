"use client";

import Link from "next/link";

interface HeaderProps {
  displayName?: string;
  isDemo?: boolean;
}

export default function Header({ displayName, isDemo }: HeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-sm flex items-center justify-center border border-gray-700">
              <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
                <circle cx="16" cy="16" r="13" stroke="#fbbf24" strokeWidth="2" />
                <circle cx="16" cy="16" r="9" stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />
                <line x1="16" y1="4" x2="16" y2="28" stroke="#fbbf24" strokeWidth="1" opacity="0.3" />
                <line x1="4" y1="16" x2="28" y2="16" stroke="#fbbf24" strokeWidth="1" opacity="0.3" />
                <polyline points="10,16 14,20 22,11" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                Vault Janitor
              </h1>
              <p className="text-xs text-gray-500 leading-tight">
                Destiny 2 God Roll Checker
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {isDemo && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-900/50 text-amber-400 border border-amber-800">
                DEMO MODE
              </span>
            )}
            {displayName && (
              <span className="text-sm text-gray-400">{displayName}</span>
            )}
            {displayName && !isDemo && (
              <a
                href="/api/auth/logout"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Sign Out
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
