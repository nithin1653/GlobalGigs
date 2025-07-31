
'use client';
import { useState, useEffect, use } from 'react';
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
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function FreelancerProfilePage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { id } = params;

  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const fetchedFreelancer = await getFreelancerById(id);
        if (!fetchedFreelancer) {
          notFound();
        } else {
          // Ensure uid is set for existing freelancers
          setFreelancer({ ...fetchedFreelancer, uid: id });
        }
      } catch (error) {
        console.error("Error loading freelancer data", error);
        notFound();
      }
      finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!freelancer) {
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
                <Link href={`/discover/messages?freelancerId=${freelancer.uid}`}>
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
                    <CardContent className="space-y-8">
                        {freelancer.portfolio.map(item => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                <div className="md:col-span-1">
                                    <Carousel className="w-full max-w-xs mx-auto">
                                      <CarouselContent>
                                        {(item.imageUrls || []).map((url, index) => (
                                          <CarouselItem key={index}>
                                            <div className="aspect-video rounded-lg overflow-hidden border">
                                              <Image
                                                  src={url}
                                                  alt={`${item.title} - Image ${index + 1}`}
                                                  width={600}
                                                  height={400}
                                                  className="object-cover w-full h-full"
                                                  data-ai-hint={item.hint}
                                              />
                                            </div>
                                          </CarouselItem>
                                        ))}
                                      </CarouselContent>
                                      <CarouselPrevious />
                                      <CarouselNext />
                                    </Carousel>
                                </div>
                                <div className="md:col-span-2">
                                     <h4 className="font-bold text-lg">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1 mb-3">{item.description}</p>
                                    {item.technologiesUsed && item.technologiesUsed.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {item.technologiesUsed.map(tech => (
                                                <Badge key={tech} variant="secondary">{tech}</Badge>
                                            ))}
                                        </div>
                                    )}
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
