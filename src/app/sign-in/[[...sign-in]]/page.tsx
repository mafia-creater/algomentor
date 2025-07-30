'use client';

import { SignIn } from "@clerk/nextjs";
import { Code2 } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left Column: Branding and Info */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-slate-900 p-10 text-white">
        <div className="max-w-md text-center">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-white">
              <Code2 className="h-8 w-8 text-slate-900" />
            </div>
          </Link>
          <h1 className="text-4xl font-bold mb-4">
            Welcome Back to AlgoMentor
          </h1>
          <p className="text-slate-300">
            Sign in to continue your journey and access your personalized dashboard.
          </p>
        </div>
      </div>

      {/* Right Column: Sign-In Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
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
