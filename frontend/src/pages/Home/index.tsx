import LogoutButton from "@/components/LogoutButton";

function Home() {
  return (
    <div className="p-4 m-2 flex flex-row gap-4 outline-1 outline-border rounded-xl bg-background h-full">
      <LogoutButton />
    </div>
  );
}

export default Home;
