
import React from "react";

interface TimerButtonsProps {
  timerDurations: number[];
  activeTime: number;
  handleTimeSelect: (minutes: number) => void;
}

const TimerButtons = ({ timerDurations, activeTime, handleTimeSelect }: TimerButtonsProps) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {timerDurations.map((min) => (
        <button
          key={min}
          className={`px-4 py-2 rounded-lg transition-all duration-300 button-press ${
            activeTime === min 
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shine shadow-md" 
              : "bg-[#252547] border border-purple-500/20 text-gray-300 hover:bg-[#2f2f5a]"
          }`}
          onClick={() => handleTimeSelect(min)}
        >
          {min} min
        </button>
      ))}
    </div>
  );
};

export default TimerButtons;
