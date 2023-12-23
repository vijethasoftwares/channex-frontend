import { Loader2 } from "lucide-react";
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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const _u = localStorage.getItem("_rfou") as string;
    const parsedUser = JSON.parse(_u) as UserProps;
    if (
      parsedUser !== null &&
      parsedUser !== undefined &&
      Object.keys(parsedUser).length !== 0
    ) {
      setUser(parsedUser);
      setLoading(false);
    } else {
      window.location.href = "/login";
      setLoading(false);
    }
  }, []);

  return (
    <GlobalContext.Provider value={{ user, setUser }}>
      {props.children}
      {loading && (
        <div className="fixed bg-white inset-0 w-full h-full flex justify-center items-center z-[999]">
          <Loader2 className="animate-spin h-12 w-12 text-purple-500" />
        </div>
      )}
    </GlobalContext.Provider>
  );
};

export default Providers;
