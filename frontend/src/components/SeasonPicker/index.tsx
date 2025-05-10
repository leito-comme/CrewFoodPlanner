import { useFormContext } from 'react-hook-form';
import { useRef, useState, useEffect } from 'react';
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../ui/form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const seasons = [
  { value: 'winter', label: 'Winter' },
  { value: 'spring', label: 'Spring' },
  { value: 'autumn', label: 'Autumn' },
  { value: 'summer', label: 'Summer' },
];

function SeasonPicker() {
  const { control } = useFormContext();
  const [open, setOpen] = useState<boolean>(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    if (open && triggerRef.current) {
      setPopoverWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  return (
    <FormField
      control={control}
      name="season"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>Season</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  ref={triggerRef}
                  role="combobox"
                  className={cn(
                    'w-full justify-between bg-card outline-solid outline-1 outline-border',
                    open ? 'bg-primary/90' : 'bg-card'
                  )}>
                  {field.value
                    ? seasons.find((season) => season.value === field.value)
                        ?.label
                    : 'Select season'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              style={{ width: popoverWidth }}
              className="p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {seasons.map((season) => (
                      <CommandItem
                        key={season.value}
                        value={season.value}
                        onSelect={(currentValue) => {
                          field.onChange(currentValue);
                          setOpen(false);
                        }}>
                        {season.label}
                        <Check
                          className={cn(
                            'ml-auto',
                            field.value === season.value
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormDescription className="text-[12px]">
            Seasonality is used to adjust the final menu
          </FormDescription>
          <FormMessage className="text-[12px]" />
        </FormItem>
      )}
    />
  );
}

export default SeasonPicker;
