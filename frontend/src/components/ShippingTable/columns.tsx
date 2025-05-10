import { ColumnDef } from "@tanstack/react-table";
import { ShippingData } from "@/types";

export const columns: ColumnDef<ShippingData>[] = [
  {
    accessorKey: "voyage_number",
    header: () => <div className="text-left font-bold">Voyage Number</div>,
    cell: ({ row }) => (
      <div className="text-left font-medium">{row.getValue("voyage_number")}</div>
    ),
  },
  {
    accessorKey: "departure_date",
    header: () => <div className="text-left font-bold">Departure Date</div>,
    cell: ({ row }) => {
      const departureDate = new Date(row.getValue("departure_date"));
      const formatted = departureDate.toLocaleDateString();
      return <div className="text-left font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "arrival_date",
    header: () => <div className="text-left font-bold">Arrival Date</div>,
    cell: ({ row }) => {
      const arrivalDate = new Date(row.getValue("arrival_date"));
      const formatted = arrivalDate.toLocaleDateString();
      return <div className="text-left font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "season",
    header: () => <div className="text-left font-bold">Season</div>,
    cell: ({ row }) => (
      <div className="text-left font-medium">{row.getValue("season")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: () => <div className="text-left font-bold">Description</div>,
    cell: ({ row }) => (
      <div className="text-left font-medium">{row.getValue("description") ?? 'N/A'}</div>
    ),
  },
  {
    accessorKey: "is_current",
    header: () => <div className="text-left font-bold">Current</div>,
    cell: ({ row }) => (
      <div className="text-left font-medium">
        {row.getValue("is_current") ? "Yes" : "No"}
      </div>
    ),
  },
];
