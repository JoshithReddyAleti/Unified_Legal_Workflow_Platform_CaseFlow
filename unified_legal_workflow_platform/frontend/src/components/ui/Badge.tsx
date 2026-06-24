type BadgeVariant = "critical" | "high" | "medium" | "low" | "info" | "default" | "purple";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}${className ? ` ${className}` : ""}`}>
      {children}
    </span>
  );
}

export function urgencyBadge(urgency: string) {
  const map: Record<string, BadgeVariant> = {
    critical: "critical",
    high: "high",
    medium: "medium",
    low: "low",
  };
  const variant = map[urgency] || "default";
  return <Badge variant={variant}>{urgency}</Badge>;
}
