
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
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
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const portfolioFormSchema = z.object({
  portfolio: z.array(
    z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      imageUrl: z.string().url('Must be a valid URL'),
      file: z.any().optional(),
    })
  ),
});

type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

export default function PortfolioForm() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      portfolio: [
        {
          title: 'Modern Website Design',
          description: 'A sleek and responsive design for a tech startup.',
          imageUrl: 'https://placehold.co/600x400.png',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'portfolio',
  });

  async function onSubmit(data: PortfolioFormValues) {
    setIsSaving(true);
    console.log('Submitting portfolio data:', data);
    // Here you would typically handle the file uploads to Firebase Storage
    // and then save the URLs to the Realtime Database.
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
    setIsSaving(false);
    toast({
      title: 'Portfolio Updated!',
      description: 'Your new portfolio items have been saved.',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="bg-background/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Your Portfolio</CardTitle>
            <CardDescription>
              Add or remove items from your talent showcase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-6 p-4 border rounded-lg"
              >
                <div className="md:col-span-1">
                  <FormLabel>Image</FormLabel>
                   <div className="mt-2 aspect-video rounded-md border flex items-center justify-center overflow-hidden">
                       <Image src={field.imageUrl} alt={field.title} width={600} height={400} className="object-cover" />
                    </div>
                </div>
                <div className="md:col-span-2 grid gap-4">
                  <FormField
                    control={form.control}
                    name={`portfolio.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`portfolio.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`portfolio.${index}.file`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload New Image</FormLabel>
                        <FormControl>
                          <Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 justify-self-end"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ title: '', description: '', imageUrl: 'https://placehold.co/600x400.png' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Portfolio Item
            </Button>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Showcase
          </Button>
        </div>
      </form>
    </Form>
  );
}
