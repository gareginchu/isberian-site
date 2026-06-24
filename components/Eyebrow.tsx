import { cn } from "@/lib/util/cn";

export function Eyebrow({
  children,
  className,
  as: As = "span",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "p" | "div";
}) {
  return <As className={cn("eyebrow", className)}>{children}</As>;
}
