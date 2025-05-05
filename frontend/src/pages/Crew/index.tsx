import { useEffect, useState } from "react";
import axios from "axios";
import UploadCrew from "@components/UploadCrew";
import { CrewMemberData } from "@types";
import { DataTable } from "@/components/CrewTable/data-table";
import { columns } from "@/components/CrewTable/columns";

function Crew() {
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
    <div className="p-4 flex flex-col gap-4">
      <UploadCrew onUploadSuccess={handleUploadSuccess} />
      <DataTable columns={columns} data={crewData} />
    </div>
  );
}

export default Crew;
