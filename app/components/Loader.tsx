"use client";

import React from "react";

type LoaderProps = {
  message?: string;
  fullScreen?: boolean;
  variant?: "spinner" | "dots";
};

export default function Loader({ message = "Loading...", fullScreen = false, variant = "spinner" }: LoaderProps) {
  const container = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur"
    : "w-full flex items-center justify-center py-8";

  return (
    <div className={container} role="status" aria-live="polite" aria-busy="true">
      <div className="flex flex-col items-center gap-3 text-neutral-700">
        <div className="relative h-12 w-12">
          {variant === "spinner" ? <Spinner /> : <Dots />}
        </div>
        <div className="text-sm font-medium text-neutral-800">
          {message}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="relative h-12 w-12">
      {/* Base ring */}
      <div className="absolute inset-0 rounded-full border-2 border-neutral-200" />
      {/* Animated accent arc */}
      <div className="absolute inset-0 rounded-full border-2 border-success/30 border-t-success-accent animate-spin" />
      {/* Soft center */}
      <div className="absolute inset-2 rounded-full bg-success-accent/5" />
    </div>
  );
}

function Dots() {
  return (
    <div className="flex items-center gap-1 h-12">
      <span className="h-2 w-2 rounded-full bg-success-accent animate-bounce [animation-delay:-0.2s]" />
      <span className="h-2 w-2 rounded-full bg-success-accent/80 animate-bounce [animation-delay:-0.1s]" />
      <span className="h-2 w-2 rounded-full bg-success-accent/60 animate-bounce" />
    </div>
  );
}
