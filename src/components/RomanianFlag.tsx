export function RomanianFlag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-3.5 w-5 overflow-hidden rounded-[2px] align-middle shadow-soft ${className}`}
      role="img"
      aria-label="Steagul României"
    >
      <span className="h-full w-1/3" style={{ backgroundColor: "var(--ro-blue)" }} />
      <span className="h-full w-1/3" style={{ backgroundColor: "var(--ro-yellow)" }} />
      <span className="h-full w-1/3" style={{ backgroundColor: "var(--ro-red)" }} />
    </span>
  );
}
