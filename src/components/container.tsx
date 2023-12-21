import React, { FC } from "react";

type Props = {
  children?: React.ReactNode;
};

const Container: FC<Props> = (props) => {
  return <div className="w-full p-5">{props.children}</div>;
};

export default Container;
