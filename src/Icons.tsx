import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}>{children}</svg>;
}

/** The ◈ brand symbol, drawn: a diamond holding a filled diamond. */
export function BrandMark({ size = 22, ...rest }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
    <path d="M12 1.5 22.5 12 12 22.5 1.5 12Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter"/>
    <path d="M12 7.2 16.8 12 12 16.8 7.2 12Z" fill="currentColor"/>
  </svg>;
}

export const ArrowDown = (p: IconProps) => <Svg {...p}><path d="M12 4v15M6 13l6 6 6-6"/></Svg>;
export const ArrowLeft = (p: IconProps) => <Svg {...p}><path d="M20 12H5M11 6l-6 6 6 6"/></Svg>;
export const ArrowRight = (p: IconProps) => <Svg {...p}><path d="M4 12h15M13 6l6 6-6 6"/></Svg>;
export const ArrowUpRight = (p: IconProps) => <Svg {...p}><path d="M7 17 17 7M8 7h9v9"/></Svg>;
export const Expand = (p: IconProps) => <Svg {...p}><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></Svg>;
export const Phone = (p: IconProps) => <Svg {...p}><path d="M5 3.5h3.2l1.6 4.3-2.1 1.4a11 11 0 0 0 7.1 7.1l1.4-2.1 4.3 1.6V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.1 1.5 1.5 0 0 1 5 3.5Z"/></Svg>;
export const Chat = (p: IconProps) => <Svg {...p}><path d="M4 19.5 5.3 15A8 8 0 1 1 9 18.7Z"/><path d="M9 10.5h6M9 13.5h4"/></Svg>;
export const Pin = (p: IconProps) => <Svg {...p}><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.2"/></Svg>;
export const Play = (p: IconProps) => <Svg {...p}><path d="M8 5.5v13l10-6.5Z" fill="currentColor" stroke="none"/></Svg>;
export const Pause = (p: IconProps) => <Svg {...p}><path d="M8 5v14M16 5v14" strokeWidth="2.6"/></Svg>;
export const Close = (p: IconProps) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18"/></Svg>;

/** Chart symbols */
export const Waypoint = (p: IconProps) => <Svg {...p} strokeWidth="1.6"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/></Svg>;
export const NorthArrow = (p: IconProps) => <svg width={p.size ?? 40} height={(p.size ?? 40) * 1.4} viewBox="0 0 40 56" aria-hidden="true" focusable="false"><path d="M20 4 30 40 20 33 10 40Z" fill="currentColor"/><path d="M20 4 20 33 10 40Z" fill="var(--paper)" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><text x="20" y="54" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" style={{ fontStretch: '75%' }}>N</text></svg>;
export const ParcelSymbol = (p: IconProps) => <Svg {...p} strokeWidth="1.6"><path d="M3.5 7 10 3.5l10.5 4-1.5 11-9 2-6.5-5.5Z" strokeDasharray="3 2.2"/><path d="M10 3.5 9 20.5M3.5 15 20.5 7.5"/></Svg>;
export const IndexSymbol = (p: IconProps) => <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2.5" y="5" width="3.8" height="14" fill="#a4143c"/><rect x="6.3" y="5" width="3.8" height="14" fill="#ffa21c"/><rect x="10.1" y="5" width="3.8" height="14" fill="#c4f000"/><rect x="13.9" y="5" width="3.8" height="14" fill="#00bc88"/><rect x="17.7" y="5" width="3.8" height="14" fill="#00734f"/><rect x="2.5" y="5" width="19" height="14" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg>;
export const WeatherSymbol = (p: IconProps) => <Svg {...p} strokeWidth="1.6"><path d="M7 17.5h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8 4.8 4.8 0 0 0 7 17.5Z"/><path d="M9 20.5l-.8 1.5M13 20.5l-.8 1.5M17 20.5l-.8 1.5"/></Svg>;
export const NotebookSymbol = (p: IconProps) => <Svg {...p} strokeWidth="1.6"><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/></Svg>;
export const DroneSymbol = (p: IconProps) => <Svg {...p} strokeWidth="1.6"><circle cx="5.5" cy="5.5" r="2.5"/><circle cx="18.5" cy="5.5" r="2.5"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="M7.5 7.5l2.5 2.5M16.5 7.5 14 10M7.5 16.5l2.5-2.5M16.5 16.5 14 14"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/></Svg>;

/** Weather glyphs (WMO weather_code families) */
export const Sun = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" /></Svg>;
export const CloudSun = (p: IconProps) => <Svg {...p}><path d="M8.5 6.2A4 4 0 0 1 15.8 8" /><path d="M8 3v1.4M3.6 7.4H5M4.9 4.3l1 1" /><path d="M7.5 19.5h9.5a3.6 3.6 0 0 0 .4-7.2 5.2 5.2 0 0 0-9.9 1.4 2.9 2.9 0 0 0 0 5.8Z" /></Svg>;
export const Cloud = (p: IconProps) => <Svg {...p}><path d="M7 18.5h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.8 4.8 0 0 0 1 9.5Z" /></Svg>;
export const Fog = (p: IconProps) => <Svg {...p}><path d="M7 13.5h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 4a4.8 4.8 0 0 0 1 9.5Z" /><path d="M4 17h16M6 20.5h12" /></Svg>;
export const Drizzle = (p: IconProps) => <Svg {...p}><path d="M7 14.5h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 5a4.8 4.8 0 0 0 1 9.5Z" /><path d="M9 18v.5M13 18v.5M17 18v.5M11 21v.5M15 21v.5" /></Svg>;
export const Rain = (p: IconProps) => <Svg {...p}><path d="M7 14.5h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 5a4.8 4.8 0 0 0 1 9.5Z" /><path d="m9 17-1.2 3.5M13 17l-1.2 3.5M17 17l-1.2 3.5" /></Svg>;
export const Storm = (p: IconProps) => <Svg {...p}><path d="M7 14.5h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 5a4.8 4.8 0 0 0 1 9.5Z" /><path d="m12.5 15-2.5 3.5h3L10.5 22" /></Svg>;
export const Snow = (p: IconProps) => <Svg {...p}><path d="M7 14.5h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 5a4.8 4.8 0 0 0 1 9.5Z" /><path d="M9 18h.01M13 18h.01M17 18h.01M11 21h.01M15 21h.01" strokeWidth="2.6" /></Svg>;
export const Wind = (p: IconProps) => <Svg {...p}><path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h8" /></Svg>;
export const Droplet = (p: IconProps) => <Svg {...p}><path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11Z" /></Svg>;
export const Refresh = (p: IconProps) => <Svg {...p}><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4" /></Svg>;
export const TrendUp = (p: IconProps) => <Svg {...p}><path d="m4 16 6-6 4 4 6-7M15 7h5v5" /></Svg>;
export const TrendDown = (p: IconProps) => <Svg {...p}><path d="m4 8 6 6 4-4 6 7M15 17h5v-5" /></Svg>;
export const Info = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Svg>;
