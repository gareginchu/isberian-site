import Link from "next/link";
import { cn } from "@/lib/util/cn";

type Variant = "primary" | "secondary" | "ghost" | "link";

const base =
  "inline-flex items-center justify-center gap-2 text-sm tracking-wide-2 transition-colors duration-200 ease-out-soft focus-visible:outline-2 focus-visible:outline-offset-3";

const styles: Record<Variant, string> = {
  primary: "bg-ink text-cream hover:bg-ink-900 px-6 py-3",
  secondary: "border border-ink text-ink hover:bg-ink hover:text-cream px-6 py-3",
  ghost: "text-ink hover:text-ink-500 px-2 py-2",
  link: "text-ink underline underline-offset-4 decoration-ink-300 hover:decoration-ink p-0",
};

type CommonProps = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

export function Button({
  children,
  variant = "primary",
  className,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, styles[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  variant = "primary",
  className,
  ...rest
}: CommonProps & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link href={href} className={cn(base, styles[variant], className)} {...rest}>
      {children}
    </Link>
  );
}
