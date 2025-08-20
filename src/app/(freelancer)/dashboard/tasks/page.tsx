
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { getGigsForUser } from "@/lib/firebase";
import { Gig } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { EditGigDialog } from "@/components/edit-gig-dialog";
import { CompleteGigDialog } from "@/components/complete-gig-dialog";

export default function TasksPage() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGigs() {
      if (!user) return;
      setIsLoading(true);
      try {
        const userGigs = await getGigsForUser(user.uid);
        setGigs(userGigs);
      } catch (error) {
        console.error("Failed to load gigs", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadGigs();
  }, [user]);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'in progress':
        return 'secondary';
      case 'pending':
      case 'pending update':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleGigUpdated = (updatedGig: Gig) => {
    setGigs(prevGigs => prevGigs.map(g => g.id === updatedGig.id ? updatedGig : g));
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Active Gigs</h1>
        <p className="text-muted-foreground">Here is a list of your current and past gigs.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gigs List</CardTitle>
          <CardDescription>An overview of all your assigned gigs.</CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading ? (
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
             </Table>
           ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gigs.length > 0 ? gigs.map((gig) => (
                  <TableRow key={gig.id}>
                    <TableCell className="font-medium">{gig.title}</TableCell>
                    <TableCell>{gig.client?.name}</TableCell>
                    <TableCell>₹{gig.price}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(gig.status)}>
                        {gig.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{gig.createdAt ? format(new Date(gig.createdAt), 'PP') : '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                       {gig.status.toLowerCase() === 'in progress' && user?.uid === gig.freelancerId && (
                         <>
                           <CompleteGigDialog gig={gig} onGigUpdated={handleGigUpdated} />
                           <EditGigDialog gig={gig} onGigUpdated={handleGigUpdated} />
                         </>
                       )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">No gigs found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
           )}
        </CardContent>
      </Card>
    </div>
  )
}
