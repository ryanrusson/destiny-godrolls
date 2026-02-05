import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  const hasBungieConfig =
    process.env.BUNGIE_API_KEY && process.env.BUNGIE_CLIENT_ID;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo / Icon */}
          <div className="w-20 h-20 mx-auto mb-8 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-10 h-10 text-gray-900"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Vault Janitor
          </h1>
          <p className="text-lg text-gray-400 mb-2">
            Destiny 2 God Roll Checker
          </p>
          <p className="text-sm text-gray-500 mb-10 max-w-lg mx-auto">
            Scans your vault and inventory for duplicate weapons, cross-references
            community god roll lists (sourced from light.gg community picks),
            and tells you which copies are safe to dismantle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {hasBungieConfig ? (
              <a
                href="/api/auth/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Sign in with Bungie
              </a>
            ) : (
              <div className="px-6 py-3 bg-gray-800 text-gray-500 font-semibold rounded-lg border border-gray-700 cursor-not-allowed">
                Sign in with Bungie (not configured)
              </div>
            )}

            <Link
              href="/vault?demo=true"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-gray-200 font-semibold rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Try Demo
            </Link>
          </div>

          {/* Setup Instructions */}
          {!hasBungieConfig && (
            <div className="mt-12 text-left bg-gray-900/50 rounded-xl border border-gray-800 p-6 max-w-lg mx-auto">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                Setup Required
              </h2>
              <ol className="space-y-3 text-sm text-gray-400">
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>
                    Register an app at{" "}
                    <a
                      href="https://www.bungie.net/en/Application"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      bungie.net/en/Application
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>
                    Set the OAuth redirect URL to{" "}
                    <code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">
                      http://localhost:3000/api/auth/callback
                    </code>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>
                    Copy <code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">.env.example</code>{" "}
                    to{" "}
                    <code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">.env.local</code>{" "}
                    and fill in your API key, client ID, and secret
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <span>Restart the dev server and sign in</span>
                </li>
              </ol>
            </div>
          )}

          {/* How it works */}
          <div className="mt-12 grid sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            <div className="bg-gray-900/30 rounded-lg p-5 border border-gray-800/50">
              <div className="w-8 h-8 rounded bg-blue-900/50 flex items-center justify-center mb-3">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Scan Your Vault
              </h3>
              <p className="text-xs text-gray-500">
                Reads your entire vault, inventory, and equipped items via the
                Bungie API.
              </p>
            </div>

            <div className="bg-gray-900/30 rounded-lg p-5 border border-gray-800/50">
              <div className="w-8 h-8 rounded bg-yellow-900/50 flex items-center justify-center mb-3">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-yellow-400" fill="currentColor">
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Check God Rolls
              </h3>
              <p className="text-xs text-gray-500">
                Cross-references your weapons against community god roll lists
                sourced from light.gg ratings.
              </p>
            </div>

            <div className="bg-gray-900/30 rounded-lg p-5 border border-gray-800/50">
              <div className="w-8 h-8 rounded bg-red-900/50 flex items-center justify-center mb-3">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Find the Junk
              </h3>
              <p className="text-xs text-gray-500">
                Identifies duplicate weapons that aren&apos;t god rolls, so you know
                what&apos;s safe to dismantle.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center">
        <p className="text-xs text-gray-600">
          Not affiliated with Bungie. Destiny 2 is a registered trademark of
          Bungie, Inc. God roll data sourced from community wishlists.
        </p>
      </footer>
    </div>
  );
}
