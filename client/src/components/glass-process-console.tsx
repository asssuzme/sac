import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Bot, TrendingUp } from 'lucide-react';

// Glass Process Console - COMPLETELY AUTONOMOUS COMPONENT
// Runs like a video, no user interaction possible
const GlassProcessConsole = React.memo(() => {
  const [activeModule, setActiveModule] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Clear any existing interval to prevent duplicates
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start animation with faster speed - completely autonomous
    const cycle = () => {
      setActiveModule((prev) => (prev + 1) % 3);
    };
    
    intervalRef.current = setInterval(cycle, 1500); // 1.5 seconds per module
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Empty deps ensures this only runs once
  
  const modules = [
    {
      title: "Upload Resume",
      description: "One click upload",
      icon: Upload,
    },
    {
      title: "AI Applies",
      description: "Automated submissions",
      icon: Bot,
    },
    {
      title: "Get Hired",
      description: "Track your success",
      icon: TrendingUp,
    }
  ];

  return (
    <div 
      className="py-16 md:py-32 px-4 sm:px-6 lg:px-8 relative bg-black"
      style={{ 
        pointerEvents: 'none', 
        userSelect: 'none', 
        WebkitUserSelect: 'none',
        isolation: 'isolate', // Creates a new stacking context
        willChange: 'auto', // Tell browser this won't change from interactions
      }}
    >
      {/* Isolation wrapper - acts like an iframe/video embed */}
      <div 
        className="max-w-5xl mx-auto relative"
        style={{ 
          pointerEvents: 'none',
          contain: 'layout style paint', // CSS containment - isolates rendering
        }}
      >
        
        {/* Background Glow - Premium lighting effect */}
        <div 
          className="absolute inset-0 -inset-x-20"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 60%)',
            filter: 'blur(60px)',
            transform: 'translateY(20px)',
            pointerEvents: 'none',
          }}
        />
        
        {/* The Glass Process Console - Main Object */}
        <div className="relative" style={{ pointerEvents: 'none' }}>
          {/* Console Container */}
          <div 
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                0 20px 40px -20px rgba(0, 0, 0, 0.5),
                0 10px 20px -10px rgba(59, 130, 246, 0.2)
              `,
            }}
          >
            {/* Inner Console Surface */}
            <div className="relative flex flex-col md:flex-row items-stretch h-auto md:h-40">
              
              {/* Animated Spotlight - Horizontal on desktop, hidden on mobile */}
              <motion.div
                className="hidden md:block absolute inset-y-0 w-1/3"
                animate={{
                  x: activeModule === 0 ? '0%' : activeModule === 1 ? '100%' : '200%',
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.43, 0.13, 0.23, 0.96], // Apple-style easing
                }}
                style={{
                  background: 'linear-gradient(90deg, rgba(59, 130, 246, 0) 0%, rgba(59, 130, 246, 0.3) 50%, rgba(59, 130, 246, 0) 100%)',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              >
                {/* Spotlight inner glow - enhanced visibility */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%)',
                    filter: 'blur(30px)',
                    pointerEvents: 'none',
                  }}
                />
              </motion.div>
              
              {/* Three Process Modules */}
              {modules.map((module, index) => (
                <div
                  key={index}
                  className={`flex-1 relative flex flex-col items-center justify-center px-4 md:px-8 py-6 md:py-0 ${
                    index < 2 ? 'md:border-r border-b md:border-b-0 border-white/5' : ''
                  }`}
                  style={{
                    pointerEvents: 'none',
                  }}
                >
                  {/* Module Content */}
                  <motion.div 
                    className="text-center relative z-10"
                    animate={{
                      opacity: activeModule === index ? 1 : 0.2,
                      scale: activeModule === index ? 1.05 : 0.9,
                      y: activeModule === index ? -5 : 0,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: [0.43, 0.13, 0.23, 0.96],
                    }}
                    style={{ pointerEvents: 'none' }}
                  >
                    {/* Icon */}
                    <div className="mb-2 md:mb-3 inline-flex" style={{ pointerEvents: 'none' }}>
                      <module.icon 
                        className="w-6 h-6 md:w-8 md:h-8"
                        style={{
                          color: activeModule === index ? '#60a5fa' : 'rgba(255, 255, 255, 0.2)',
                          filter: activeModule === index ? 'drop-shadow(0 0 20px rgba(96, 165, 250, 0.8))' : 'none',
                          transform: activeModule === index ? 'scale(1.2)' : 'scale(1)',
                          pointerEvents: 'none',
                        }}
                      />
                    </div>
                    
                    {/* Title */}
                    <h3 
                      className="text-base md:text-lg font-semibold mb-1"
                      style={{
                        color: activeModule === index ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                        textShadow: activeModule === index ? '0 0 20px rgba(96, 165, 250, 0.5)' : 'none',
                        pointerEvents: 'none',
                      }}
                    >
                      {module.title}
                    </h3>
                    
                    {/* Description */}
                    <p 
                      className="text-xs md:text-sm"
                      style={{
                        color: activeModule === index ? 'rgba(147, 197, 253, 1)' : 'rgba(255, 255, 255, 0.2)',
                        pointerEvents: 'none',
                      }}
                    >
                      {module.description}
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>
            
            {/* Bottom Edge Highlight - Premium detail */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-[1px]"
              style={{
                background: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 100%)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}, () => true); // Second argument to React.memo - always return true to never re-render

export default GlassProcessConsole;