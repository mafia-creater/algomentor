'use client';

import { SignUp } from "@clerk/nextjs";
import { Code2 } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen w-full lg:grid  lg:grid-cols-2">
      {/* Left Column: Branding and Info */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-slate-900 p-10 text-white">
        <div className="max-w-md text-center">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-white">
              <Code2 className="h-8 w-8 text-slate-900" />
            </div>
          </Link>
          <h1 className="text-4xl font-bold mb-4">
            Welcome to AlgoMentor
          </h1>
          <p className="text-slate-300">
            The best place to build your problem-solving intuition. Join our community and start your journey to mastery today.
          </p>
        </div>
      </div>

      {/* Right Column: Sign-Up Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            appearance={{
              elements: {
                // We can keep some of the custom ShadCN-like styles for the form
                formButtonPrimary: "bg-slate-900 hover:bg-slate-800 text-sm normal-case",
                socialButtonsBlockButton: "border-border",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
