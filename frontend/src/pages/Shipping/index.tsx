import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import DatePicker from '@/components/DatePicker';
import { Button } from '@/components/ui/button';
import SeasonPicker from '@/components/SeasonPicker';
import InputForm from '@/components/InputForm';
import { DataTable } from '@/components/ShippingTable/data-table';
import { columns } from '@/components/ShippingTable/columns';
import { ShippingData } from '@/types';
import './Shipping.css';

const shippingData: ShippingData[] = [
  {
    voyage_number: 'V123456',
    departure_date: '2025-05-01T10:00:00Z',
    arrival_date: '2025-05-05T18:00:00Z',
    season: 'Summer',
    description: 'A voyage from port A to port B',
    is_current: true,
  },
  {
    voyage_number: 'V234567',
    departure_date: '2025-05-02T08:00:00Z',
    arrival_date: '2025-05-06T20:00:00Z',
    season: 'Autumn',
    description: 'Transporting cargo across the northern route',
    is_current: false,
  },
  {
    voyage_number: 'V345678',
    departure_date: '2025-06-01T14:00:00Z',
    arrival_date: '2025-06-10T10:00:00Z',
    season: 'Winter',
    description: 'A long-distance journey with multiple stops',
    is_current: true,
  },
  {
    voyage_number: 'V456789',
    departure_date: '2025-07-10T16:00:00Z',
    arrival_date: '2025-07-15T22:00:00Z',
    season: 'Spring',
    description: 'Seasonal route for perishable goods',
    is_current: false,
  },
  {
    voyage_number: 'V567890',
    departure_date: '2025-08-01T12:00:00Z',
    arrival_date: '2025-08-07T14:00:00Z',
    season: 'Summer',
    description: 'Standard cargo transport',
    is_current: true,
  },
];

const FormSchema = z.object({
  number: z
    .string()
    .min(6, { message: 'Voyage number must be at least 6 characters long' })
    .max(10, { message: 'Voyage number must be at most 10 characters long' })
    .nonempty({ message: 'Voyage number is required' }),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .refine((range) => range.from && range.to, {
      message: 'Date range is required',
    }),
  season: z.string().nonempty({ message: 'Season is required' }),
  description: z
    .string()
    .max(200, { message: 'Description must be at most 200 characters long' })
    .optional(),
});

function Shipping() {
  const [animationClass, setAnimationClass] = useState('');
  const [showCheckmark, setShowCheckmark] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      number: '',
      dateRange: { from: undefined, to: undefined },
      season: '',
      description: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    setShowCheckmark(true);
    setAnimationClass('animate');

    setTimeout(() => {
      setAnimationClass('');
      setShowCheckmark(false);
    }, 1700);
  }

  return (
    <div className="p-4 m-2 flex flex-row gap-4 outline-1 outline-border rounded-xl bg-background h-[90vh]">
      <div className="w-[360px] shrink-0 bg-card p-4 rounded-lg outline-1 outline-border relative">
        {showCheckmark && (
          <div className={`overlay ${showCheckmark ? 'show' : ''}`}>
            <div className="checkmark-wrapper">
              <svg
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
                className={`checkmark ${animationClass}`}>
                <path
                  d="M 18 32.34 l -8.34 -8.34 -2.83 2.83 11.17 11.17 24 -24 -2.83 -2.83 z"
                  stroke="#ddf2ff"
                  fill="transparent"
                />
              </svg>
            </div>
          </div>
        )}

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4">
            <InputForm
              name="number"
              formName="Voyage number"
              placeholder="Write your voyage number here"
            />
            <DatePicker
              pickerName={'Voyage duration'}
              pickerDescription={
                'Voyage duration is used to perform calculations'
              }
            />
            <SeasonPicker />
            <InputForm
              name="description"
              formName="Description"
              placeholder="Write short description here"
            />
            <Button
              type="submit"
              className="bg-primary text-white py-2 px-4  rounded">
              Submit
            </Button>
          </form>
        </FormProvider>
      </div>

      <div className="flex-1">
        <DataTable columns={columns} data={shippingData} />
      </div>
    </div>
  );
}

export default Shipping;
