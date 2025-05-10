import { ColumnDef } from "@tanstack/react-table";
import { CrewMemberData } from "@/types";

export const columns: ColumnDef<CrewMemberData>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left font-bold">Name</div>,
  },
  {
    accessorKey: "height",
    header: () => <div className="text-left font-bold">Height</div>,
    cell: ({ row }) => {
      const height = parseFloat(row.getValue("height")).toFixed(1);
      const formatted = `${height} cm`;
      return <div className="text-left font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "weight",
    header: () => <div className="text-left font-bold">Weight</div>,
    cell: ({ row }) => {
      const weight = parseFloat(row.getValue("weight")).toFixed(1);
      const formatted = `${weight} kg`;
      return <div className="text-left font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "allergies",
    header: () => <div className="text-left font-bold">Allergies</div>,
  },
];
