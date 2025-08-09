import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

const POSTS: Record<string, {
  title: string;
  date: string;
  category: string;
  hero?: string;
  content: ReactNode;
}> = {
  "welcome-to-hinn-blog": {
    title: "Welcome to the hinn.io Blog",
    date: "Aug 2025",
    category: "Updates",
    content: (
      <>
        <p>
          Welcome! At hinn.io, we build modern, fast, and always‑up‑to‑date websites. Think of us as your
          website team: design, build, hosting, and ongoing improvements—handled.
        </p>
        <h2 className="mt-6 text-lg font-semibold">What you can expect here</h2>
        <ul className="mt-3 list-disc pl-5 space-y-1">
          <li>Product updates and new feature announcements</li>
          <li>Guides on getting the most from your website</li>
          <li>Best practices for SEO, performance, and accessibility</li>
          <li>Showcase highlights and behind‑the‑scenes breakdowns</li>
        </ul>
        <p className="mt-4">
          Whether you’re launching a new site or scaling an existing one, we’re here to help you keep momentum.
        </p>
      </>
    ),
  },
  "website-as-a-service": {
    title: "What you get with our Website-as-a-Service",
    date: "Aug 2025",
    category: "Services",
    content: (
      <>
        <p>
          Our Website‑as‑a‑Service model removes maintenance headaches. We launch quickly, then iterate with
          content updates, A/B testing, performance tuning, and new features as you grow.
        </p>
        <h2 className="mt-6 text-lg font-semibold">Included in every plan</h2>
        <ul className="mt-3 list-disc pl-5 space-y-1">
          <li>Design + implementation tailored to your brand</li>
          <li>Managed hosting, CDN, SSL, backups, and monitoring</li>
          <li>Ongoing updates and support—no surprise rebuilds</li>
          <li>Analytics setup and actionable insights</li>
        </ul>
        <h3 className="mt-5 font-semibold">Optional add‑ons</h3>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Sales funnels, forms, email automations</li>
          <li>Payments with subscriptions and one‑time purchases</li>
          <li>AI assistants, content generation, and reporting</li>
        </ul>
      </>
    ),
  },
  "recent-builds-and-success-stories": {
    title: "Recent builds and success stories",
    date: "Aug 2025",
    category: "Showcase",
    content: (
      <>
        <p>
          We’ve helped businesses across industries—local services, e‑commerce, and startups—launch beautiful,
          performant sites that convert.
        </p>
        <h2 className="mt-6 text-lg font-semibold">Highlights</h2>
        <ul className="mt-3 list-disc pl-5 space-y-1">
          <li>Faster load times leading to higher conversion rates</li>
          <li>Streamlined content publishing and updates</li>
          <li>Improved SEO fundamentals and Core Web Vitals</li>
        </ul>
        <p className="mt-4">
          Explore more examples on our <Link href="/showcase" className="text-[#1a73e8] hover:underline">Showcase</Link> page.
        </p>
      </>
    ),
  },
  "ai-features-on-your-site": {
    title: "AI features: assistants, content, and insights",
    date: "Aug 2025",
    category: "AI",
    content: (
      <>
        <p>
          AI enhances your site experience: from on‑site assistants to content generation and analytics summaries.
        </p>
        <h2 className="mt-6 text-lg font-semibold">Practical ways we use AI</h2>
        <ul className="mt-3 list-disc pl-5 space-y-1">
          <li>Chat assistants that answer FAQs and route leads</li>
          <li>Content drafting for blogs, landing pages, and emails</li>
          <li>Automated insights from analytics and CRM data</li>
        </ul>
        <p className="mt-4">
          We focus on simple, reliable workflows—not hype—so your team saves time and your customers get answers faster.
        </p>
      </>
    ),
  },
  "pricing-that-scales": {
    title: "Simple pricing that scales with you",
    date: "Aug 2025",
    category: "Pricing",
    content: (
      <>
        <p>
          Our plans are transparent and all‑inclusive: design, hosting, maintenance, and updates. As your needs
          evolve, your plan can too—without surprise rebuild costs.
        </p>
        <h2 className="mt-6 text-lg font-semibold">Why customers choose our pricing</h2>
        <ul className="mt-3 list-disc pl-5 space-y-1">
          <li>Predictable monthly cost</li>
          <li>Continuous improvements vs. one‑off projects</li>
          <li>Access to new features as they’re released</li>
        </ul>
      </>
    ),
  },
  "product-roadmap": {
    title: "What’s coming next",
    date: "Aug 2025",
    category: "Roadmap",
    content: (
      <>
        <p>
          We’re building toward a tighter toolkit: better analytics, deeper CRM integrations, and more AI‑powered
          automation for marketing and support.
        </p>
        <h2 className="mt-6 text-lg font-semibold">On our roadmap</h2>
        <ul className="mt-3 list-disc pl-5 space-y-1">
          <li>Analytics dashboard with plain‑English summaries</li>
          <li>More CRM and form integrations</li>
          <li>AI workflows for content and lead qualification</li>
        </ul>
      </>
    ),
  },
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) return notFound();

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
          <div className="text-xs uppercase tracking-wide text-neutral-500">{post.category}</div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">{post.title}</h1>
          <div className="mt-2 text-xs text-neutral-500">{post.date}</div>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-3 sm:px-4 py-8 prose prose-neutral prose-sm sm:prose-base">
        {post.content}
        <div className="mt-8 flex gap-3">
          <Link href="/blog" className="px-3 py-2 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-sm">Back to blog</Link>
          <Link href="/contact" className="px-3 py-2 rounded-md bg-[#1a73e8] text-white text-sm">Start a project</Link>
        </div>
      </article>
    </main>
  );
}

export function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}
