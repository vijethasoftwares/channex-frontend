import { cn } from "@/lib/utils";
import { FC } from "react";
import { NavLink, useLocation } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  link: string;
};

const SidebarLink: FC<Props> = (props) => {
  const pathname = useLocation().pathname;
  return (
    <NavLink
      to={props.link}
      className={cn(
        "relative z-10 flex items-center justify-between w-full px-4 py-4 gap-2.5 text-sm font-medium text-left text-purple-950 bg-white rounded-lg hover:bg-purple-100 duration-100",
        pathname.includes(props.link) ? "bg-purple-100" : ""
      )}
    >
      <div className="flex gap-2.5 items-center">
        {props.icon && props.icon}
        <span>{props.title}</span>
      </div>
    </NavLink>
  );
};

export default SidebarLink;
