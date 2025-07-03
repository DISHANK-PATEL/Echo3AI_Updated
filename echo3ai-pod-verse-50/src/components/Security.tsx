
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CircleCheck } from 'lucide-react';

const Security = () => {
  const badges = [
    "Audit-Ready",
    "Open Source", 
    "Gas-Efficient"
  ];

  return (
    <section className="py-20 px-4 relative bg-black">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
          Security & Transparency
        </h2>
        
        <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 mb-12 hover:bg-gray-800/50 transition-all duration-500 hover:scale-105 transform-gpu">
          <CardContent className="p-8">
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              All logic lives in Rust canisters on ICP—auditable, tamper-proof, and permissionless. 
              Every transaction is transparent, every algorithm is verifiable, and your data remains 
              under your complete control.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              {badges.map((badge, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full border border-green-500/30 hover:bg-green-500/30 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <CircleCheck className="h-4 w-4" />
                  <span className="font-medium">{badge}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2 group hover:scale-110 transition-all duration-300 cursor-pointer">
            <div className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">100%</div>
            <div className="text-gray-400 group-hover:text-gray-300 transition-colors">On-Chain Logic</div>
          </div>
          <div className="space-y-2 group hover:scale-110 transition-all duration-300 cursor-pointer">
            <div className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">0</div>
            <div className="text-gray-400 group-hover:text-gray-300 transition-colors">Single Points of Failure</div>
          </div>
          <div className="space-y-2 group hover:scale-110 transition-all duration-300 cursor-pointer">
            <div className="text-3xl font-bold text-white group-hover:text-teal-400 transition-colors">24/7</div>
            <div className="text-gray-400 group-hover:text-gray-300 transition-colors">Decentralized Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
