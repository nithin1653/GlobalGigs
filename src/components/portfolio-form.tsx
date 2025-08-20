
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
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { uploadToCloudinary, handleUpdatePortfolio } from '@/app/actions';
import { getFreelancerById } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';


const portfolioFormSchema = z.object({
  portfolio: z.array(
    z.object({
      id: z.number().optional(),
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      imageUrls: z.array(z.string().url()).min(1, 'At least one image is required'),
      technologiesUsed: z.string().optional(),
    })
  ),
});

type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

interface PortfolioFormProps {
    userId: string;
}

const PortfolioItemImages = ({ control, index }: { control: any, index: number}) => {
    const imageUrls = useWatch({
        control,
        name: `portfolio.${index}.imageUrls`,
        defaultValue: []
    });

    const title = useWatch({
        control,
        name: `portfolio.${index}.title`,
    });
    
    if (!imageUrls || imageUrls.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <UploadCloud className="h-8 w-8" />
                <p className="text-sm mt-2">No images uploaded</p>
            </div>
        )
    }

    return (
        <Carousel className="w-full max-w-xs mx-auto">
            <CarouselContent>
                {imageUrls.map((url: string, imgIndex: number) => (
                    <CarouselItem key={imgIndex}>
                        <Image src={url} alt={`${title || 'Portfolio Item'} - ${imgIndex + 1}`} width={600} height={400} className="object-cover w-full h-full rounded-md" />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    )
}

export default function PortfolioForm({ userId }: PortfolioFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      portfolio: [],
    },
  });

  useEffect(() => {
    async function loadPortfolioData() {
        if (!userId) return;
        setIsLoading(true);
        try {
            const freelancer = await getFreelancerById(userId);
            if (freelancer?.portfolio && freelancer.portfolio.length > 0) {
                const portfolioWithTechString = freelancer.portfolio.map(item => ({
                    ...item,
                    imageUrls: item.imageUrls || [],
                    technologiesUsed: item.technologiesUsed?.join(', ') || '',
                }));
                form.reset({ portfolio: portfolioWithTechString });
            } else {
                form.reset({ portfolio: [] });
            }
        } catch (error) {
            console.error("Failed to fetch portfolio", error);
        } finally {
            setIsLoading(false);
        }
    }
    loadPortfolioData();
  }, [userId, form]);


  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'portfolio',
  });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingIndex(index);
    
    const currentItem = form.getValues(`portfolio.${index}`);
    const existingImageUrls = currentItem.imageUrls || [];

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadToCloudinary(formData);

        if (result.success && result.url) {
            uploadedUrls.push(result.url);
        } else {
             toast({
                variant: 'destructive',
                title: `Upload Failed for ${file.name}`,
                description: result.error || 'There was a problem uploading an image.',
            });
        }
    }

    if (uploadedUrls.length > 0) {
        update(index, { ...currentItem, imageUrls: [...existingImageUrls, ...uploadedUrls] });
        toast({
            title: 'Images Uploaded!',
            description: `${uploadedUrls.length} image(s) have been successfully uploaded.`,
        });
    }

    setUploadingIndex(null);
  };

  async function onSubmit(data: PortfolioFormValues) {
    setIsSaving(true);
    const result = await handleUpdatePortfolio(userId, data.portfolio);
    setIsSaving(false);

    if (result.success) {
        toast({
            title: 'Portfolio Updated!',
            description: 'Your new portfolio items have been saved.',
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: result.error || 'There was a problem saving your portfolio.',
        });
    }
  }
  
  if (isLoading) {
      return (
        <Card className="bg-background/60 backdrop-blur-xl">
             <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-64 w-full" />
            </CardContent>
        </Card>
      )
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
                  <FormLabel>Images</FormLabel>
                   <div className="mt-2 aspect-video rounded-md border flex items-center justify-center overflow-hidden bg-muted">
                        {uploadingIndex === index ? (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <p>Uploading...</p>
                            </div>
                        ) : (
                           <PortfolioItemImages control={form.control} index={index} />
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
                   <FormField
                    control={form.control}
                    name={`portfolio.${index}.technologiesUsed`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Technologies Used (comma-separated)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between items-center">
                    <div>
                        <FormLabel>Upload New Images</FormLabel>
                        <div className="flex gap-2 mt-2">
                             <Input 
                                type="file"
                                className="hidden"
                                ref={(el) => (fileInputRefs.current[index] = el)}
                                onChange={(e) => handleFileChange(e, index)}
                                accept="image/png, image/jpeg, image/gif"
                                multiple
                             />
                             <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRefs.current[index]?.click()}
                                disabled={uploadingIndex !== null}
                             >
                                <UploadCloud className="mr-2"/>
                                {uploadingIndex === index ? 'Uploading...' : 'Add Images'}
                             </Button>
                        </div>
                    </div>
                 
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="self-end"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ title: '', description: '', imageUrls: [], technologiesUsed: '' })}
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
