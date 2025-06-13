import { useEffect, useState } from "react";
import BidTable from "@/components/BidTable";
import { CurrentMenuProduct } from "@/types/entities/menu";
import axios from "@/services/axiosInstance";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";

export function Bid() {
  const [data, setData] = useState<CurrentMenuProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/current-menu-products");
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const saveChanges = async () => {
    const updates = data.map(({ product_id, price_per_kilo }) => ({
      product_id,
      price_per_kilo,
    }));

    setLoading(true);
    try {
      const res = await axios.patch(
        "http://127.0.0.1:8000/current-menu-products",
        updates
      );

      if (res.status !== 200) throw new Error("Failed to save changes");

      setIsEditing(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Products");

    worksheet.columns = [
      { header: "Product", key: "product_name", width: 30 },
      { header: "Total weight", key: "total_quantity_kg", width: 20 },
      { header: "Price per kg", key: "price_per_kilo", width: 20 },
      { header: "Total price", key: "total_price", width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };

    data.forEach((item) => {
      const total_quantity_kg = item.total_quantity_grams / 1000;
      const total_price = total_quantity_kg * item.price_per_kilo;

      worksheet.addRow({
        product_name: item.product_name,
        total_quantity_kg,
        price_per_kilo: item.price_per_kilo,
        total_price,
      });
    });

    worksheet.columns[1].numFmt = "0.00";
    worksheet.columns[2].numFmt = '"$"#,##0.00';
    worksheet.columns[3].numFmt = '"$"#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "products.xlsx");
  };

  return (
    <div className="flex flex-col gap-4 overflow-scroll">
      <div className="p-3 m-2 rounded-lg flex gap-6 bg-background shadow-md outline-1 outline-border">
        <div className="p-3 rounded-md flex gap-6 bg-card shadow-md outline-1 outline-border w-full">
          <Button
            onClick={() => setIsEditing(true)}
            disabled={isEditing || loading}
            className="btn btn-primary"
          >
            Edit
          </Button>
          <Button
            onClick={saveChanges}
            disabled={!isEditing || loading}
            className="btn btn-success"
          >
            Save
          </Button>
          <Button
            onClick={exportToExcel}
            disabled={loading}
            className="btn btn-secondary"
          >
            Export
          </Button>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {loading && <div>Loading...</div>}
        </div>
      </div>
      <div className="p-4 m-2 flex flex-row gap-4 outline-1 outline-border rounded-xl bg-background h-full overflow-y-scroll">
        <div className="overflow-auto w-full h-full">
          <BidTable
            initialData={data}
            isEditing={isEditing}
            onDataChange={setData}
          />
        </div>
      </div>
    </div>
  );
}
