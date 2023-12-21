import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FC, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
};

type DropDownItemProps = {
  children?: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  link: string;
};

const CollapsableDropdown: FC<Props> = (props) => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = useLocation().pathname;
  return (
    <motion.div
      animate={{
        height: isVisible ? "auto" : "52px",
      }}
      layout="position"
    >
      <div className="relative flex items-center justify-between">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={cn(
            "relative z-10 flex items-center justify-between w-full px-4 py-4 gap-2.5 text-sm font-medium text-left text-purple-950 bg-white rounded-lg hover:bg-purple-100 hover:text-purple-950 duration-100",
            isVisible ? "bg-purple-100" : "",
            pathname.includes(props.title.toLowerCase()) ? "bg-purple-100" : ""
          )}
        >
          <div className="flex gap-2.5 items-center">
            {props.icon && props.icon}
            <span>{props.title}</span>
          </div>
          <ChevronDown
            size={18}
            className={cn(
              "duration-200",
              isVisible ? "transform rotate-180" : ""
            )}
          />
        </button>
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div className="overflow-hidden relative z-[5] mt-1">
            <motion.div
              layout
              initial={{
                opacity: 0,
                y: "-100%",
              }}
              animate={{
                opacity: 1,
                y: 0,
                transformOrigin: "top",
                transition: {
                  duration: 0.5,
                  ease: [0.87, 0, 0.13, 1],
                },
              }}
              exit={{
                opacity: 0,
                y: "-100%",
                transition: {
                  duration: 0.2,
                },
              }}
              className=""
            >
              <div className="relative flex flex-col bg-purple-50 rounded-lg text-sm p-1.5 origin-top">
                {props.children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CollapsableDropdownItem: FC<DropDownItemProps> = (props) => {
  return (
    <NavLink
      to={props.link}
      className="pr-2.5 pl-9 py-2 rounded-md hover:bg-white hover:text-purple-800 flex items-center justify-between gap-2"
    >
      <span className="text-sm">{props.title}</span>
    </NavLink>
  );
};

export default CollapsableDropdown;
