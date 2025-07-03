import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-black">
      {/* 3D Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse transform-gpu"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000 transform-gpu"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-violet-500/10 rounded-full blur-2xl animate-pulse delay-500 transform-gpu -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      {/* Floating 3D Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400/60 rounded-full animate-bounce delay-300 transform-gpu"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-teal-400/60 rounded-full animate-bounce delay-700 transform-gpu"></div>
        <div className="absolute bottom-32 left-1/3 w-5 h-5 bg-purple-400/60 rounded-full animate-bounce delay-1000 transform-gpu"></div>
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-cyan-400/60 rounded-full animate-bounce delay-200 transform-gpu"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-gray-900/80 backdrop-blur-sm rounded-full text-sm text-gray-300 mb-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 transform hover:scale-105">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Now Live on Internet Computer Protocol
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in delay-200 leading-tight">
          The Future of
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 text-transparent bg-clip-text block animate-pulse">
            Decentralized Podcasts
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in delay-400 leading-relaxed">
          AI-enhanced transcripts, chapter navigation, moderation, and tipping—without NFTs. 
          Built on IPFS and powered by cutting-edge AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in delay-600">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 transform-gpu hover:-translate-y-1"
          >
            Connect Wallet
          </Button>
          <Button 
            variant="ghost" 
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="text-white hover:text-blue-300 hover:bg-gray-800/50 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 hover:scale-105 transform-gpu"
          >
            Learn How It Works
            <ArrowDown className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center animate-fade-in delay-800">
          <div className="transform hover:scale-110 transition-all duration-300 cursor-pointer">
            <div className="text-2xl font-bold text-white">10K+</div>
            <div className="text-gray-400">Episodes Processed</div>
          </div>
          <div className="transform hover:scale-110 transition-all duration-300 cursor-pointer">
            <div className="text-2xl font-bold text-white">99.9%</div>
            <div className="text-gray-400">Uptime</div>
          </div>
          <div className="transform hover:scale-110 transition-all duration-300 cursor-pointer">
            <div className="text-2xl font-bold text-white">5sec</div>
            <div className="text-gray-400">Avg Load Time</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
