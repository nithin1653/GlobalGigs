'use client';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSigningUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: 'Success', description: 'Account created successfully! Redirecting...' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Success', description: 'Logged in successfully! Redirecting...' });
      }
      router.push('/discover');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast({ title: 'Success', description: 'Logged in successfully! Redirecting...' });
      router.push('/discover');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleAuth}>
          <CardHeader className="space-y-1 text-center">
              <div className="inline-block mx-auto">
                  <Briefcase className="h-8 w-8 text-primary" />
              </div>
            <CardTitle className="text-2xl font-bold">{isSigningUp ? 'Create an Account' : 'Welcome Back'}</CardTitle>
            <CardDescription>{isSigningUp ? 'Enter your details to create a new account' : 'Enter your email below to login to your account'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="priya@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                {!isSigningUp && <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>}
              </div>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSigningUp ? 'Sign Up' : 'Log In'}
            </Button>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading} type="button">
               {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.3 64.5C308.6 106.5 279.2 96 248 96c-88.8 0-160 71.9-160 160s71.2 160 160 160c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>}
              {isSigningUp ? 'Sign up with Google' : 'Login with Google'}
            </Button>
          </CardContent>
          <CardFooter className="text-center text-sm">
            <p className="w-full">
              {isSigningUp ? 'Already have an account?' : "Don't have an account?"}{" "}
              <button type="button" className="underline" onClick={() => setIsSigningUp(!isSigningUp)}>
                  {isSigningUp ? 'Log in' : 'Sign up'}
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
