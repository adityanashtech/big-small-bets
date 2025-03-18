
import React from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import Check from "../Check";

interface BetPopupProps {
  selectedNumber: string | number | null;
  contractMoney: number | null;
  agreed: boolean;
  setSelectedNumber: (value: string | number | null) => void;
  setContractMoney: (value: number | null) => void;
  setAgreed: (value: boolean) => void;
  handlePlaceBet: () => void;
}

const BetPopup = ({
  selectedNumber,
  contractMoney,
  agreed,
  setSelectedNumber,
  setContractMoney,
  setAgreed,
  handlePlaceBet
}: BetPopupProps) => {
  if (selectedNumber === null) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#252547] to-[#1A1A2E] rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-purple-500/10">
          <h2 className="text-xl font-bold text-white">
            {typeof selectedNumber === 'number' 
              ? `Number ${selectedNumber} Selected` 
              : `${selectedNumber} Selected`}
          </h2>
          <button 
            onClick={() => setSelectedNumber(null)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1A1A2E] text-gray-400 hover:text-white transition-colors button-press"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-300">Contract Money</label>
            <input 
              min={10}
              step={10}
              type="number"
              placeholder="Enter amount (Minimum ₹10)"
              value={contractMoney || ''}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value > 100000) {
                  setContractMoney(100000); // Reset to max limit
                  toast.error("Maximum amount is ₹100,000");
                } else {
                  setContractMoney(value);
                }
              }}
              className="w-full py-3 px-4 bg-[#1A1A2E] border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          
          {/* Error Message or Success Message */}
          {contractMoney !== null && (
            contractMoney > 100000 ? (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm animate-pulse-soft">
                Contract money cannot exceed ₹100,000
              </div>
            ) : contractMoney < 10 ? (
              <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-200 text-sm">
                Minimum bet amount is ₹10
              </div>
            ) : (
              <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm shine">
                Total contract money is ₹{contractMoney}
              </div>
            )
          )}
          
          {/* Checkbox */}
          <div className="flex items-center py-2">
            <div 
              className={`w-5 h-5 rounded flex items-center justify-center mr-3 cursor-pointer transition-all duration-200 ${
                agreed 
                  ? "bg-purple-600" 
                  : "bg-[#1A1A2E] border border-purple-500/20"
              }`}
              onClick={() => setAgreed(!agreed)}
            >
              {agreed && <Check className="w-4 h-4 text-white" />}
            </div>
            <label 
              className="text-sm text-gray-300 cursor-pointer"
              onClick={() => setAgreed(!agreed)}
            >
              I agree to the <span className="text-purple-400">terms and conditions</span>
            </label>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="p-5 border-t border-purple-500/10 flex gap-3">
          <button 
            onClick={() => setSelectedNumber(null)}
            className="flex-1 py-3 px-4 bg-[#1A1A2E] border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors button-press"
          >
            Cancel
          </button>
          <button 
            className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
              agreed && contractMoney !== null && contractMoney >= 10 && contractMoney <= 100000
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shine button-press" 
                : "bg-gray-600/50 cursor-not-allowed"
            }`}
            disabled={!agreed || contractMoney === null || contractMoney < 10 || contractMoney > 100000}
            onClick={handlePlaceBet}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetPopup;
