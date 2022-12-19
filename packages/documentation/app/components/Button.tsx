import { Link } from "@remix-run/react";
import type { HTMLAttributes } from "react";

export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  to?: string;
  href?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "tertiary";
  scheme?: "default" | "danger";
  icon?: React.ReactNode;
}

const classCombination = {
  defaultprimary:
    "bg-indigo-700 text-white hover:bg-indigo-500 active:bg-indigo-600",
  defaultsecondary:
    "bg-indigo-100 text-indigo-700 text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100",
  defaulttertiary: "text-indigo-700 hover:bg-gray-50 active:bg-gray-100",

  dangerprimary: "bg-red-700 text-white hover:bg-red-500 active:bg-red-600",
  dangersecondary:
    "bg-red-100 text-red-700 text-red-700 hover:bg-red-50 active:bg-red-100",
  dangertertiary: "text-red-700",
};

export const Button = ({
  to,
  href,
  children,
  type,
  icon,
  isLoading,
  loadingText,
  scheme,
  variant,
  className,
  ...props
}: ButtonProps) => {
  const sharedButtonClass =
    "block rounded flex items-center h-10 px-4 whitespace-nowrap";
  const actuelScheme = scheme || "default";
  const actualVariant = variant || "primary";
  const combinedClassName = classCombination[actuelScheme + actualVariant];

  if (to || href) {
    const linkProps = props as HTMLAttributes<HTMLAnchorElement>;
    const Component = href ? "a" : Link;

    return (
      <Component
        to={href ? undefined : to}
        href={href}
        className={
          sharedButtonClass + " " + combinedClassName + " " + className
        }
        {...linkProps}
      >
        <span className="flex flex-row gap-3 items-center">
          {icon}
          <span>{children}</span>
        </span>
      </Component>
    );
  }

  return (
    <button
      type={type}
      className={sharedButtonClass + " " + combinedClassName + " " + className}
      {...props}
      aria-disabled={isLoading}
      aria-label={isLoading ? loadingText : undefined}
    >
      <span className="flex flex-row gap-3 items-center">
        {icon}

        <span className={icon ? "text" : undefined}>{children}</span>
      </span>
    </button>
  );
};