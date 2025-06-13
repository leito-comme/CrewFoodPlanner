import { useEffect, useState } from "react";
import axios from "@/services/axiosInstance";
import UploadCrew from "@components/UploadCrew";
import { CrewMemberData } from "@types";
import { DataTable } from "@/components/CrewTable/data-table";
import { columns } from "@/components/CrewTable/columns";

const Crew = () => {
  const [crewData, setCrewData] = useState<CrewMemberData[]>([]);
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/crew");
        if (Array.isArray(res.data)) {
          setCrewData(res.data);
        }
      } catch (err) {
        setError("Downloading failed!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleUploadSuccess = (newData: CrewMemberData[]): void => {
    setCrewData(newData);
    setError(null);
  };

  return isLoading ? (
    <div>Fetching data...</div>
  ) : error ? (
    <div className="error">{error}</div>
  ) : (
    <div className="flex flex-col gap-4 overflow-scroll">
      <div className="p-3 m-2 rounded-lg flex gap-6 bg-background shadow-md outline-1 outline-border">
        <UploadCrew onUploadSuccess={handleUploadSuccess} />
      </div>
      <div className="p-4 m-2 flex flex-row gap-4 outline-1 outline-border rounded-xl bg-background h-full overflow-y-scroll">
        <div className="w-full">
          <DataTable columns={columns} data={crewData} />
        </div>
      </div>
    </div>
  );
};

export default Crew;
