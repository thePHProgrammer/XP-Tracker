import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/40 hover:brightness-110 hover:shadow-indigo-500/25 active:scale-[0.97]",
  secondary:
    "border border-white/10 bg-white/5 text-neutral-200 hover:border-white/20 hover:bg-white/10 active:scale-[0.97]",
  danger:
    "border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 active:scale-[0.97]",
  ghost: "text-neutral-400 hover:text-neutral-100",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export function buttonClass(
  variant: Variant = "primary",
  size: Size = "md",
  className = ""
) {
  return `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}
