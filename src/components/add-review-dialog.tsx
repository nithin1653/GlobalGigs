
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Star } from 'lucide-react';
import type { Freelancer } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { handleSubmitReview } from '@/app/actions';
import { cn } from '@/lib/utils';

const reviewSchema = z.object({
  comment: z.string().min(10, 'Review must be at least 10 characters.'),
  rating: z.coerce.number().min(1, 'Please select a rating').max(5),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface AddReviewDialogProps {
  freelancer: Freelancer;
  onReviewAdded: () => void;
}

export function AddReviewDialog({ freelancer, onReviewAdded }: AddReviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      comment: '',
      rating: 0,
    },
  });

  const currentRating = form.watch('rating');

  async function onSubmit(data: ReviewFormValues) {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'You must be logged in to leave a review.' });
        return;
    }
    
    setIsSending(true);
    const result = await handleSubmitReview({
        ...data,
        freelancerId: freelancer.id,
        clientId: user.uid,
        clientName: userProfile.name,
        clientAvatarUrl: userProfile.avatarUrl,
    });
    setIsSending(false);

    if (result.success) {
      toast({
        title: 'Review Submitted!',
        description: 'Thank you for your feedback.',
      });
      onReviewAdded();
      setIsOpen(false);
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: result.error || 'There was a problem submitting your review.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Write a Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                    <DialogTitle>Review {freelancer.name}</DialogTitle>
                    <DialogDescription>
                        Share your experience working with this freelancer.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <FormField control={form.control} name="rating" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rating</FormLabel>
                             <FormControl>
                                <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                    key={star}
                                    className={cn(
                                        "h-8 w-8 cursor-pointer text-gray-300 transition-colors",
                                        (hoverRating >= star || currentRating >= star) && "text-amber-400 fill-amber-400"
                                    )}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onClick={() => field.onChange(star)}
                                    />
                                ))}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="comment" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Comment</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={4} placeholder="Describe your experience..."/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={isSending}>
                        {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Review
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
