
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Edit } from 'lucide-react';
import type { Gig } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { handleUpdateGig } from '@/app/actions';

const editGigSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  price: z.coerce.number().min(1, 'Price must be a positive number.'),
});

type EditGigValues = z.infer<typeof editGigSchema>;

interface EditGigDialogProps {
  gig: Gig;
  onGigUpdated: (updatedGig: Gig) => void;
}

export function EditGigDialog({ gig, onGigUpdated }: EditGigDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditGigValues>({
    resolver: zodResolver(editGigSchema),
    defaultValues: {
      title: gig.title,
      description: gig.description,
      price: gig.price,
    },
  });

  async function onSubmit(data: EditGigValues) {
    setIsSending(true);
    const result = await handleUpdateGig(gig, data);
    setIsSending(false);

    if (result.success) {
      const priceChanged = gig.price !== data.price;
      toast({
        title: 'Gig Update Submitted!',
        description: priceChanged 
          ? 'A proposal with the new price has been sent to the client for approval.'
          : 'The gig details have been updated.',
      });
      if (result.gig) {
        onGigUpdated(result.gig);
      }
      setIsOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: result.error || 'There was a problem updating the gig.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                    <DialogTitle>Edit Gig</DialogTitle>
                    <DialogDescription>
                        Update the details for this gig. If you change the price, a new proposal will be sent to the client for approval.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Project Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem><FormLabel>Total Price (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={isSending}>
                        {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Update
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
