
import React from "react";
import { Clock } from "lucide-react";

interface TimerDisplayProps {
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

const TimerDisplay = ({ timeLeft, formatTime }: TimerDisplayProps) => {
  return (
    <div 
      id="timer-display"
      className={`flex items-center justify-center gap-2 bg-[#252547] border ${
        timeLeft < 10 
          ? "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
          : "border-purple-500/20"
      } text-center py-3 px-4 rounded-lg transition-all duration-300`}
    >
      <Clock className={`w-5 h-5 ${timeLeft < 10 ? "text-red-400" : "text-purple-400"}`} />
      <span className={`font-bold ${timeLeft < 10 ? "text-red-400" : "text-white"}`}>
        Time Left: {formatTime(timeLeft || 0)}
      </span>
    </div>
  );
};

export default TimerDisplay;
