import { cn } from "@/lib/utils";
import { FC } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const Heading: FC<Props> = ({ children, className, ...props }) => {
  return (
    <h1
      className={cn(
        "text-3xl font-semibold font-sora text-purple-600",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
};
export default Heading;
