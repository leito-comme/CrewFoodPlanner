import { ColumnDef } from '@tanstack/react-table';
import { ShippingData } from '@/types';
import { cn } from '@/lib/utils';

export const columns: ColumnDef<ShippingData>[] = [
  {
    accessorKey: 'voyage_number',
    header: () => <div className="text-center font-bold">Voyage Number</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue('voyage_number')}
      </div>
    ),
  },
  {
    accessorKey: 'departure_date',
    header: () => <div className="text-center font-bold">Departure Date</div>,
    cell: ({ row }) => {
      const departureDate = new Date(row.getValue('departure_date'));
      const formatted = departureDate.toLocaleDateString();
      return <div className="text-center font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'arrival_date',
    header: () => <div className="text-center font-bold">Arrival Date</div>,
    cell: ({ row }) => {
      const arrivalDate = new Date(row.getValue('arrival_date'));
      const formatted = arrivalDate.toLocaleDateString();
      return <div className="text-center font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'season',
    header: () => <div className="text-center font-bold">Season</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.getValue('season')}</div>
    ),
  },
  {
    accessorKey: 'description',
    header: () => <div className="text-center font-bold">Description</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue('description') ?? 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: 'is_current',
    header: () => <div className="text-center font-bold">Current</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium">
        <div
          className={cn(
            'w-3 h-3 rounded-full mx-auto',
            row.getValue('is_current') === true
              ? 'bg-green-300 shadow-[0_0_6px_#4ade80]'
              : 'bg-red-400 shadow-[0_0_6px_#f87171]'
          )}
        />
      </div>
    ),
  },
];
