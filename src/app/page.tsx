'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Briefcase, Users, Search } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: <Search className="h-10 w-10 text-primary" />,
    title: 'Find Top Talent',
    description: 'Access a vast pool of vetted freelancers from various fields across the globe. Our smart search helps you find the perfect match for your project requirements.'
  },
  {
    icon: <Briefcase className="h-10 w-10 text-primary" />,
    title: 'Post a Job Easily',
    description: 'Describe your project, and let interested freelancers come to you. Our platform makes it simple to manage proposals and hire the right person.'
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Collaborate Seamlessly',
    description: 'Use our built-in messaging and project management tools to communicate effectively and keep your projects on track from start to finish.'
  }
];

const testimonials = [
    {
        quote: "GlobalGigs made it incredibly easy to find a talented developer. The platform is intuitive and the quality of freelancers is top-notch.",
        name: "Alex Johnson",
        role: "Startup Founder",
        avatar: "https://placehold.co/48x48.png"
    },
    {
        quote: "As a freelance designer, GlobalGigs has been a game-changer for me. I've found amazing projects and clients from all over the world.",
        name: "Maria Garcia",
        role: "UX/UI Designer",
        avatar: "https://placehold.co/48x48.png"
    }
];


export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-center bg-background">
           <div
            aria-hidden="true"
            className="absolute inset-0 top-0 z-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"
          />
          <div className="container relative z-10 mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 font-headline">
              Connect with the World's Finest Freelancers
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
              GlobalGigs is the premier marketplace to hire expert freelance talent for your projects, or to find work that matters.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/discover">Find Talent</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/profile/edit">Become a Freelancer</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">Why Choose GlobalGigs?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center bg-card/50">
                  <CardHeader className="items-center">
                    {feature.icon}
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                 <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">How It Works</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-semibold mb-4 text-primary">For Clients</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-4">
                                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold">1. Post a Job</h4>
                                        <p className="text-muted-foreground">Detail your project requirements and post it for our community of freelancers.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold">2. Hire Freelancers</h4>
                                        <p className="text-muted-foreground">Review proposals, interview candidates, and hire the perfect fit for your team.</p>
                                    </div>
                                </li>
                                 <li className="flex items-start gap-4">
                                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold">3. Collaborate & Pay Securely</h4>
                                        <p className="text-muted-foreground">Work together using our tools and make secure payments upon project completion.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                     <div className="relative h-80 rounded-lg overflow-hidden">
                        <Image src="https://placehold.co/600x400.png" layout="fill" objectFit="cover" alt="Collaboration" data-ai-hint="team collaboration" />
                    </div>
                 </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">Loved by People Across the Globe</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="bg-card/50">
                            <CardContent className="pt-6">
                                <p className="italic text-muted-foreground">"{testimonial.quote}"</p>
                            </CardContent>
                            <CardFooter className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline">Ready to Get Started?</h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
              Join thousands of businesses and freelancers on GlobalGigs today.
            </p>
            <Button asChild size="lg">
              <Link href="/login">Sign Up Now</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-background/80 border-t backdrop-blur-sm">
        <div className="container mx-auto py-6 px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GlobalGigs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
