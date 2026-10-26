/** Show the supplied logo at its visible bounds, without changing the source PNG. */
export function BrandLogo({ className = "", decorative = false, eager = false }: { className?: string; decorative?: boolean; eager?: boolean }) {
  return <span className={`gng-logo-mark ${className}`} aria-hidden={decorative || undefined}>
    <img src="/images/gng-logo.png" alt={decorative ? "" : "GNG"} loading={eager ? "eager" : "lazy"} width={1938} height={811} />
  </span>;
}
