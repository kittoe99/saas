import Link from "next/link";

export default function FooterLinks() {
  return (
    <ul className="mt-8 text-sm flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-3 text-white">
      <li>
        <Link href="/#overview" className="hover:text-success-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-accent/60 focus-visible:rounded-sm transition-colors">Overview</Link>
      </li>
      <li>
        <Link href="/#features" className="hover:text-success-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-accent/60 focus-visible:rounded-sm transition-colors">Features</Link>
      </li>
      <li>
        <Link href="/showcase" className="hover:text-success-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-accent/60 focus-visible:rounded-sm transition-colors">Showcase</Link>
      </li>
      <li>
        <Link href="/#tools" className="hover:text-success-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-accent/60 focus-visible:rounded-sm transition-colors">Tools</Link>
      </li>
      {/* News removed */}
      <li>
        <Link href="/contact" className="hover:text-success-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-accent/60 focus-visible:rounded-sm transition-colors">Contact</Link>
      </li>
      <li>
        <Link href="/privacy" className="hover:text-success-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-accent/60 focus-visible:rounded-sm transition-colors">Privacy</Link>
      </li>
      <li>
        <Link href="/terms" className="hover:text-success-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-accent/60 focus-visible:rounded-sm transition-colors">Terms</Link>
      </li>
    </ul>
  );
}
