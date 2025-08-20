
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { CancelGigDialog } from "@/components/cancel-gig-dialog";
import { IndianRupee } from "lucide-react";

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
      case 'cancelled':
        return 'destructive';
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

  const renderGigActions = (gig: Gig) => {
     if (gig.status.toLowerCase() !== 'in progress' || user?.uid !== gig.freelancerId) return null;
     return (
         <>
           <CompleteGigDialog gig={gig} onGigUpdated={handleGigUpdated} />
           <EditGigDialog gig={gig} onGigUpdated={handleGigUpdated} />
           <CancelGigDialog gig={gig} onGigUpdated={handleGigUpdated} />
         </>
     )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Active Gigs</h1>
        <p className="text-muted-foreground">Here is a list of your current and past gigs.</p>
      </div>

       {isLoading ? (
          <div className="space-y-4">
            {Array.from({length: 3}).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                   <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : gigs.length === 0 ? (
             <div className="text-center py-16 text-muted-foreground">
                <p>No gigs found.</p>
              </div>
        ) : (
          <>
            {/* Mobile View: Cards */}
            <div className="grid gap-4 md:hidden">
              {gigs.map((gig) => (
                 <Card key={gig.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                        <CardTitle className="text-base">{gig.title}</CardTitle>
                        <CardDescription>{gig.client?.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={getStatusVariant(gig.status)}>{gig.status}</Badge>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-semibold flex items-center"><IndianRupee className="h-3.5 w-3.5 mr-1" />{gig.price}</span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Created</span>
                            <span>{gig.createdAt ? format(new Date(gig.createdAt), 'PP') : '-'}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 p-2 flex justify-end space-x-2">
                        {renderGigActions(gig)}
                    </CardFooter>
                 </Card>
              ))}
            </div>

            {/* Desktop View: Table */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
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
                    {gigs.map((gig) => (
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
                          {renderGigActions(gig)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
       )}
    </div>
  )
}
