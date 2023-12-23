import { cn } from "@/lib/utils";
import React, { FC } from "react";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

const Container: FC<Props> = (props) => {
  return (
    <div className={cn("w-full p-5 rounded-md", props.className)}>
      {props.children}
    </div>
  );
};

export default Container;
