
'use client';
import { useState, useEffect } from 'react';
import { getFreelancerById } from '@/lib/firebase';
import type { Freelancer } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, MessageSquare, CheckCircle, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function FreelancerProfilePage({ params }: { params: { id: string } }) {
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const id = params.id;
    async function loadData() {
      if (!id) return;
      try {
        const fetchedFreelancer = await getFreelancerById(id);
        if (!fetchedFreelancer) {
          notFound();
        }
        setFreelancer(fetchedFreelancer);
      } catch (error) {
        console.error("Error loading freelancer data", error);
        notFound();
      }
      finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [params.id]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!freelancer) {
    // This will be caught by notFound() in useEffect, but as a safeguard:
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column (Sticky) */}
        <div className="md:col-span-1 md:sticky top-24 self-start">
          <Card className="overflow-hidden text-center bg-background/60 backdrop-blur-xl">
            <CardContent className="p-6">
              <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary">
                <AvatarImage src={freelancer.avatarUrl} alt={freelancer.name} />
                <AvatarFallback className="text-4xl">{freelancer.name?.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold font-headline">{freelancer.name}</h1>
              <p className="text-muted-foreground mb-4">{freelancer.role}</p>
              
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {freelancer.skills?.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>

              <div className="space-y-2 text-left text-sm text-muted-foreground">
                <div className="flex items-center"><Globe className="w-4 h-4 mr-2 text-primary" /> {freelancer.location}</div>
                <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-primary" /> ₹{freelancer.rate}/hr
                </div>
                <div className={`flex items-center ${freelancer.availability === 'Unavailable' ? 'text-destructive' : 'text-green-500'}`}>
                    <CheckCircle className="w-4 h-4 mr-2" /> {freelancer.availability}
                </div>
              </div>
            </CardContent>
            <div className="p-6 border-t">
              <Button asChild className="w-full">
                <Link href="/discover/messages">
                    <MessageSquare className="mr-2 h-4 w-4" /> Contact {freelancer.name?.split(' ')[0]}
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-8">
            <Card className="bg-background/60 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{freelancer.bio}</p>
                </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle>Work Experience</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative space-y-6 before:absolute before:left-2.5 before:top-4 before:h-[calc(100%-2rem)] before:w-0.5 before:bg-border">
                        {freelancer.experience?.map(exp => (
                            <div key={exp.id} className="relative pl-8">
                                <div className="absolute left-0 top-3 h-2.5 w-2.5 rounded-full bg-primary"></div>
                                <p className="font-semibold">{exp.role} at {exp.company}</p>
                                <p className="text-sm text-muted-foreground">{exp.period}</p>
                                <p className="mt-2 text-sm">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {freelancer.portfolio && freelancer.portfolio.length > 0 && (
                <Card className="bg-background/60 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle>Portfolio</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {freelancer.portfolio.map(item => (
                            <div key={item.id} className="group relative overflow-hidden rounded-lg">
                                <Image 
                                    src={item.imageUrl} 
                                    alt={item.title} 
                                    width={600} 
                                    height={400} 
                                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={item.hint}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <div className="absolute bottom-0 p-4 text-white">
                                    <h4 className="font-bold">{item.title}</h4>
                                    <p className="text-sm opacity-90">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
