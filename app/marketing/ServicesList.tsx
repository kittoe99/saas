"use client";
import React, { useState } from "react";

type Service = {
  title: string;
  desc: string;
  icon: React.ReactNode;
};

export default function ServicesList({ services }: { services: Service[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? services : services.slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto">
      <div id="services-list" className="grid md:grid-cols-2 gap-5 md:gap-6">
        {visible.map((item) => (
          <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-soft bg-white p-4 shadow-soft">
            <div className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-accent-subtle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-accent-primary" aria-hidden>
                {item.icon}
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold tracking-tight text-primary">{item.title}</h3>
              <p className="mt-1 text-sm text-secondary">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
          aria-expanded={showAll}
          aria-controls="services-list"
        >
          {showAll ? "Show fewer" : "Show all services"}
        </button>
      </div>
    </div>
  );
}
