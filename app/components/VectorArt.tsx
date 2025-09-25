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
  | "builder"
  | "wellness"
  | "outdoors"
  | "hospitality"
  | "services"
  | "creative"
  | "nonprofit";

interface Props extends React.SVGProps<SVGSVGElement> {
  variant?: VectorVariant;
  className?: string;
}

export default function VectorArt({ variant = "layout", className, ...rest }: Props) {
  switch (variant) {
    case "wellness":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <defs>
            <linearGradient id="gw" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E8FFF6" />
              <stop offset="100%" stopColor="#F4FFFA" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" rx="12" fill="url(#gw)" />
          {/* human figure in yoga pose */}
          <g fill="#7AD1B8">
            <circle cx="200" cy="88" r="16" />
            <rect x="188" y="104" width="24" height="56" rx="12" />
          </g>
          <g fill="#BEEEDD">
            <rect x="156" y="156" width="88" height="12" rx="6" />
            <rect x="128" y="172" width="144" height="10" rx="5" />
          </g>
          <g fill="#94E0C9">
            <rect x="176" y="132" width="16" height="32" rx="8" />
            <rect x="208" y="132" width="16" height="32" rx="8" />
          </g>
        </svg>
      );
    case "outdoors":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <rect width="400" height="240" rx="12" fill="#F3F9FF" />
          {/* mountains */}
          <g fill="#D3E6FF">
            <path d="M40 180 L100 100 L160 180 Z" />
            <path d="M140 180 L200 90 L260 180 Z" />
            <path d="M240 180 L300 110 L360 180 Z" />
          </g>
          {/* hiker silhouette */}
          <g fill="#8DB7FF">
            <circle cx="210" cy="116" r="10" />
            <rect x="204" y="128" width="12" height="28" rx="6" />
            <rect x="198" y="156" width="24" height="8" rx="4" />
          </g>
          <rect x="24" y="188" width="352" height="12" rx="6" fill="#E6F1FF" />
        </svg>
      );
    case "hospitality":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <rect width="400" height="240" rx="12" fill="#FFF7F0" />
          {/* counter and barista */}
          <rect x="40" y="160" width="320" height="20" rx="6" fill="#FFE3CC" />
          <g>
            <circle cx="280" cy="120" r="12" fill="#FFC8A4" />
            <rect x="270" y="132" width="20" height="24" rx="6" fill="#FFD9BF" />
          </g>
          <g fill="#FFD2B3">
            <rect x="64" y="96" width="56" height="36" rx="8" />
            <rect x="132" y="96" width="56" height="36" rx="8" />
            <rect x="200" y="96" width="56" height="36" rx="8" />
          </g>
          <rect x="48" y="182" width="304" height="10" rx="5" fill="#FFEDE0" />
        </svg>
      );
    case "services":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <rect width="400" height="240" rx="12" fill="#F6F8FF" />
          {/* consultant avatar */}
          <circle cx="92" cy="92" r="18" fill="#C9D8FF" />
          <rect x="74" y="112" width="36" height="22" rx="8" fill="#E3EBFF" />
          {/* chat bubbles */}
          <rect x="128" y="80" width="172" height="20" rx="10" fill="#EAF0FF" />
          <rect x="128" y="108" width="148" height="16" rx="8" fill="#EAF0FF" />
          {/* checklist */}
          <g fill="#DDE7FF">
            <rect x="128" y="140" width="196" height="10" rx="5" />
            <rect x="128" y="158" width="180" height="10" rx="5" />
            <rect x="128" y="176" width="160" height="10" rx="5" />
          </g>
        </svg>
      );
    case "creative":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <defs>
            <linearGradient id="gcx" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFE8F6" />
              <stop offset="100%" stopColor="#E9F0FF" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" rx="12" fill="url(#gcx)" />
          {/* palette */}
          <ellipse cx="130" cy="120" rx="42" ry="32" fill="#FFFFFF" opacity="0.9" />
          <circle cx="116" cy="116" r="5" fill="#FF7AA2" />
          <circle cx="130" cy="106" r="5" fill="#7AD1B8" />
          <circle cx="146" cy="120" r="5" fill="#7AA8FF" />
          {/* pen tool */}
          <rect x="200" y="88" width="120" height="80" rx="10" fill="#F6F9FF" />
          <path d="M220 120 L260 160" stroke="#1a73e8" strokeWidth="3" />
          <circle cx="260" cy="160" r="6" fill="#1a73e8" />
        </svg>
      );
    case "nonprofit":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <rect width="400" height="240" rx="12" fill="#F2FFF8" />
          {/* hands/heart */}
          <path d="M140 132 C150 116, 170 116, 180 132 C190 116, 210 116, 220 132 C220 150, 200 164, 180 176 C160 164, 140 150, 140 132 Z" fill="#FF7AA2" opacity="0.85" />
          <g fill="#BEEEDD">
            <rect x="88" y="180" width="224" height="12" rx="6" />
            <rect x="72" y="196" width="256" height="8" rx="4" />
          </g>
        </svg>
      );
    case "dashboard":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <defs>
            <linearGradient id="gd" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EEF3FF" />
              <stop offset="100%" stopColor="#E6EEFF" />
            </linearGradient>
            <clipPath id="thumbR">
              <rect x="0" y="0" width="80" height="80" rx="12" />
            </clipPath>
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
          {/* Embedded thumbnails (moved last to appear on top) */}
          <g transform="translate(284,132)">
            <rect x="0" y="0" width="100" height="92" rx="12" fill="#FFFFFF" stroke="#E3EAFF" />
            <g transform="translate(10,6)">
              <g clipPath="url(#thumbR)">
                <image href="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=160&auto=format&fit=crop" width="80" height="80" />
              </g>
              <rect x="0" y="0" width="80" height="80" rx="12" fill="none" stroke="#E5ECFF" />
            </g>
          </g>
        </svg>
      );
    case "builder":
      return (
        <svg viewBox="0 0 400 240" className={className} {...rest}>
          <defs>
            <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F7FAFF" />
              <stop offset="100%" stopColor="#EEF3FF" />
            </linearGradient>
            <linearGradient id="panelGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F2F6FF" />
            </linearGradient>
            <filter id="ds1" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#9FB6FF" floodOpacity="0.25" />
            </filter>
            <filter id="ds2" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#A6B8FF" floodOpacity="0.35" />
            </filter>
            <clipPath id="pillR">
              <rect x="0" y="0" width="64" height="64" rx="12" />
            </clipPath>
          </defs>

          {/* Background */}
          <rect width="400" height="240" rx="12" fill="url(#bgGrad)" />

          {/* Window chrome */}
          <g>
            <rect x="16" y="16" width="368" height="16" rx="6" fill="#E6EEFF" />
            <circle cx="28" cy="24" r="3" fill="#FF6B6B" />
            <circle cx="40" cy="24" r="3" fill="#FFCF6B" />
            <circle cx="52" cy="24" r="3" fill="#52D273" />
          </g>

          {/* Sidebar */}
          <g filter="url(#ds1)">
            <rect x="16" y="36" width="80" height="188" rx="10" fill="url(#panelGrad)" />
            <rect x="24" y="46" width="64" height="10" rx="5" fill="#C9D8FF" />
            <rect x="24" y="64" width="48" height="8" rx="4" fill="#DDE7FF" />
            <rect x="24" y="78" width="56" height="8" rx="4" fill="#DDE7FF" />
            <rect x="24" y="92" width="36" height="8" rx="4" fill="#DDE7FF" />
            <rect x="24" y="120" width="64" height="14" rx="7" fill="#EAF0FF" />
            <rect x="24" y="142" width="64" height="14" rx="7" fill="#EAF0FF" />
            <rect x="24" y="164" width="64" height="14" rx="7" fill="#EAF0FF" />
          </g>

          {/* Canvas area */}
          <g filter="url(#ds2)">
            <rect x="104" y="36" width="280" height="188" rx="12" fill="url(#panelGrad)" />
            {/* Top toolbar */}
            <rect x="116" y="48" width="100" height="10" rx="5" fill="#C9D8FF" />
            <rect x="222" y="48" width="56" height="10" rx="5" fill="#E0E8FF" />
            <rect x="282" y="48" width="24" height="10" rx="5" fill="#E0E8FF" />

            {/* Hero banner block */}
            <rect x="116" y="68" width="252" height="46" rx="10" fill="#EEF4FF" />
            <rect x="126" y="78" width="120" height="10" rx="5" fill="#B9CBFF" />
            <rect x="126" y="94" width="80" height="8" rx="4" fill="#D6E2FF" />

            {/* Small embedded images inside the canvas */}
            <g transform="translate(336,64)">
              <g clipPath="url(#pillR)">
                <image href="https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=160&auto=format&fit=crop" width="64" height="64" />
              </g>
              <rect x="0" y="0" width="64" height="64" rx="12" fill="none" stroke="#E5ECFF" />
            </g>

            {/* Two column block */}
            <rect x="116" y="122" width="120" height="70" rx="10" fill="#F6F9FF" />
            <rect x="248" y="122" width="120" height="70" rx="10" fill="#F6F9FF" />
            {/* Left column content */}
            <rect x="126" y="132" width="96" height="12" rx="6" fill="#C9D8FF" />
            <rect x="126" y="150" width="84" height="8" rx="4" fill="#E0E8FF" />
            <rect x="126" y="164" width="72" height="8" rx="4" fill="#E0E8FF" />
            {/* Left column small image */}
            <g transform="translate(174,140)">
              <g clipPath="url(#pillR)">
                <image href="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=160&auto=format&fit=crop" width="64" height="64" />
              </g>
              <rect x="0" y="0" width="64" height="64" rx="12" fill="none" stroke="#E5ECFF" />
            </g>
            {/* Right column content */}
            <rect x="258" y="132" width="96" height="12" rx="6" fill="#C9D8FF" />
            <rect x="258" y="150" width="84" height="8" rx="4" fill="#E0E8FF" />
            <rect x="258" y="164" width="72" height="8" rx="4" fill="#E0E8FF" />

            {/* CTA row */}
            <rect x="116" y="198" width="76" height="14" rx="7" fill="#1a73e8" opacity="0.9" />
            <rect x="196" y="198" width="72" height="14" rx="7" fill="#DCE6FF" />
          </g>

          {/* Drag handles (left of hero block) */}
          <g fill="#AFC6FF">
            <rect x="110" y="72" width="3" height="36" rx="1.5" />
            <rect x="114" y="72" width="3" height="36" rx="1.5" />
          </g>

          {/* Floating widget overlay (to suggest drag n drop) */}
          <g filter="url(#ds1)">
            <rect x="214" y="86" width="84" height="32" rx="8" fill="#FFFFFF" />
            <rect x="222" y="94" width="52" height="8" rx="4" fill="#C9D8FF" />
            <rect x="222" y="106" width="36" height="6" rx="3" fill="#E0E8FF" />
            <rect x="278" y="94" width="12" height="12" rx="3" fill="#1a73e8" opacity="0.9" />
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
