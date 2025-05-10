import { NavLink } from "react-router-dom";
import { cn } from '@/lib/utils'
import { Home, Users, Ship, Hop, Workflow, ChartNoAxesCombined } from 'lucide-react';

const content = [
  {
    icon: <Home className='ml-auto h-5 w-5'/>,
    name: "Home",
    link: "/",
  },
  {
    icon: <Users className='ml-auto h-5 w-5'/>,
    name: "Crew",
    link: "/crew",
  },
  {
    icon: <Ship className='ml-auto h-5 w-5'/>,
    name: "Shipping details",
    link: "/shipping",
  },
  {
    icon: <Hop className='ml-auto h-5 w-5'/>,
    name: "Menu designer",
    link: "/menu",
  },
  {
    icon: <Workflow className='ml-auto h-5 w-5'/>,
    name: "Flow controller",
    link: "/flow",
  },
  {
    icon: <ChartNoAxesCombined className='ml-auto h-5 w-5'/>,
    name: "Analytics",
    link: "/analytics",
  },
];

function Navbar() {
  return (
    <div className="flex w-full bg-background px-6 py-4 justify-around">
      <div className="w-full max-w-6xl">
        <div className="flex gap-6 justify-center">
          {content.map(({ icon, name, link }) => (
            <NavLink
              key={name}
              to={link}
              className={({ isActive }) =>
                cn(
                  "relative px-4 py-2 flex flex-row items-center gap-2 text-md font-medium rounded-lg transition-all",
                  isActive
                    ? "after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:bg-primary text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:shadow-sm"
                )
              }
            >
              {icon}
              {name}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
