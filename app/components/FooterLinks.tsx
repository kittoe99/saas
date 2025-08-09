"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FooterLinks() {
  const router = useRouter();
  return (
    <div className="mt-8 text-sm flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-3 text-neutral-700">
      <a href="#overview" className="hover:text-neutral-900">Overview</a>
      <a href="#features" className="hover:text-neutral-900">Features</a>
      <Link href="/showcase" className="hover:text-neutral-900">Showcase</Link>
      <a href="#tools" className="hover:text-neutral-900">Tools</a>
      <button
        type="button"
        onClick={() => router.push("/blog")}
        className="hover:text-neutral-900"
      >
        News
      </button>
      <Link href="/contact" className="hover:text-neutral-900">Contact</Link>
      <a href="#privacy" className="hover:text-neutral-900">Privacy</a>
      <a href="#terms" className="hover:text-neutral-900">Terms</a>
    </div>
  );
}
