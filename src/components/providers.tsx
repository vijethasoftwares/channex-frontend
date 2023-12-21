import React, { FC, createContext, useEffect, useState } from "react";
import { UserProps } from "./types/app";

type Props = {
  children?: React.ReactNode;
};

export type GlobalContextType = {
  user: UserProps;
  setUser: React.Dispatch<React.SetStateAction<UserProps>>;
};

export const GlobalContext = createContext<GlobalContextType>(
  null as unknown as GlobalContextType
);

const Providers: FC<Props> = (props) => {
  const [user, setUser] = useState<UserProps>(null as unknown as UserProps);

  useEffect(() => {
    const _u = localStorage.getItem("_rfou") as string;
    const parsedUser = JSON.parse(_u) as UserProps;
    if (
      parsedUser !== null &&
      parsedUser !== undefined &&
      Object.keys(parsedUser).length !== 0
    ) {
      setUser(parsedUser);
    }
  }, []);

  return (
    <GlobalContext.Provider value={{ user, setUser }}>
      {props.children}
    </GlobalContext.Provider>
  );
};

export default Providers;
