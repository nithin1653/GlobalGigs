
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Freelancer } from '@/lib/mock-data';
import { ArrowRight, IndianRupee } from 'lucide-react';

interface FreelancerCardProps {
  freelancer: Freelancer;
}

export function FreelancerCard({ freelancer }: FreelancerCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden border-2 border-transparent transition-all duration-300 hover:border-primary hover:shadow-2xl bg-background/60 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar className="h-16 w-16 border-2 border-primary/50">
          <AvatarImage src={freelancer.avatarUrl} alt={freelancer.name} />
          <AvatarFallback>{freelancer.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-bold font-headline">{freelancer.name}</h3>
          <p className="text-sm text-muted-foreground">{freelancer.role}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-4 pb-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {freelancer.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
          {freelancer.skills.length > 3 && <Badge variant="outline">+{freelancer.skills.length - 3}</Badge>}
        </div>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{freelancer.location}</span>
          <span className="font-semibold text-foreground flex items-center gap-1">₹{freelancer.rate}/hr</span>
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-transparent">
        <Button asChild className="w-full" variant="ghost">
          <Link href={`/freelancers/${freelancer.id}`}>
            View Profile <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
