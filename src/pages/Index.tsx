
import React from "react";
import { Link } from "react-router-dom";
import { TriangleRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0F19] to-[#1A1A2E] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 relative overflow-hidden">
        {/* Top light effect */}
        <div className="absolute -top-40 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-40 -right-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"></div>
        
        {/* Header with subtle animation */}
        <div className="space-y-2 relative z-10 text-center animate-fadeIn">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs mb-4 tracking-wide">
            PREMIUM EXPERIENCE
          </div>
          <h1 className="text-4xl font-bold">Big Small Bets</h1>
          <p className="text-gray-400 max-w-md mx-auto mt-4">
            An elegantly designed gaming experience inspired by simplicity and precision. Try your luck with our beautifully crafted interface.
          </p>
        </div>
        
        {/* Card with game option */}
        <div className="bg-gradient-to-b from-game-cardLight to-game-card rounded-2xl overflow-hidden border border-purple-500/10 shadow-lg transition-all duration-300 hover:shadow-purple-500/10 hover:border-purple-500/30 shine animate-scale-in">
          <Link to="/big-small" className="block">
            <div className="p-6 space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold">BS</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">Big Small Game</h3>
                  <p className="text-gray-400 text-sm">Try your luck with numbers</p>
                </div>
                <div className="ml-auto">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-300 hover:bg-purple-500/20 transition-colors">
                    <TriangleRight size={20} />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map((num) => (
                  <div 
                    key={num} 
                    className={`rounded-lg p-3 flex items-center justify-center text-white font-bold ${
                      num === 0 
                        ? "bg-purple-500" 
                        : num % 2 === 0 
                        ? "bg-green-500" 
                        : "bg-red-500"
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
              
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                  Play Now
                </span>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Bottom text */}
        <p className="text-center text-gray-500 text-sm">
          Design inspired by simplicity and elegance
        </p>
      </div>
    </div>
  );
};

export default Index;
