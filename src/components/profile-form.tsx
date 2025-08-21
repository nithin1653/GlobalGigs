
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { handleEnhanceSkills, handleUpdateProfile } from '@/app/actions';
import { useState, useEffect } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getFreelancerById } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { ExperienceForm } from '@/components/experience-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  role: z.string().min(2, { message: 'Role is required.' }),
  rate: z.coerce.number().min(1, { message: 'Rate must be a positive number.' }),
  location: z.string().min(2, { message: 'Location is required.' }),
  availability: z.enum(['Full-time', 'Part-time', 'Unavailable']),
  bio: z.string().max(500, { message: 'Bio cannot exceed 500 characters.' }),
  existingSkills: z.string().min(1, { message: 'Please list at least one skill.'}),
  pastExperiences: z.string().min(10, { message: 'Please describe your past experiences.'}),
  experience: z.array(z.object({
    role: z.string().min(1, {message: 'Role is required'}),
    company: z.string().min(1, {message: 'Company is required'}),
    period: z.string().min(1, {message: 'Period is required'}),
    description: z.string().optional(),
  })),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


export default function ProfileForm() {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {},
    mode: 'onChange',
  });
  
  useEffect(() => {
    async function loadFreelancerData() {
      if (!user) {
        setIsLoading(false);
        return;
      };

      try {
        const freelancerData = await getFreelancerById(user.uid);
        if (freelancerData) {
          const pastExperiences = freelancerData.experience?.map(e => `${e.role} at ${e.company} (${e.period}): ${e.description}`).join('\n\n') || '';
          
          form.reset({
            name: freelancerData.name,
            role: freelancerData.role,
            rate: freelancerData.rate,
            location: freelancerData.location,
            availability: freelancerData.availability,
            bio: freelancerData.bio,
            existingSkills: freelancerData.skills.join(', '),
            pastExperiences: pastExperiences,
            experience: freelancerData.experience?.map(e => ({role: e.role, company: e.company, period: e.period, description: e.description})) || [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch freelancer data", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load your profile data."});
      } finally {
        setIsLoading(false);
      }
    }
    loadFreelancerData();
  }, [user, form, toast]);


  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    setIsSaving(true);
    
    const profileDataToSave = {
        name: data.name,
        role: data.role,
        rate: data.rate,
        location: data.location,
        availability: data.availability,
        bio: data.bio,
        skills: data.existingSkills.split(',').map(s => s.trim()).filter(Boolean),
        experience: data.experience.map(exp => ({ ...exp, id: 0, description: exp.description || '' })), // id is a placeholder
    };

    const result = await handleUpdateProfile(user.uid, profileDataToSave);
    setIsSaving(false);

    if (result.success) {
        toast({
            title: 'Profile Updated!',
            description: 'Your changes have been saved successfully.',
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: result.error || 'There was a problem saving your profile.',
        });
    }
  }

  async function onEnhanceSkills() {
    setIsSuggesting(true);
    const result = await handleEnhanceSkills({
        pastExperiences: form.getValues('pastExperiences'),
        existingSkills: form.getValues('existingSkills'),
    });
    setIsSuggesting(false);

    if (result.success && result.data) {
        const currentSkills = form.getValues('existingSkills').split(',').map(s => s.trim()).filter(Boolean);
        const suggested = result.data.suggestedSkills.split(',').map(s => s.trim()).filter(Boolean);
        const newSkills = [...new Set([...currentSkills, ...suggested])];
        
        form.setValue('existingSkills', newSkills.join(', '), { shouldValidate: true });
        toast({
            title: 'Skills Enhanced!',
            description: 'We\'ve added some new skill suggestions to your profile.',
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: result.error || 'There was a problem with the AI suggestion.',
        });
    }
  }
  
  if (isLoading) {
      return (
          <div className="space-y-8">
              <Card className="bg-background/60 backdrop-blur-xl">
                  <CardHeader>
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-24 w-full" />
                  </CardContent>
              </Card>
              <Card className="bg-background/60 backdrop-blur-xl">
                   <CardHeader>
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-72" />
                    </CardHeader>
                   <CardContent className="space-y-4">
                       <Skeleton className="h-24 w-full" />
                       <Skeleton className="h-10 w-full" />
                       <Skeleton className="h-10 w-48" />
                   </CardContent>
              </Card>
          </div>
      );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="bg-background/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem><FormLabel>Professional Role</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="rate" render={({ field }) => (
                <FormItem><FormLabel>Hourly Rate (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
             <FormField control={form.control} name="availability" render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your availability" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            <FormField control={form.control} name="bio" render={({ field }) => (
              <FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
        </Card>
        
        <Card className="bg-background/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Skills & Experience Summary</CardTitle>
            <CardDescription>Showcase your expertise. Use the AI assistant to find new skills!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="pastExperiences" render={({ field }) => (
                <FormItem><FormLabel>Describe Your Past Experiences</FormLabel><FormControl><Textarea rows={6} {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="existingSkills" render={({ field }) => (
                <FormItem><FormLabel>Your Skills (comma-separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <Button type="button" onClick={onEnhanceSkills} disabled={isSuggesting}>
              {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Suggest Skills with AI
            </Button>
          </CardContent>
        </Card>
        
        <ExperienceForm form={form} />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
