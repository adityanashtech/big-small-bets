
import React from "react";

interface PeriodDisplayProps {
  currentPeriod: string;
}

const PeriodDisplay = ({ currentPeriod }: PeriodDisplayProps) => {
  return (
    <div className="flex items-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 px-4 py-3 rounded-lg border border-purple-500/20 shine">
      <span className="mr-2 text-amber-300">🏆</span>
      <span className="font-medium text-purple-100">Period</span>
      <span className="ml-auto font-mono tracking-wide text-white">{currentPeriod}</span>
    </div>
  );
};

export default PeriodDisplay;
