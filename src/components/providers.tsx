import { Loader2 } from "lucide-react";
import React, { FC, createContext, useEffect, useState } from "react";
import { UserProps } from "./types/app";

type Props = {
  children?: React.ReactNode;
};

export type GlobalContextType = {
  user: UserProps;
  setUser: React.Dispatch<React.SetStateAction<UserProps>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const GlobalContext = createContext<GlobalContextType>(
  null as unknown as GlobalContextType
);

const Providers: FC<Props> = (props) => {
  const [user, setUser] = useState<UserProps>(null as unknown as UserProps);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const parsedUser = JSON.parse(
        localStorage.getItem("user") as string
      ) as UserProps;
      if (
        parsedUser !== null &&
        parsedUser !== undefined &&
        Object.keys(parsedUser).length !== 0
      ) {
        setUser(parsedUser);
      }
    } catch (error) {
      setUser(undefined as unknown as UserProps);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && (user === null || user === undefined)) {
      window.location.href = "/login";
      console.log("Redirecting to login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GlobalContext.Provider value={{ user, setUser, loading, setLoading }}>
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
