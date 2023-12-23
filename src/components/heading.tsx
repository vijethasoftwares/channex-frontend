import { cn } from "@/lib/utils";
import { FC } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  variant?:
    | "heading"
    | "subheading"
    | "title"
    | "subtitle"
    | "body"
    | "caption"
    | "overline";
}

const variantStyles: Record<string, string> = {
  heading: "text-3xl font-semibold font-sora text-purple-600",
  subheading: "text-2xl font-semibold font-sora text-zinc-700",
  title: "text-xl font-semibold text-black",
  subtitle: "text-lg font-semibold text-black",
  body: "text-base font-normal text-black",
  caption: "text-sm font-normal text-zinc-500",
  overline: "text-xs font-normal text-zinc-400",
};

const Heading: FC<Props> = ({ children, className, variant = "heading" }) => {
  const Component =
    variant === "body" || variant === "caption" || variant === "overline"
      ? "p"
      : "h1";

  return (
    <Component className={cn(variantStyles[variant || "heading"], className)}>
      {children}
    </Component>
  );
};

export default Heading;
