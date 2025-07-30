import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24 px-6">
      {/* Background decoration */}
      <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40`}></div>
      
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
          ✨ Transform your problem-solving skills
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
          Master the Art of
          <span className="block">Problem Solving</span>
        </h1>
        
        <p className="mt-6 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Go beyond rote memorization. AlgoMentor guides you through a proven 
          <span className="font-semibold text-blue-600"> 6-phase workflow</span> with 
          AI-powered feedback at every step.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <SignedOut>
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/sign-up">
                Get Started for Free
                <span className="ml-2">→</span>
              </Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/dashboard">
                Go to Dashboard
                <span className="ml-2">→</span>
              </Link>
            </Button>
          </SignedIn>
          <Button 
            variant="outline" 
            size="lg" 
            asChild
            className="border-2 border-gray-300 hover:border-blue-500 px-8 py-4 text-lg font-medium transition-all duration-200"
          >
            <Link href="#features">
              Learn More
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}