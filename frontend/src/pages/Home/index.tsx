import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const { role } = useAuth();

  return (
    <div className="p-4 m-2 flex flex-col gap-6 outline-1 outline-border rounded-xl bg-background h-full overflow-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome to Crew Food Planner ⚡
        </h1>
      </div>

      <div className="bg-card border border-border rounded-lg shadow p-4 flex flex-row items-center justify-between">
        <div className="block text-lg font-semibold text-foreground">
          Logged in as <span className="text-primary">{role}</span>
        </div>
        <LogoutButton />
      </div>

      <div className="bg-card rounded-lg shadow p-6 space-y-4">
        <p className="text-muted-foreground text-lg">
          This is your control center for managing the crew's nutrition. Here
          you can:
        </p>
        <ul className="list-disc list-inside text-foreground/90 space-y-1">
          <li>📦 View and edit the current menu</li>
          <li>📊 Generate supply requests and export to Excel</li>
          <li>👥 Upload crew lists and manage preferences</li>
          <li>📅 Plan meals by shift and date</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-muted rounded-lg p-4 text-center">
          <h2 className="text-xl text-foreground font-semibold">📁 Menu</h2>
          <p className="text-sm text-muted-foreground">
            Manage food items and portions
          </p>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <h2 className="text-xl text-foreground font-semibold">📥 Requests</h2>
          <p className="text-sm text-muted-foreground">
            Pricing, weights, and exports
          </p>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <h2 className="text-xl text-foreground font-semibold">🧑‍🤝‍🧑 Crew</h2>
          <p className="text-sm text-muted-foreground">
            Upload and manage members
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
