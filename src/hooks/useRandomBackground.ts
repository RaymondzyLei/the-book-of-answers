import { useEffect, useMemo } from 'react';

function buildNoiseSvg(seed: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>
    <filter id='n'>
      <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${seed}'/>
      <feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/>
    </filter>
    <rect width='100%' height='100%' filter='url(#n)'/>
  </svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

export function useRandomBackground() {
  const angle = useMemo(() => 135 + (Math.random() * 60 - 30), []);
  const seed = useMemo(() => Math.floor(Math.random() * 10000), []);

  useEffect(() => {
    document.body.style.setProperty('--bg-angle', `${Math.round(angle)}deg`);
    document.body.style.setProperty('--noise-url', buildNoiseSvg(seed));
  }, [angle, seed]);

  return { angle, seed };
}
