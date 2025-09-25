import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center px-4 pt-8">
        <div className="text-sm text-neutral-600">Loading sign in…</div>
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}
