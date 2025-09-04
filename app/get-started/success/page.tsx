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
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-success-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M3.75 4.5A2.25 2.25 0 0 1 6 2.25h12A2.25 2.25 0 0 1 20.25 4.5v3.75A2.25 2.25 0 0 1 18 10.5H6a2.25 2.25 0 0 1-2.25-2.25V4.5Z" />
                <path fillRule="evenodd" d="M3.75 15A2.25 2.25 0 0 1 6 12.75h12A2.25 2.25 0 0 1 20.25 15v3.75A2.25 2.25 0 0 1 18 21H6a2.25 2.25 0 0 1-2.25-2.25V15Zm3-1.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Zm3 0a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
              </svg>
              Go to dashboard
            </Link>

            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h7.125M10.5 6A1.875 1.875 0 0 1 8.625 4.125m1.875 1.875A1.875 1.875 0 0 0 8.625 8.25M10.5 6H5.25m5.25 12h7.125m-7.125 0A1.875 1.875 0 0 1 8.625 16.125m1.875 1.875A1.875 1.875 0 0 0 8.625 20.25m1.875-2.25H5.25M3.75 12h16.5" />
              </svg>
              Review steps
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
