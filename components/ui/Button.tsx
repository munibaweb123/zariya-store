import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-maroon text-white",
  secondary: "border border-charcoal bg-transparent text-charcoal",
};

const BASE_CLASSES =
  "inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-xs px-8 text-label-caps shadow-none transition-colors";

type ButtonOwnProps = {
  variant?: ButtonVariant;
  className?: string;
};

type ButtonAsButton = ButtonOwnProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof ButtonOwnProps> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonOwnProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof ButtonOwnProps> & {
    href: ComponentPropsWithoutRef<typeof Link>["href"];
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const classes = [BASE_CLASSES, VARIANT_CLASSES[variant], className].filter(Boolean).join(" ");

  if (props.href !== undefined) {
    const { href, ...linkProps } = props as ButtonAsLink;
    return <Link href={href} className={classes} {...linkProps} />;
  }

  const buttonProps = props as ButtonAsButton;
  return <button type="button" className={classes} {...buttonProps} />;
}
