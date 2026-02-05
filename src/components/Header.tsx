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
            <div className="w-8 h-8 bg-yellow-500 rounded-sm flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-gray-900"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
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
