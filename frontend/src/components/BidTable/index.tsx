import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns as initialColumns } from "./columns";
import { CurrentMenuProduct } from "@/types/entities/menu";

interface BidTableProps {
  initialData: CurrentMenuProduct[];
  isEditing: boolean;
  onDataChange: React.Dispatch<React.SetStateAction<CurrentMenuProduct[]>>;
}

const EditableCell = ({
  initialValue,
  rowId,
  onValueChange,
  isEditing,
}: {
  initialValue: number;
  rowId: number;
  onValueChange: (id: number, newValue: number) => void;
  isEditing: boolean;
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (!isEditing) return <div>{value.toFixed(2)} $</div>;

  return (
    <input
      type="number"
      className="w-full border px-2 py-1 rounded"
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        // Можно оставить пустое поле, чтобы пользователь мог стирать перед вводом
        if (val === "") {
          setValue(0);
          return;
        }
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) setValue(parsed);
      }}
      onBlur={() => onValueChange(rowId, value)}
      // Также можно обработать Enter, если нужно
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      step="0.01"
      min="0"
    />
  );
};

const BidTable = ({ initialData, isEditing, onDataChange }: BidTableProps) => {
  // НЕ создаём локальный data, используем initialData из пропсов

  const handleValueChange = (id: number, newPrice: number) => {
    onDataChange((old) => {
      const idx = old.findIndex((item) => item.id === id);
      if (idx === -1) return old;
      if (old[idx].price_per_kilo === newPrice) return old;

      const updated = [...old];
      updated[idx] = { ...updated[idx], price_per_kilo: newPrice };
      return updated;
    });
  };

  const columns = initialColumns.map((col) => {
    if (col.id === "price_per_kilo") {
      return {
        ...col,
        cell: ({ row }) => (
          <EditableCell
            initialValue={row.original.price_per_kilo}
            rowId={row.original.id}
            onValueChange={handleValueChange}
            isEditing={isEditing}
          />
        ),
      };
    }

    if (col.id === "total_price") {
      return {
        ...col,
        cell: ({ row }) => {
          const price = row.original.price_per_kilo;
          const grams = row.original.total_quantity_grams;
          const total = price * (grams / 1000);
          return <div>{total.toFixed(2)} $</div>;
        },
      };
    }

    return col;
  });

  return (
    <DataTable<CurrentMenuProduct, any> columns={columns} data={initialData} />
  );
};

export default React.memo(BidTable);
