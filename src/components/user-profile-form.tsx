
'use client'

import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, UploadCloud, User } from 'lucide-react';
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { uploadToCloudinary, handleUpdateUser } from '@/app/actions';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const userProfileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  avatarUrl: z.string().url().optional(),
});

type UserProfileValues = z.infer<typeof userProfileSchema>;


const ProfileAvatar = ({ control }: { control: any}) => {
    const avatarUrl = useWatch({
        control,
        name: `avatarUrl`,
    });

    const name = useWatch({
        control,
        name: `name`,
    });

    return (
        <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary">
            <AvatarImage src={avatarUrl} alt={name || "User"}/>
            <AvatarFallback className="text-4xl">{name ? name.slice(0, 2) : <User />}</AvatarFallback>
        </Avatar>
    )
}


export default function UserProfileForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const { user, userProfile, loading } = useAuth();

  const form = useForm<UserProfileValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: '',
      avatarUrl: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
        form.reset({
            name: userProfile.name || user?.displayName || '',
            avatarUrl: userProfile.avatarUrl || user?.photoURL || '',
        })
    }
  }, [userProfile, user, form])

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    
    const result = await uploadToCloudinary(formData);

    setIsUploading(false);

    if (result.success && result.url) {
      form.setValue('avatarUrl', result.url, { shouldValidate: true });
      toast({
        title: 'Image Uploaded!',
        description: 'Your new profile photo is ready to be saved.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: result.error || 'There was a problem uploading your image.',
      });
    }
  };

  async function onSubmit(data: UserProfileValues) {
    if (!user) return;
    setIsSaving(true);
    
    const result = await handleUpdateUser(user.uid, data);
    
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
  
  if (loading) {
      return (
          <div>
              <Card>
                  <CardHeader>
                       <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <div className="flex justify-end">
                          <Skeleton className="h-10 w-24" />
                      </div>
                  </CardContent>
              </Card>
          </div>
      )
  }

  return (
     <div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader className="items-center">
                        <ProfileAvatar control={form.control} />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            >
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UploadCloud className="mr-2"/>}
                            Upload New Photo
                        </Button>
                        <Input 
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, image/gif"
                         />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSaving || isUploading}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    </div>
  );
}
