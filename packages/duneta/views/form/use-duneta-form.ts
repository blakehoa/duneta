import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldPath, type FieldValues, type UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

export type UseDunetaFormOptions<TSchema extends z.ZodTypeAny> = {
  schema: TSchema;
  defaultValues?: z.input<TSchema>;
  onSubmit: (values: z.output<TSchema>) => void | Promise<void>;
};

export function useDunetaForm<TSchema extends z.ZodTypeAny>({
  schema,
  defaultValues,
  onSubmit,
}: UseDunetaFormOptions<TSchema>) {
  const form = useForm<z.output<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as z.output<TSchema>,
  });

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return { ...form, submit };
}

export function dunetaFieldError<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  name: FieldPath<TFieldValues>,
): string | undefined {
  const error = form.formState.errors[name];
  return error?.message as string | undefined;
}
