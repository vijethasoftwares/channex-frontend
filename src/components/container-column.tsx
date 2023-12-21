import React, { FC } from "react";

type Props = {
  children: React.ReactNode;
};

const ContainerColumn: FC<Props> = (props) => {
  return (
    <div className="flex flex-col justify-start items-start">
      {props.children}
    </div>
  );
};

export default ContainerColumn;
