
import React from 'react';
import { Headphones, Mic, Radio, Waves } from 'lucide-react';

const PodcastVisuals = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Microphone */}
      <div className="absolute top-20 right-20 animate-float">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl shadow-teal-400/30 transform rotate-12 hover:rotate-0 transition-transform duration-700">
            <Mic className="w-8 h-8 text-black" />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-teal-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        </div>
      </div>

      {/* Floating Headphones */}
      <div className="absolute bottom-32 left-16 animate-float" style={{ animationDelay: '1s' }}>
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30 transform -rotate-12 hover:rotate-0 transition-transform duration-700">
            <Headphones className="w-10 h-10 text-black" />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl animate-pulse"></div>
        </div>
      </div>

      {/* Floating Radio Wave */}
      <div className="absolute top-1/2 right-1/4 animate-float" style={{ animationDelay: '2s' }}>
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center shadow-2xl shadow-green-400/30 transform rotate-45 hover:rotate-90 transition-transform duration-700">
            <Radio className="w-7 h-7 text-black" />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-green-400/20 to-teal-500/20 rounded-xl blur-xl animate-pulse"></div>
        </div>
      </div>

      {/* Animated Waveform */}
      <div className="absolute bottom-20 right-1/3 animate-bounce" style={{ animationDelay: '0.5s' }}>
        <div className="relative">
          <div className="w-18 h-18 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-2xl shadow-blue-400/30 transform -rotate-6 hover:rotate-6 transition-transform duration-700">
            <Waves className="w-8 h-8 text-black" />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-lg blur-xl animate-pulse"></div>
        </div>
      </div>

      {/* 3D Waveform Visualization */}
      <div className="absolute top-1/3 left-1/4 opacity-30">
        <div className="flex items-end space-x-1">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-t from-teal-400 to-blue-500 rounded-t-full animate-pulse"
              style={{
                width: '4px',
                height: `${Math.random() * 40 + 20}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${Math.random() * 2 + 1}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Orbiting Particles */}
      <div className="absolute top-1/4 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-full h-full animate-spin" style={{ animationDuration: '20s' }}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-teal-400 rounded-full shadow-lg shadow-teal-400/50"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 60}deg) translateX(100px) translateY(-50%)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PodcastVisuals;
