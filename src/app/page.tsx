
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Briefcase, Users, Search, IndianRupee, PenTool } from 'lucide-react';

const clientFeatures = [
  {
    icon: <Search className="h-8 w-8 text-primary" />,
    title: 'Find Top Talent',
    description: 'Access a vast pool of vetted freelancers from various fields across the globe.'
  },
  {
    icon: <Briefcase className="h-8 w-8 text-primary" />,
    title: 'Post a Job Easily',
    description: 'Describe your project, and let interested freelancers come to you.'
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Collaborate Seamlessly',
    description: 'Use our built-in tools to manage projects and communicate effectively.'
  }
];

const freelancerFeatures = [
  {
    icon: <IndianRupee className="h-8 w-8 text-primary" />,
    title: 'Find Fulfilling Work',
    description: 'Browse thousands of jobs that match your skills and passion.'
  },
  {
    icon: <PenTool className="h-8 w-8 text-primary" />,
    title: 'Showcase Your Skills',
    description: 'Create a stunning profile to attract high-quality clients from around the world.'
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: 'Secure & Timely Payments',
    description: 'Get paid securely for your work without any hassle.'
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
              Where Talent Meets Opportunity
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
              GlobalGigs is the premier marketplace to hire expert freelance talent for your projects, or to find work that matters.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/login">Hire a Freelancer</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Become a Freelancer</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* For Clients Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Grow Your Business</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Hire the best freelancers for any job, online.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {clientFeatures.map((feature, index) => (
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
            <div className="text-center mt-12">
                <Button asChild size="lg">
                    <Link href="/login">Get Started as a Client</Link>
                </Button>
            </div>
          </div>
        </section>
        
        {/* For Freelancers Section */}
        <section className="py-16 md:py-24 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Build Your Career</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Find freedom and flexibility in your work life.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {freelancerFeatures.map((feature, index) => (
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
             <div className="text-center mt-12">
                <Button asChild size="lg" variant="secondary">
                    <Link href="/login">Find Work as a Freelancer</Link>
                </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24">
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
        <section className="py-16 md:py-24 bg-primary/5">
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
