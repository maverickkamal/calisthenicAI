// src/components/icons/Logo.tsx
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="150"
      height="37.5"
      aria-label="CalisthenicsAI Logo"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <style>
        {`
          .logo-text {
            font-family: 'Inter', sans-serif;
            font-size: 28px;
            font-weight: 700;
            fill: url(#logoGradient);
            letter-spacing: -0.5px;
          }
          .logo-ai {
            fill: hsl(var(--accent));
          }
        `}
      </style>
      <text x="5" y="35" className="logo-text">
        Calisthenics<tspan className="logo-ai">AI</tspan>
      </text>
    </svg>
  );
}
