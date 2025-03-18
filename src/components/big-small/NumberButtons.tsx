
import React from "react";

interface NumberButtonsProps {
  timeLeft: number;
  handleJoinClick: (value: string | number) => void;
}

const NumberButtons = ({ timeLeft, handleJoinClick }: NumberButtonsProps) => {
  return (
    <div className="p-3 bg-[#1A1A2E] rounded-lg border border-purple-500/10">
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i}
            onClick={() => handleJoinClick(i)}
            disabled={timeLeft < 10}
            className={`relative p-3 text-white font-bold rounded-lg transition-all duration-200 button-press ${
              timeLeft < 10
                ? "bg-[#252547] border border-gray-600/20 text-gray-500 cursor-not-allowed"
                : i === 0
                ? "button-violet"
                : i % 2 === 0
                ? "button-green"
                : "button-red"
            }`}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NumberButtons;
