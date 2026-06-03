import React from 'react';

interface ResultCardProps {
  number: number;
  title: string;
  description: string;
  icon: string;
}

export default function ResultCard({ number, title, description, icon }: ResultCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:transform hover:scale-105">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {number}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <p className="text-purple-100 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
