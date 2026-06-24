import { cn } from "@/lib/util/cn";

export function Container({
  children,
  size = "default",
  className,
}: {
  children: React.ReactNode;
  size?: "default" | "narrow" | "wide";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto px-5 sm:px-8 lg:px-12",
        size === "narrow" && "max-w-3xl",
        size === "default" && "max-w-page",
        size === "wide" && "max-w-[88rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}
