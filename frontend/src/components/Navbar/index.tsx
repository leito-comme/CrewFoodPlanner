import { Tab, TabGroup, TabList } from "@headlessui/react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { Fragment } from "react";

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
        <TabGroup>
          <TabList className="flex gap-6 justify-center">
            {content.map(({ name, link }) => (
              <Tab as={Fragment} key={name}>
                {({ selected }) => (
                  <Link
                    to={link}
                    className={clsx(
                      "px-6 py-3 text-sm font-medium transition-all rounded-lg focus:outline-none",
                      selected && "bg-blue-500 text-white", // Active tab styles
                      !selected && "text-gray-600", // Default text color for inactive tabs
                      !selected && "hover:text-blue-500", // Hover effect for non-selected tabs
                      !selected && "hover:bg-blue-50" // Light background on hover for non-selected tabs
                    )}
                  >
                    {name}
                  </Link>
                )}
              </Tab>
            ))}
          </TabList>
        </TabGroup>
      </div>
    </div>
  );
}

export default Navbar;
