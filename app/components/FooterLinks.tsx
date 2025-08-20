"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FooterLinks() {
  const router = useRouter();
  return (
    <div className="mt-8 text-sm flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-3 text-[#e7dfc6]">
      <a href="#overview" className="hover:opacity-80">Overview</a>
      <a href="#features" className="hover:opacity-80">Features</a>
      <Link href="/showcase" className="hover:opacity-80">Showcase</Link>
      <a href="#tools" className="hover:opacity-80">Tools</a>
      <button
        type="button"
        onClick={() => router.push("/blog")}
        className="hover:opacity-80"
      >
        News
      </button>
      <Link href="/contact" className="hover:opacity-80">Contact</Link>
      <a href="#privacy" className="hover:opacity-80">Privacy</a>
      <a href="#terms" className="hover:opacity-80">Terms</a>
    </div>
  );
}
