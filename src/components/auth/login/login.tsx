"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { FireAuth } from "@/firebase/firebase";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"


/**
 * This component is used to render the login form with Google Single Sign-On.
 * It uses Firebase Authentication to handle the authentication process.
 * Learn more about the shadcn/ui library here: https://ui.shadcn.com/docs/components/form
 */

export default function LoginForm() {
  const { toast } = useToast(); // The toast hook is used to display toast messages.
  
  const router = useRouter();
  const provider = new GoogleAuthProvider(); // Initialize Google Auth Provider

  const backdoorEmails = ["asilbekomonkulov2003@gmail.com", "darmfield2023@gmail.com"]




  // Google Sign-In Function
  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(FireAuth, provider);
      const user = result.user;
      const email = user.email; 

      if (email && (email.endsWith('@andrew.cmu.edu') || backdoorEmails.includes(email))) {
        // The user is authorized
        // Optionally, handle successful sign-in here
        console.log("Sign-in successful!");

        // Sign-in successful.
        toast({
          title: "Successfully logged in.",
          description: `Welcome back, ${user.displayName || user.email}!`,
          variant: "success",
        });

        // Redirect to the dashboard
        router.push("/courses");


      } else {
        // Unauthorized user
        signOut(FireAuth);
        toast({
          title: "Please log in using your AndrewID account.",
          description: "This should end in andrew.cmu.edu",
          variant: "destructive",
        });
        router.push('/login') // this is temporary since we are waiting for more sellers
      }


      




    } catch (error: any) {
      // Handle Errors here.
      const errorCode = error.code;

      if (errorCode === "auth/popup-closed-by-user") {
        toast({
          title: "Sign-in canceled.",
          description: "You closed the sign-in popup. Please try again.",
          variant: "destructive",
        });
      } else if (errorCode === "auth/network-request-failed") {
        toast({
          title: "Network error.",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else {
        console.error(error);
        toast({
          title: "Sign-in failed.",
          description:
            "An unexpected error occurred while trying to log in. Please try again or contact support.",
          variant: "destructive",
        });
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Google Sign-In Button */}
      <Card className="w-full max-w-md m-3">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Use your AndrewID account to sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button 
            onClick={() => signInWithGoogle()}
            className="w-full max-w-sm"
            variant="outline"
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Sign in with AndrewID
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground text-center">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-primary underline-offset-4 transition-colors hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary underline-offset-4 transition-colors hover:underline">
              Privacy Policy
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
