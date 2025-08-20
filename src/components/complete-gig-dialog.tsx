
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, CheckCircle } from 'lucide-react';
import type { Gig } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { handleCompleteGig } from '@/app/actions';

interface CompleteGigDialogProps {
  gig: Gig;
  onGigUpdated: (updatedGig: Gig) => void;
}

export function CompleteGigDialog({ gig, onGigUpdated }: CompleteGigDialogProps) {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  async function onComplete() {
    setIsSending(true);
    const result = await handleCompleteGig(gig);
    setIsSending(false);

    if (result.success && result.gig) {
      toast({
        title: 'Gig Completed!',
        description: 'The gig has been marked as complete and the client has been notified.',
      });
      onGigUpdated(result.gig);
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: result.error || 'There was a problem completing the gig.',
      });
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark as Completed
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will mark the gig "{gig.title}" as completed and notify the client. You won't be able to edit it further.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onComplete} disabled={isSending}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Yes, mark as completed
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
