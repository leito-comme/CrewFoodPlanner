import { CalendarIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import clsx from 'clsx';

interface DatePickerProps {
  pickerName: string;
  pickerDescription: string;
}

function DatePicker({ pickerName, pickerDescription }: DatePickerProps) {
  const { control } = useFormContext();

  const maxDate = new Date();
  const minDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);

  const disabledDates = (date: Date) => date > maxDate || date < minDate;

  return (
    <FormField
      control={control}
      name="dateRange"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="text-primary-foreground text-sm pointer-events-none">
            {pickerName}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  className={clsx(
                    'w-full pl-3 text-left font-medium text-foreground outline-solid outline-1 outline-border bg-card',
                    !field.value && 'text-muted-foreground/50'
                  )}>
                  {field.value.from === undefined ||
                  field.value.to === undefined
                    ? 'Select a range'
                    : `${field.value.from?.toLocaleDateString()} - ${field.value.to?.toLocaleDateString()}`}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="range"
                selected={field.value}
                onSelect={field.onChange}
                disabled={disabledDates}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormDescription className='text-[12px]'>{pickerDescription}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default DatePicker;
