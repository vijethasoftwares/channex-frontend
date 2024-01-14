import { FC, Fragment, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/navbar";
import SideBar from "./components/sidebar";
import { useGlobalContext } from "./lib/utils";

const App: FC = () => {
  const { user, loading } = useGlobalContext();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/") navigate("/dashboard/analytics");
    if (user === null && !loading) {
      // document.documentElement.classList.add("dark");
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);
  return (
    <Fragment>
      <Navbar />
      <main
        key={"main"}
        className="max-w-screen-2xl mb-2 mx-auto bg-slate-50 p-2 rounded-md flex justify-start gap-2 w-full"
      >
        <SideBar />
        <div className="p-2 bg-white rounded-md w-full overflow-x-auto">
          <Outlet />
        </div>
      </main>
    </Fragment>
  );
};

export default App;
