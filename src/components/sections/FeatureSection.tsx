import { BrainCircuit, Lightbulb, Puzzle } from "lucide-react";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: Puzzle,
    title: "Structured Workflow",
    description: "Our proven 6-phase process teaches you to Understand, Plan, Code, and Analyze solutions like a seasoned developer.",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    icon: BrainCircuit,
    title: "AI-Powered Guidance",
    description: "Get instant, intelligent feedback on your problem understanding, test cases, and algorithms with our advanced AI mentor.",
    iconColor: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    icon: Lightbulb,
    title: "Build Real Intuition",
    description: "Focus on building a deep, logical foundation for any problem type, not just memorizing specific solutions.",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50"
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="w-full bg-gray-50 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose AlgoMentor?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience a revolutionary approach to algorithmic problem solving
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              iconColor={feature.iconColor}
              bgColor={feature.bgColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}