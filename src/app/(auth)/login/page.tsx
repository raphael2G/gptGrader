import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import LoginForm from "@/components/auth/login/login";
import EarthImage from '@/assets/earth.jpg'

/**
 * This page is used to render the login page.
 * It uses the LoginForm component to render the login form.
 * It uses the next/head library to render the page metadata.
 * @todo Make the page responsive.
 * 
 */

/**
 * Represents the metadata for the login page.
 * This is used to display the page title and description in the browser tab.
 * @see https://nextjs.org/docs/api-reference/next/head
 * This is only for server-side rendering.
 */

export const metadata: Metadata = {
    title: "Login",
    description: "Authentication forms built using the components.",
};


// The component itself.
export default function AuthenticationPage() {
    return (
        <>


            {/* This is the main container for the page. */}
            <div className="bg-black container relative h-screen flex-col items-center justify-center grid max-w-none grid-cols-1 lg:grid-cols-2  md:px-0">

                


                {/* This is responsible for the login form appearing on the right side of the element */}
                <div className="lg:p-8 w-full max-w-md mx-auto">
                    
                    {/* This is responsible for the login form */}
                    <LoginForm />

                </div>

                {/* This is responsible for image on the left side of the element */}
                <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">

                    {/* This is responsible for the image appearing on the side */}
                    <div className="inset-0 bg-zinc-900" >
                        <Image
                            src={EarthImage}
                            alt="Authentication"
                            objectFit="cover"
                            fill={true}
                            className="object-cover object-[40%] w-full h-full"
                        />
                    </div>



                    {/* This is responsible for the text appearing on the side
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">
                                &ldquo;This library has saved me countless hours of work and
                                helped me deliver stunning designs to my clients faster than
                                ever before.&rdquo;
                            </p>
                            <footer className="text-sm">- Kanye West</footer>
                        </blockquote>
                    </div> */}
                </div>


            </div>
        </>
    );
}