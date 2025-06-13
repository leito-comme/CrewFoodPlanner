import { ColumnDef } from "@tanstack/react-table";
import { CurrentMenuProduct } from "@/types/entities/menu";

export const columns: ColumnDef<CurrentMenuProduct>[] = [
  {
    id: "product_name",
    accessorFn: (row) => row.product_name,
    header: () => <div className="text-center font-bold">Product Name</div>,
    cell: (info) => (
      <div className="text-center font-medium">{info.getValue() as string}</div>
    ),
  },
  {
    id: "total_quantity_grams",
    accessorFn: (row) => row.total_quantity_grams,
    header: () => <div className="text-center font-bold">Weight (kg)</div>,
    cell: (info) => (
      <div className="text-center font-medium">
        {((info.getValue() as number) / 1000).toFixed(2)}
      </div>
    ),
  },
  {
    id: "price_per_kilo",
    accessorFn: (row) => row.price_per_kilo,
    header: () => <div className="text-center font-bold">Price / kg</div>,
    cell: (info) => (
      <div className="text-center font-medium">
        {(info.getValue() as number).toFixed(2)}
      </div>
    ),
  },
  {
    id: "total_price",
    header: () => <div className="text-center font-bold">Total Price</div>,
    cell: ({ row }) => {
      const price = row.original.price_per_kilo;
      const grams = row.original.total_quantity_grams;
      return (
        <div className="text-center font-medium">
          {((price * grams) / 1000).toFixed(2)}
        </div>
      );
    },
  },
];
