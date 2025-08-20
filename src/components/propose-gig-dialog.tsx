
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
import { Loader2, Briefcase } from 'lucide-react';
import type { Conversation } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { sendGigProposal } from '@/app/actions';

const gigProposalSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  price: z.coerce.number().min(1, 'Price must be a positive number.'),
});

type GigProposalValues = z.infer<typeof gigProposalSchema>;

interface ProposeGigDialogProps {
  conversation: Conversation;
  freelancerId: string;
}

export function ProposeGigDialog({ conversation, freelancerId }: ProposeGigDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const form = useForm<GigProposalValues>({
    resolver: zodResolver(gigProposalSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
    },
  });

  async function onSubmit(data: GigProposalValues) {
    setIsSending(true);
    const result = await sendGigProposal({
        ...data,
        conversationId: conversation.id,
        freelancerId: freelancerId,
        clientId: conversation.participant.id,
    });
    setIsSending(false);

    if (result.success) {
      toast({
        title: 'Proposal Sent!',
        description: 'Your gig proposal has been sent to the client.',
      });
      setIsOpen(false);
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: result.error || 'There was a problem sending your proposal.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Briefcase className="h-4 w-4" />
          <span className="sr-only">Propose a Gig</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                    <DialogTitle>Propose a New Gig</DialogTitle>
                    <DialogDescription>
                        Send a formal proposal to {conversation.participant.name}. They can accept it directly from the chat.
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
                        <FormItem><FormLabel>Total Price ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={isSending}>
                        {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Proposal
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
