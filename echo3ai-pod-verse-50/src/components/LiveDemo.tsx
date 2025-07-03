
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CirclePlay, MessageSquare } from 'lucide-react';

const LiveDemo = () => {
  return (
    <section className="py-20 px-4 relative bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Experience Echo3AI
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Preview the intuitive interface that makes decentralized podcasting simple
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 overflow-hidden transform hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-blue-500/10">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 border-b border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-200"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-400"></div>
                    <span className="text-gray-300 text-sm ml-4">Echo3AI Dashboard</span>
                  </div>
                </div>
                
                <div className="p-6 space-y-4 bg-gray-900/30">
                  <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <CirclePlay className="h-8 w-8 text-blue-400 hover:text-blue-300 transition-colors" />
                      <div>
                        <div className="text-white font-medium">Tech Talk #42</div>
                        <div className="text-gray-400 text-sm">The Future of AI</div>
                      </div>
                    </div>
                    <div className="text-green-400 font-medium animate-pulse">Live</div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-lg hover:bg-gray-700/50 transition-all duration-300">
                    <div className="text-gray-200 text-sm mb-2">Chapter 3: Machine Learning Basics</div>
                    <div className="bg-gray-700 h-2 rounded-full mb-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-1/3 animate-pulse"></div>
                    </div>
                    <div className="text-gray-400 text-xs">12:34 / 45:22</div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg hover:bg-gray-700/50 transition-all duration-300">
                    <div className="flex items-center space-x-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-teal-400" />
                      <span className="text-gray-200 text-sm">Transcript</span>
                    </div>
                    <div className="text-gray-300 text-sm leading-relaxed">
                      "So when we talk about neural networks, we're essentially creating a system that can learn patterns..."
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Interactive Features
              </h3>
              <ul className="space-y-4">
                {[
                  "Click a chapter to jump in the audio instantly",
                  "Real-time transcript with speaker identification", 
                  "Smart search across all episodes",
                  "One-click tipping with crypto wallets",
                  "Multilingual subtitle generation"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer group">
                    <div className="w-2 h-2 bg-teal-400 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:scale-105 transition-all duration-300 transform-gpu hover:-translate-y-1"
            >
              Try Live Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDemo;
