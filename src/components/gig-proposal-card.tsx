
'use client';
import { useEffect, useState } from "react";
import { getGigProposalById, subscribeToGigProposal } from "@/lib/firebase";
import { GigProposal } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Check, Clock, Loader2, PartyPopper } from "lucide-react";
import { acceptGigProposal } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

interface GigProposalCardProps {
    proposalId: string;
    currentUserId: string;
}

export function GigProposalCard({ proposalId, currentUserId }: GigProposalCardProps) {
    const [proposal, setProposal] = useState<GigProposal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAccepting, setIsAccepting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = subscribeToGigProposal(proposalId, (data) => {
            setProposal(data);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [proposalId]);

    const handleAccept = async () => {
        if (!proposal) return;
        setIsAccepting(true);
        const result = await acceptGigProposal(proposal);
        setIsAccepting(false);

        if (result.success) {
            toast({
                title: 'Gig Accepted!',
                description: 'The project is now active in your dashboard.',
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: result.error || 'There was a problem accepting the gig.',
            });
        }
    }

    if (isLoading) {
        return (
            <Card className="max-w-md mx-auto my-4">
                 <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter>
                     <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        )
    }

    if (!proposal) {
        return <p>Could not load gig proposal.</p>
    }

    const isClient = currentUserId === proposal.clientId;
    const isPending = proposal.status === 'Pending';
    const isAccepted = proposal.status === 'Accepted';

    return (
        <Card className="max-w-md mx-auto my-4 border-primary/50">
             <CardHeader>
                <CardTitle>{proposal.title}</CardTitle>
                <CardDescription>Gig Proposal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{proposal.description}</p>
                <div className="text-2xl font-bold text-primary">
                    ${proposal.price}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
                {isAccepted ? (
                     <div className="flex items-center text-green-600 font-medium">
                        <PartyPopper className="h-5 w-5 mr-2"/>
                        <span>Gig Accepted!</span>
                    </div>
                ): (
                    <>
                        <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2"/>
                            <span>Status: {proposal.status}</span>
                        </div>
                        {isClient && isPending && (
                            <Button onClick={handleAccept} disabled={isAccepting}>
                                {isAccepting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4" />}
                                <span className="ml-2">Accept Gig</span>
                            </Button>
                        )}
                    </>
                )}
            </CardFooter>
        </Card>
    )

}
