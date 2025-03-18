
import React from "react";

interface SizeButtonsProps {
  timeLeft: number;
  handleJoinClick: (value: string | number) => void;
}

const SizeButtons = ({ timeLeft, handleJoinClick }: SizeButtonsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button 
        className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 button-press ${
          timeLeft < 10 
            ? "bg-[#252547] border border-red-500/20 text-gray-400 cursor-not-allowed" 
            : "bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90"
        }`}
        disabled={timeLeft < 10}
        onClick={() => handleJoinClick("Big")}
      >
        Big
      </button>
      <button 
        className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 button-press ${
          timeLeft < 10 
            ? "bg-[#252547] border border-green-500/20 text-gray-400 cursor-not-allowed" 
            : "bg-gradient-to-r from-green-600 to-green-500 text-white hover:opacity-90"
        }`}
        disabled={timeLeft < 10}
        onClick={() => handleJoinClick("Small")}
      >
        Small
      </button>
    </div>
  );
};

export default SizeButtons;
