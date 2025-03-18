
import React from "react";

interface ColorButtonsProps {
  timeLeft: number;
  handleJoinClick: (value: string | number) => void;
}

const ColorButtons = ({ timeLeft, handleJoinClick }: ColorButtonsProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 button-press ${
          timeLeft < 10 
            ? "bg-[#252547] border border-green-500/20 text-gray-400 cursor-not-allowed" 
            : "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"
        }`}
        disabled={timeLeft < 10}
        onClick={() => handleJoinClick("Green")}
      >
        Join Green
      </button>
      
      <button 
        className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 button-press ${
          timeLeft < 10 
            ? "bg-[#252547] border border-purple-500/20 text-gray-400 cursor-not-allowed" 
            : "bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30"
        }`}
        disabled={timeLeft < 10}
        onClick={() => handleJoinClick("Violet")}
      >
        Join Violet
      </button>
      
      <button
        className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 button-press ${
          timeLeft < 10 
            ? "bg-[#252547] border border-red-500/20 text-gray-400 cursor-not-allowed" 
            : "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
        }`}
        disabled={timeLeft < 10}
        onClick={() => handleJoinClick("Red")}
      >
        Join Red
      </button>
    </div>
  );
};

export default ColorButtons;
