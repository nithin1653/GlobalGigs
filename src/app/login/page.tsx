
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Briefcase, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  User,
} from 'firebase/auth';
import { auth, createUserProfile, getUserProfile } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import PasswordStrength from "@/components/password-strength";

type UserRole = 'client' | 'freelancer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const passwordStrength = useMemo(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  }, [password]);

  const handleRedirect = async (user: User) => {
    const userProfile = await getUserProfile(user.uid);
    if (userProfile?.role === 'freelancer') {
      router.push('/dashboard');
    } else {
      router.push('/discover');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSigningUp) {
      if (password !== confirmPassword) {
        toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
        setIsLoading(false);
        return;
      }
      if (passwordStrength < 4) {
          toast({ variant: 'destructive', title: 'Error', description: 'Password is not strong enough.' });
          setIsLoading(false);
          return;
      }
    }

    try {
      if (isSigningUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(userCredential.user.uid, {
            email: userCredential.user.email!,
            role: role,
        });
        toast({ title: 'Success', description: 'Account created successfully! Redirecting...' });
        await handleRedirect(userCredential.user);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Success', description: 'Logged in successfully! Redirecting...' });
        await handleRedirect(userCredential.user);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, new GoogleAuthProvider());
      const userProfile = await getUserProfile(userCredential.user.uid);
      
      // Only create a profile if one doesn't exist
      if (!userProfile) {
        await createUserProfile(userCredential.user.uid, {
            email: userCredential.user.email!,
            role: 'client', // Default role for Google sign-ins
        });
      }
      
      toast({ title: 'Success', description: 'Logged in successfully! Redirecting...' });
      await handleRedirect(userCredential.user);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

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
            {isSigningUp && (
              <div className="space-y-2">
                <Label>I am a...</Label>
                <RadioGroup defaultValue="client" onValueChange={(value: UserRole) => setRole(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="client" id="r1" />
                    <Label htmlFor="r1">Client, hiring for a project</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="freelancer" id="r2" />
                    <Label htmlFor="r2">Freelancer, looking for work</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
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
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
             {isSigningUp && (
               <>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                        <Input id="confirm-password" type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground">
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                <PasswordStrength password={password} strength={passwordStrength} />
               </>
             )}
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
