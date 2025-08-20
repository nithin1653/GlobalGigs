
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
import { Loader2, Trash2 } from 'lucide-react';
import type { Gig } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { handleCancelGig } from '@/app/actions';

interface CancelGigDialogProps {
  gig: Gig;
  onGigUpdated: (updatedGig: Gig) => void;
}

export function CancelGigDialog({ gig, onGigUpdated }: CancelGigDialogProps) {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  async function onCancel() {
    setIsSending(true);
    const result = await handleCancelGig(gig);
    setIsSending(false);

    if (result.success && result.gig) {
      toast({
        title: 'Gig Cancelled',
        description: 'The gig has been cancelled and the client has been notified.',
      });
      onGigUpdated(result.gig);
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: result.error || 'There was a problem cancelling the gig.',
      });
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently cancel the gig "{gig.title}" and notify the client. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Go Back</AlertDialogCancel>
          <AlertDialogAction onClick={onCancel} disabled={isSending}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Yes, cancel this gig
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
