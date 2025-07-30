import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor: string;
  bgColor: string;
}

export default function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  iconColor, 
  bgColor 
}: FeatureCardProps) {
  return (
    <Card className="group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg bg-white">
      <CardHeader className="items-center pb-4">
        <div className={`p-6 ${bgColor} rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          <Icon className={`h-10 w-10 ${iconColor}`} />
        </div>
        <CardTitle className="mt-6 text-xl font-bold text-gray-900 text-center group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-600 leading-relaxed text-lg">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}