import { useEffect, useState } from 'react';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import DatePicker from '@/components/DatePicker';
import { Button } from '@/components/ui/button';
import SeasonPicker from '@/components/SeasonPicker';
import InputForm from '@/components/InputForm';
import { DataTable } from '@/components/ShippingTable/data-table';
import { columns } from '@/components/ShippingTable/columns';
import { ShippingData } from '@/types';
import './Shipping.css';

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
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingData[]>([]);
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [flag, setFlag] = useState<Boolean>(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/shipping');
        if (Array.isArray(res.data)) {
          setShippingData(res.data);
        }
      } catch (err) {
        setError('Downloading failed!');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
    setFlag(false);
  }, [flag]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      number: '',
      dateRange: { from: undefined, to: undefined },
      season: '',
      description: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await axios.post('http://127.0.0.1:8000/shipping/add', {
        voyage_number: data.number,
        departure_date: data.dateRange.from?.toLocaleDateString('sv-SE'),
        arrival_date: data.dateRange.to?.toLocaleDateString('sv-SE'),
        season: data.season,
        description: data.description,
      });

      setFlag(true);
      setShowCheckmark(true);

      setTimeout(() => {
        setShowCheckmark(false);
      }, 1700);
    } catch (error) {
      setError('Failed to submit the form');
    }
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
                className={cn('checkmark', showCheckmark ? 'animate' : '')}>
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
