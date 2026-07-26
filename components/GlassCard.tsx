export default function GlassCard({
  children,
  className = "",
  strong = false,
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`${
        strong ? "glass-strong" : "glass"
      } rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
}
