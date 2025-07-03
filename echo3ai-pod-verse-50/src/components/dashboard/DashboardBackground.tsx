
import React, { useEffect, useState } from 'react';

const DashboardBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      
      {/* Animated Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-teal-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Interactive Gradient Orbs */}
      <div
        className="absolute w-96 h-96 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-full blur-3xl transition-transform duration-1000 ease-out"
        style={{
          left: `${mousePosition.x - 10}%`,
          top: `${mousePosition.y - 10}%`,
          transform: `translate(-50%, -50%) scale(${1 + mousePosition.x / 500})`,
        }}
      />
      
      <div
        className="absolute w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl transition-transform duration-1500 ease-out"
        style={{
          right: `${100 - mousePosition.x - 10}%`,
          bottom: `${100 - mousePosition.y - 10}%`,
          transform: `translate(50%, 50%) scale(${1 + mousePosition.y / 500})`,
        }}
      />

      {/* Waveform Animation */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 100"
          className="animate-pulse"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path
            d="M0,50 Q100,20 200,50 T400,50"
            stroke="url(#waveGradient)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
          />
          <path
            d="M0,60 Q100,30 200,60 T400,60"
            stroke="url(#waveGradient)"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
            className="animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />
        </svg>
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(20, 184, 166, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 184, 166, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
};

export default DashboardBackground;
