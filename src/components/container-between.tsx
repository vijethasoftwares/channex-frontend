import React, { FC } from "react";

type Props = {
  children?: React.ReactNode;
};

const ContainerBetween: FC<Props> = (props) => {
  return (
    <div className="w-full flex justify-between items-center">
      {props.children}
    </div>
  );
};

export default ContainerBetween;
