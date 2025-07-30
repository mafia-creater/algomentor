'use client';

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, TestTube, Cog, Code, Search, BarChart } from 'lucide-react';

const workflowSteps = [
  {
    icon: BookOpen,
    title: "Understand the Problem",
    description: "Deeply analyze the prompt, identifying constraints, inputs, and expected outputs to build a solid foundation.",
  },
  {
    icon: TestTube,
    title: "Create Test Cases",
    description: "Design a comprehensive suite of test cases, including edge cases, to ensure your logic is robust.",
  },
  {
    icon: Cog,
    title: "Design the Algorithm",
    description: "Outline your step-by-step logic in plain English or pseudocode before writing a single line of code.",
  },
  {
    icon: Code,
    title: "Code the Solution",
    description: "Translate your algorithm into clean, efficient, and readable code in your chosen language.",
  },
  {
    icon: Search,
    title: "Review & Debug",
    description: "Thoroughly test your code against all cases, analyze the output, and debug any issues that arise.",
  },
  {
    icon: BarChart,
    title: "Analyze Complexity",
    description: "Determine the time and space complexity of your solution and consider potential optimizations.",
  }
];

// Animation variants for Framer Motion
const fadeInAnimation = {
  initial: { opacity: 0, y: 50 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * index,
      duration: 0.5,
      ease: "easeInOut",
    },
  }),
};

export default function WorkflowSection() {
  return (
    <section className="w-full bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Proven 6-Phase Workflow
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We guide you through a systematic approach used by top engineers to deconstruct any problem.
          </p>
        </motion.div>
        
        <div className="relative">
          {/* The timeline's vertical line */}
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-100 via-purple-100 to-orange-100" aria-hidden="true"></div>

          <div className="space-y-16">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={index}
                  className="relative flex items-center"
                  variants={fadeInAnimation}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  custom={index}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-4 border-blue-500 rounded-full z-10"></div>
                  
                  <Card className={`w-[calc(50%-2rem)] p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300 ${isEven ? 'mr-auto' : 'ml-auto'}`}>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-blue-600 font-semibold text-sm">STEP {index + 1}</span>
                        <h3 className="text-xl font-bold text-gray-900 mt-1">{step.title}</h3>
                        <p className="text-gray-600 mt-2">{step.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}