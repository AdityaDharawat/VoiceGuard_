import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="group relative bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-600 transition-colors duration-300 dark:bg-blue-900/50">
          <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;