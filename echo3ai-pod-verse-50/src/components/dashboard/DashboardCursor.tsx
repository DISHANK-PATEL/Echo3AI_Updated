
import React, { useEffect, useState } from 'react';

const DashboardCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsMoving(true);
      
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsMoving(false), 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-100 ease-out"
      style={{
        left: position.x - 12,
        top: position.y - 12,
        transform: `scale(${isMoving ? 1.2 : 1})`,
      }}
    >
      {/* Microphone Icon */}
      <div className={`relative w-6 h-6 transition-all duration-300 ${
        isMoving ? 'rotate-12' : 'rotate-0'
      }`}>
        {/* Mic Body */}
        <div className="w-3 h-4 bg-gradient-to-b from-teal-400 to-blue-500 rounded-t-full mx-auto"></div>
        {/* Mic Stand */}
        <div className="w-4 h-1 bg-gray-400 rounded-full mx-auto mt-0.5"></div>
        <div className="w-1 h-2 bg-gray-400 mx-auto"></div>
        
        {/* Pulsing Glow */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isMoving 
            ? 'bg-teal-400/30 shadow-lg shadow-teal-400/50 animate-pulse' 
            : 'bg-teal-400/10 shadow-sm shadow-teal-400/20'
        }`}></div>
        
        {/* Audio Visualizer Rings */}
        {isMoving && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-teal-400/30 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border border-blue-400/20 animate-pulse delay-300"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardCursor;
