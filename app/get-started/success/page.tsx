"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GetStartedSuccessPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-white to-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <span
              className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-success-bg text-success-ink shadow-inner"
              aria-hidden
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`h-10 w-10 transition-all duration-700 ${mounted ? "scale-110" : "scale-90"}`}
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.28-2.53a.75.75 0 0 0-1.06-1.06l-5.47 5.47-2.22-2.22a.75.75 0 1 0-1.06 1.06l2.75 2.75a.75.75 0 0 0 1.06 0l6-6Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span className="pointer-events-none absolute -inset-2 -z-10 animate-ping rounded-full bg-success-bg/50" aria-hidden />
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">You’re all set</h1>
          <p className="mt-3 max-w-xl text-neutral-600">
            Thanks for getting started. Your selections were saved. You can head to the dashboard or revisit steps anytime.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/onboarding?from=get-started"
              className="inline-flex items-center gap-2 rounded-md bg-success-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M2.25 12a9.75 9.75 0 1 1 19.5 0 9.75 9.75 0 0 1-19.5 0Zm6.72-1.28a.75.75 0 0 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l6-6a.75.75 0 1 0-1.06-1.06L11 12.94 8.97 10.72Z" clipRule="evenodd" />
              </svg>
              Continue onboarding
            </Link>

            <a
              href="https://apps.apple.com/app/id1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M16.365 1.43c.03 1.03-.38 2.02-1.07 2.76-.73.77-1.92 1.37-3.06 1.29-.13-1 .42-2.03 1.1-2.71.77-.79 2.09-1.37 3.03-1.34zM20.32 17.07c-.56 1.3-.82 1.86-1.53 3-.99 1.59-2.39 3.58-4.14 3.6-1.74.02-2.2-1.16-4.12-1.16-1.92 0-2.43 1.14-4.16 1.18-1.73.03-3.05-1.72-4.04-3.3C.8 17.12.15 13.62 1.7 11.3c1.13-1.68 2.92-1.68 3.67-1.7 1.76-.03 3.1 1.17 4.11 1.17 1 0 2.78-1.45 4.69-1.24.8.03 3.06.32 4.51 2.37-.12.08-2.69 1.57-2.46 4.17.24 2.74 2.64 3.65 2.68 3.66z" />
              </svg>
              Download on the App Store
            </a>

            <a
              href="https://play.google.com/store/apps/details?id=com.example.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M3.6 1.8a1.5 1.5 0 0 0-1.35 2.2l7.2 9-7.2 9A1.5 1.5 0 0 0 3.6 24l12.6-7.2 3.9 4.88a1.5 1.5 0 0 0 2.55-1.09V3.4A1.5 1.5 0 0 0 20.1 2.3L16.2 7.18 3.6 0Z" />
              </svg>
              Get it on Google Play
            </a>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M11.25 3.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0V5.56l-6.22 6.22a.75.75 0 1 1-1.06-1.06L17.44 4.5h-5.44a.75.75 0 0 1-.75-.75Z" />
                <path d="M3 6.75A2.25 2.25 0 0 1 5.25 4.5h6a.75.75 0 0 1 0 1.5h-6A.75.75 0 0 0 4.5 6.75v12A.75.75 0 0 0 5.25 19.5h12a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 1 1.5 0v6A2.25 2.25 0 0 1 17.25 21H5.25A2.25 2.25 0 0 1 3 18.75v-12Z" />
              </svg>
              I'll do this later
            </Link>
          </div>

          <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 bg-white p-4 text-left shadow-sm">
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M4.125 3C3.504 3 3 3.504 3 4.125v15.75C3 20.496 3.504 21 4.125 21h15.75c.621 0 1.125-.504 1.125-1.125V4.125C21 3.504 20.496 3 19.875 3H4.125Zm2.25 3.375A.375.375 0 0 0 6 6.75v10.5c0 .207.168.375.375.375h11.25a.375.375 0 0 0 .375-.375V6.75a.375.375 0 0 0-.375-.375H6.375Z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm font-medium text-neutral-900">We’re on it</div>
              <div className="mt-1 text-sm text-neutral-600">We’ll get your workspace ready based on your selections.</div>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-4 text-left shadow-sm">
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75S6.615 21.75 12 21.75 21.75 17.385 21.75 12 17.385 2.25 12 2.25Zm1.5 6a.75.75 0 0 0-1.5 0v3H9a.75.75 0 0 0 0 1.5h3v3a.75.75 0 0 0 1.5 0v-3h3a.75.75 0 0 0 0-1.5h-3V8.25Z" />
                </svg>
              </div>
              <div className="text-sm font-medium text-neutral-900">Next steps</div>
              <div className="mt-1 text-sm text-neutral-600">Visit your dashboard to track progress and provide assets if needed.</div>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-4 text-left shadow-sm">
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M7.5 6.75A2.25 2.25 0 0 1 9.75 4.5h4.5A2.25 2.25 0 0 1 16.5 6.75v10.5A2.25 2.25 0 0 1 14.25 19.5h-4.5A2.25 2.25 0 0 1 7.5 17.25V6.75Zm2.25 1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm font-medium text-neutral-900">Need a change?</div>
              <div className="mt-1 text-sm text-neutral-600">You can revisit these steps to adjust details at any time.</div>
            </div>
          </div>

          <div className="mt-10 text-xs text-neutral-500">Ref: Get Started Success</div>
        </div>
      </div>
    </main>
  );
}
