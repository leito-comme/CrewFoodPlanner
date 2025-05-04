import { NavLink } from "react-router-dom";
import clsx from "clsx";

const content = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Crew",
    link: "/crew",
  },
  {
    name: "Shipping details",
    link: "/shipping",
  },
  {
    name: "Menu designer",
    link: "/menu",
  },
  {
    name: "Flow controller",
    link: "/flow",
  },
  {
    name: "Analytics",
    link: "/analytics",
  },
];

function Navbar() {
  return (
    <div className="flex w-full bg-white px-6 py-4 justify-around">
      <div className="w-full max-w-6xl">
        <div className="flex gap-6 justify-center">
          {content.map(({ name, link }) => (
            <NavLink
              key={name}
              to={link}
              className={({ isActive }) =>
                clsx(
                  "px-6 py-3 text-sm font-medium transition-all rounded-lg focus:outline-none",
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:text-blue-500 hover:bg-blue-50"
                )
              }
            >
              {name}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
