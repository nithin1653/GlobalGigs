
'use client';

import { useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

interface ExperienceFormProps {
  form: UseFormReturn<any>;
}

export function ExperienceForm({ form }: ExperienceFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'experience',
  });

  return (
    <Card className="bg-background/60 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Experience History</CardTitle>
        <CardDescription>List your previous roles in detail.</CardDescription>
      </CardHeader>
      <CardContent>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start mb-4 p-4 border rounded-lg"
          >
            <FormField
              control={form.control}
              name={`experience.${index}.role`}
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`experience.${index}.company`}
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`experience.${index}.period`}
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Period</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-6 text-destructive hover:bg-destructive/10"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ role: '', company: '', period: '' })}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
        </Button>
      </CardContent>
    </Card>
  );
}
