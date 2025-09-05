"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center px-4 pt-8"><div className="text-sm text-neutral-600">Finalizing verification...</div></div>}>
      <AuthCallbackInner />
    </Suspense>
  );
}

function AuthCallbackInner() {
  const params = useSearchParams();
  const [status, setStatus] = useState<
    | { kind: "loading" }
    | { kind: "success"; message: string }
    | { kind: "error"; message: string }
  >({ kind: "loading" });

  const next = params.get("next") || "/dashboard";

  const goNext = useMemo(() => {
    return () => {
      window.location.replace(next);
    };
  }, [next]);

  useEffect(() => {
    async function run() {
      try {
        const hasCode = !!params.get("code");
        if (hasCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (!data.session) {
            await new Promise((r) => setTimeout(r, 400));
            const again = await supabase.auth.getSession();
            if (!again.data.session) {
              throw new Error("No authenticated session found after email verification.");
            }
          }
        }

        // Best-effort: create a Vercel team for this user on the server
        try {
          const { data: u } = await supabase.auth.getUser();
          const user = u?.user;
          if (user?.id) {
            await fetch("/api/vercel/teams", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: user.id }),
              cache: "no-store",
            }).catch(() => {});
          }
        } catch {}

        setStatus({ kind: "success", message: "Email verified. Redirecting..." });
        setTimeout(goNext, 600);
      } catch (e: any) {
        setStatus({ kind: "error", message: e?.message || "Verification failed" });
      }
    }
    run();
  }, [params, goNext]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 pt-8">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 sm:p-7 space-y-3 shadow-soft shadow-hover text-center">
        {status.kind === "loading" && (
          <div className="text-sm text-neutral-600">Finalizing verification, please wait...</div>
        )}
        {status.kind === "success" && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">{status.message}</div>
        )}
        {status.kind === "error" && (
          <div className="space-y-3">
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{status.message}</div>
            <button
              onClick={goNext}
              className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
