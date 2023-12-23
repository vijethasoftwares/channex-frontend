import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React, { FC } from "react";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

const Loader: FC<Props> = (props) => {
  return (
    <div className="flex justify-center items-center py-10">
      <Loader2
        className={cn("animate-spin rounded-full h-12 w-12", props.className)}
      />
    </div>
  );
};

export default Loader;
