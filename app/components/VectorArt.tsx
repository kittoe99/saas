import React from "react";

export type VectorVariant =
  | "layout"
  | "team"
  | "components"
  | "sales"
  | "ai"
  | "payments"
  | "avatar"
  | "card"
  | "dashboard"
  | "builder";

interface Props extends React.SVGProps<SVGSVGElement> {
  variant?: VectorVariant;
  className?: string;
}

export default function VectorArt({ variant = "layout", className, ...rest }: Props) {
  switch (variant) {
    case "dashboard":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <defs>
            <linearGradient id="gd" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EEF3FF" />
              <stop offset="100%" stopColor="#E6EEFF" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" rx="12" fill="url(#gd)" />
          {/* Top bar */}
          <rect x="16" y="16" width="368" height="28" rx="8" fill="#D9E4FF" />
          {/* Sidebar */}
          <rect x="16" y="52" width="72" height="172" rx="10" fill="#EBF1FF" />
          <rect x="26" y="64" width="52" height="10" rx="5" fill="#C9D8FF" />
          <rect x="26" y="82" width="40" height="8" rx="4" fill="#DDE7FF" />
          <rect x="26" y="98" width="44" height="8" rx="4" fill="#DDE7FF" />
          <rect x="26" y="114" width="36" height="8" rx="4" fill="#DDE7FF" />
          {/* Main panels */}
          <rect x="100" y="60" width="284" height="60" rx="10" fill="#F7F9FF" />
          <rect x="100" y="128" width="172" height="96" rx="10" fill="#F7F9FF" />
          <rect x="280" y="128" width="104" height="96" rx="10" fill="#F7F9FF" />
          {/* Chart line */}
          <polyline points="112,176 148,160 176,170 208,144 254,156" fill="none" stroke="#1a73e8" strokeWidth="3" />
          {/* Bars */}
          <g fill="#CFE0FF">
            <rect x="292" y="160" width="12" height="40" rx="3" />
            <rect x="310" y="148" width="12" height="52" rx="3" />
            <rect x="328" y="168" width="12" height="32" rx="3" />
            <rect x="346" y="156" width="12" height="44" rx="3" />
          </g>
        </svg>
      );
    case "builder":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <rect width="400" height="240" rx="12" fill="#F6F8FF" />
          {/* Canvas */}
          <rect x="20" y="20" width="360" height="200" rx="12" fill="#EBF1FF" />
          {/* Grid */}
          <g opacity="0.5" stroke="#E1E9FF" strokeWidth="1">
            <path d="M40 40 H360" />
            <path d="M40 70 H360" />
            <path d="M40 100 H360" />
            <path d="M40 130 H360" />
            <path d="M40 160 H360" />
            <path d="M40 190 H360" />
          </g>
          {/* Blocks */}
          <rect x="44" y="52" width="112" height="56" rx="8" fill="#DDE7FF" />
          <rect x="168" y="52" width="184" height="24" rx="6" fill="#C9D8FF" />
          <rect x="168" y="84" width="184" height="24" rx="6" fill="#E7ECFF" />
          <rect x="44" y="120" width="308" height="28" rx="8" fill="#EAF0FF" />
          <rect x="44" y="156" width="148" height="44" rx="10" fill="#D9E4FF" />
          <rect x="200" y="156" width="152" height="44" rx="10" fill="#F0F4FF" />
          {/* Drag handles */}
          <g fill="#AFC6FF">
            <rect x="50" y="62" width="4" height="36" rx="2" />
            <rect x="56" y="62" width="4" height="36" rx="2" />
          </g>
        </svg>
      );
    case "team":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E3ECFF" />
              <stop offset="100%" stopColor="#F4F7FF" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" fill="url(#g1)" />
          <g fill="#C9D8FF">
            <circle cx="80" cy="90" r="28" />
            <rect x="48" y="125" width="64" height="40" rx="10" />
            <circle cx="200" cy="75" r="22" />
            <rect x="170" y="105" width="60" height="32" rx="8" />
            <circle cx="318" cy="110" r="26" />
            <rect x="286" y="142" width="64" height="38" rx="9" />
          </g>
        </svg>
      );
    case "components":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <rect width="400" height="240" rx="12" fill="#F6F7FB" />
          <rect x="24" y="24" width="140" height="24" rx="6" fill="#D9E2FF" />
          <rect x="24" y="60" width="352" height="12" rx="6" fill="#E7ECFF" />
          <rect x="24" y="84" width="352" height="12" rx="6" fill="#E7ECFF" />
          <rect x="24" y="120" width="108" height="72" rx="10" fill="#EAF0FF" />
          <rect x="148" y="120" width="108" height="72" rx="10" fill="#EAF0FF" />
          <rect x="272" y="120" width="104" height="72" rx="10" fill="#EAF0FF" />
        </svg>
      );
    case "sales":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <rect width="400" height="240" rx="12" fill="#F6F7FB" />
          <polyline points="24,190 100,150 170,170 250,120 376,90" fill="none" stroke="#1a73e8" strokeWidth="4" />
          <g fill="#CFE0FF">
            <rect x="40" y="40" width="80" height="40" rx="8" />
            <rect x="160" y="40" width="80" height="40" rx="8" />
            <rect x="280" y="40" width="80" height="40" rx="8" />
          </g>
        </svg>
      );
    case "ai":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <rect width="400" height="240" rx="12" fill="#F6F7FB" />
          <g>
            <rect x="80" y="60" width="240" height="120" rx="12" fill="#E7ECFF" />
            <circle cx="200" cy="120" r="36" fill="#1a73e8" />
            <g stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M200 96v48" />
              <path d="M176 120h48" />
            </g>
          </g>
        </svg>
      );
    case "payments":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <rect width="400" height="240" rx="12" fill="#F6F7FB" />
          <rect x="44" y="70" width="312" height="100" rx="12" fill="#DDE7FF" />
          <rect x="44" y="70" width="312" height="36" rx="12" fill="#C9D8FF" />
          <rect x="64" y="116" width="96" height="18" rx="6" fill="#AEC3FF" />
          <rect x="64" y="142" width="64" height="12" rx="6" fill="#E7ECFF" />
        </svg>
      );
    case "avatar":
      return (
        <svg viewBox="0 0 100 100" className={className} {...rest}>
          <defs>
            <linearGradient id="ga" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E3ECFF" />
              <stop offset="100%" stopColor="#C9D8FF" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="50" fill="url(#ga)" />
          <circle cx="50" cy="42" r="16" fill="#ffffff" opacity="0.9" />
          <rect x="28" y="62" width="44" height="18" rx="9" fill="#ffffff" opacity="0.9" />
        </svg>
      );
    case "card":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <defs>
            <linearGradient id="gc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F0F3FF" />
              <stop offset="100%" stopColor="#E7ECFF" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" fill="url(#gc)" />
          <rect x="24" y="24" width="96" height="12" rx="6" fill="#C9D8FF" />
          <rect x="24" y="44" width="64" height="10" rx="5" fill="#DDE7FF" />
          <rect x="24" y="70" width="352" height="146" rx="10" fill="#EAF0FF" />
        </svg>
      );
    case "layout":
    default:
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <rect width="400" height="240" rx="12" fill="#F6F7FB" />
          <rect x="24" y="24" width="240" height="24" rx="6" fill="#D9E2FF" />
          <rect x="24" y="60" width="352" height="12" rx="6" fill="#E7ECFF" />
          <rect x="24" y="84" width="352" height="12" rx="6" fill="#E7ECFF" />
          <rect x="24" y="116" width="352" height="88" rx="10" fill="#EAF0FF" />
        </svg>
      );
  }
}
