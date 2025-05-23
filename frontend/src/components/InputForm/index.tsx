import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@components/ui/textarea';

interface InputFormProps {
  placeholder: string;
  formName: string;
  name: string;
}

function InputForm({ placeholder, formName, name }: InputFormProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col w-full">
          <FormLabel className="text-primary-foreground text-sm pointer-events-none">{formName}</FormLabel>
          {name === 'description' ? (
            <Textarea
              className="bg-card"
              id={name}
              placeholder={placeholder}
              {...field}
              rows={4}></Textarea>
          ) : (
            <Input
              className="bg-card"
              id={name}
              placeholder={placeholder}
              {...field}></Input>
          )}

          <FormMessage className="text-[12px]" />
        </FormItem>
      )}
    />
  );
}

export default InputForm;
