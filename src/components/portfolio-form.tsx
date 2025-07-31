
'use client';

import { useForm, useFieldArray, useWatch } from 'react-hook-form';
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
import { PlusCircle, Trash2, Loader2, UploadCloud } from 'lucide-react';
import { useState, useRef, ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { uploadToCloudinary } from '@/app/actions';

const portfolioFormSchema = z.object({
  portfolio: z.array(
    z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      imageUrl: z.string().url('Must be a valid URL'),
    })
  ),
});

type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

const PortfolioItemImage = ({ control, index }: { control: any, index: number}) => {
    const imageUrl = useWatch({
        control,
        name: `portfolio.${index}.imageUrl`,
    });

    const title = useWatch({
        control,
        name: `portfolio.${index}.title`,
    });

    return (
         <Image src={imageUrl} alt={title || "Portfolio Item"} width={600} height={400} className="object-cover w-full h-full" />
    )
}

export default function PortfolioForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
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

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'portfolio',
  });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);

    const formData = new FormData();
    formData.append('file', file);
    
    const result = await uploadToCloudinary(formData);

    setUploadingIndex(null);

    if (result.success && result.url) {
      const currentItem = form.getValues(`portfolio.${index}`);
      update(index, { ...currentItem, imageUrl: result.url });
      toast({
        title: 'Image Uploaded!',
        description: 'Your image has been successfully uploaded to Cloudinary.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: result.error || 'There was a problem uploading your image.',
      });
    }
  };

  async function onSubmit(data: PortfolioFormValues) {
    setIsSaving(true);
    console.log('Submitting portfolio data:', data);
    // Here you would typically save the URLs to the Realtime Database.
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
                   <div className="mt-2 aspect-video rounded-md border flex items-center justify-center overflow-hidden bg-muted">
                        {uploadingIndex === index ? (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <p>Uploading...</p>
                            </div>
                        ) : (
                           <PortfolioItemImage control={form.control} index={index} />
                        )}
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

                    <div>
                        <FormLabel>Upload New Image</FormLabel>
                        <div className="flex gap-2 mt-2">
                             <Input 
                                type="file"
                                className="hidden"
                                ref={(el) => (fileInputRefs.current[index] = el)}
                                onChange={(e) => handleFileChange(e, index)}
                                accept="image/png, image/jpeg, image/gif"
                             />
                             <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRefs.current[index]?.click()}
                                disabled={uploadingIndex !== null}
                             >
                                <UploadCloud className="mr-2"/>
                                {uploadingIndex === index ? 'Uploading...' : 'Change Image'}
                             </Button>
                        </div>
                    </div>
                 
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="justify-self-end"
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
          <Button type="submit" disabled={isSaving || uploadingIndex !== null}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Showcase
          </Button>
        </div>
      </form>
    </Form>
  );
}
