
import React, { useEffect, useState } from "react";
import { X, ArrowLeft, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { initDB, getTimer, saveTimer, updateTimer } from "../utils/indexedDB";
import Check from "../components/Check";
import { toast } from "sonner";
import { fetchGameResults, placeBet } from "../services/api";

interface GameRecord {
  period: string;
  number: number;
  color: string;
  small_big: string;
}

const BigSmall = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: number }>({});
  const [isRunning, setIsRunning] = useState<{ [key: number]: boolean }>({});
  const [activeTime, setActiveTime] = useState<number>(1); // Default to 1 min
  const [selectedNumber, setSelectedNumber] = useState<any>(null);
  const [contractMoney, setContractMoney] = useState<number | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [records, setRecords] = useState<GameRecord[]>([]); // State to store fetched data
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Available timer durations in minutes
  const timerDurations = [1, 3, 5, 10];

  // Fetch game results from API
  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const data = await fetchGameResults();
      if (data && data.length > 0) {
        setRecords(data);
        // Set current period from the latest record
        setCurrentPeriod(data[0]?.period || generatePeriod());
      } else {
        // Fallback to mock data if API fails
        generateMockData();
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      // Fallback to mock data if API fails
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeTimers = async () => {
      await initDB();
      
      // Initialize timers for each duration
      for (const duration of timerDurations) {
        const timer = await getTimer(duration);
        const durationInSeconds = duration * 60;
        
        if (!timer) {
          // Create new timer if it doesn't exist
          await saveTimer({
            id: duration,
            timeLeft: durationInSeconds,
            duration: durationInSeconds,
            lastUpdated: Date.now(),
            isRunning: true
          });
          setTimeLeft(prev => ({ ...prev, [duration]: durationInSeconds }));
          setIsRunning(prev => ({ ...prev, [duration]: true }));
        } else {
          // Calculate remaining time based on last update
          const elapsed = Math.floor((Date.now() - timer.lastUpdated) / 1000);
          let remaining = timer.timeLeft - elapsed;
          
          // Reset timer if it has expired
          if (remaining <= 0) {
            remaining = timer.duration;
          }
          
          setTimeLeft(prev => ({ ...prev, [duration]: remaining }));
          setIsRunning(prev => ({ ...prev, [duration]: timer.isRunning }));
        }
      }
    };

    initializeTimers();
    fetchResults();
  }, []);

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    timerDurations.forEach(duration => {
      if (isRunning[duration]) {
        const interval = setInterval(async () => {
          setTimeLeft(prev => {
            const current = prev[duration] || duration * 60;
            const next = current > 0 ? current - 1 : duration * 60;
            
            // Save timer state to IndexedDB
            saveTimer({
              id: duration,
              timeLeft: next,
              duration: duration * 60,
              lastUpdated: Date.now(),
              isRunning: true
            });

            if (next === duration * 60) {
              // Timer reset, fetch new results
              if (duration === activeTime) {
                fetchResults();
                // Generate new period
                setCurrentPeriod(generatePeriod());
              }
            }

            // Add pulse animation when timer is low
            if (next <= 5 && duration === activeTime) {
              document.getElementById("timer-display")?.classList.add("animate-countdown");
              setTimeout(() => {
                document.getElementById("timer-display")?.classList.remove("animate-countdown");
              }, 1000);
            }

            return { ...prev, [duration]: next };
          });
        }, 1000);

        intervals.push(interval);
      }
    });

    return () => intervals.forEach(clearInterval);
  }, [isRunning, activeTime]);

  const handleTimeSelect = async (minutes: number) => {
    setActiveTime(minutes);
    
    // Visual feedback
    toast.success(`Switched to ${minutes} minute game`);
    
    // Update timer state in IndexedDB
    await updateTimer(minutes, {
      isRunning: true,
      lastUpdated: Date.now()
    });
    
    setIsRunning(prev => ({ ...prev, [minutes]: true }));
    
    // Fetch results for this time duration
    fetchResults();
  };

  // Generate a random period number
  const generatePeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${year}${month}${day}${random}`;
  };

  const generateMockData = () => {
    const mockData = Array.from({ length: 20 }, (_, i) => ({
      period: `20250227${Math.floor(1000 + Math.random() * 9000)}`,
      number: Math.floor(Math.random() * 10),
      color: Math.random() > 0.5 ? "green" : "red",
      small_big: Math.random() > 0.5 ? "Small" : "Big"
    }));
    setRecords(mockData);
    setCurrentPeriod(mockData[0]?.period || generatePeriod());
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const handleJoinClick = (value: string | number) => {
    if (timeLeft[activeTime] < 10) return;
    
    setSelectedNumber(value);
    // Haptic feedback simulation (subtle visual effect)
    document.body.classList.add("button-press");
    setTimeout(() => {
      document.body.classList.remove("button-press");
    }, 100);
  };

  const handlePlaceBet = async () => {
    if (!contractMoney || contractMoney < 10 || !selectedNumber) return;
    
    let betType = "number";
    let betValue = selectedNumber.toString();
    
    if (selectedNumber === "Red" || selectedNumber === "Green" || selectedNumber === "Violet") {
      betType = "color";
      betValue = selectedNumber.toLowerCase();
    } else if (selectedNumber === "Big" || selectedNumber === "Small") {
      betType = "size";
      betValue = selectedNumber.toLowerCase();
    }
    
    try {
      const result = await placeBet({
        betType,
        betValue,
        amount: contractMoney,
        periodNumber: currentPeriod
      });
      
      if (result) {
        toast.success("Bet placed successfully!");
        setSelectedNumber(null);
        setContractMoney(null);
        setAgreed(false);
      }
    } catch (error) {
      toast.error("Failed to place bet. Please try again.");
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(records.length / recordsPerPage);

  return (
    <div className="min-h-screen w-full bg-game-bg font-['SF_Pro_Display',sans-serif] overflow-x-hidden">
      <div className="max-w-md mx-auto pt-16 pb-24 px-4">
        <div className="w-full mx-auto bg-gradient-to-b from-game-cardLight to-game-card text-white rounded-2xl overflow-hidden shadow-lg border border-purple-500/10 animate-scale-in">
          {/* Header with back button */}
          <div className="flex items-center p-4 border-b border-purple-500/10">
            <Link to="/" className="p-2 rounded-lg bg-[#252547] text-purple-400 hover:bg-[#2f2f5a] transition-colors button-press">
              <ArrowLeft size={20} />
            </Link>
            <div className="ml-4 flex flex-col">
              <span className="text-xs text-purple-300 tracking-wide">GAME</span>
              <h1 className="text-xl font-bold text-white">Big & Small</h1>
            </div>
          </div>

          <div className="px-4 py-5 space-y-5">
            {/* Time Buttons */}
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

            {/* Period Display */}
            <div className="flex items-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 px-4 py-3 rounded-lg border border-purple-500/20 shine">
              <span className="mr-2 text-amber-300">🏆</span>
              <span className="font-medium text-purple-100">Period</span>
              <span className="ml-auto font-mono tracking-wide text-white">{currentPeriod}</span>
            </div>

            {/* Timer */}
            <div 
              id="timer-display"
              className={`flex items-center justify-center gap-2 bg-[#252547] border ${
                timeLeft[activeTime] < 10 
                  ? "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                  : "border-purple-500/20"
              } text-center py-3 px-4 rounded-lg transition-all duration-300`}
            >
              <Clock className={`w-5 h-5 ${timeLeft[activeTime] < 10 ? "text-red-400" : "text-purple-400"}`} />
              <span className={`font-bold ${timeLeft[activeTime] < 10 ? "text-red-400" : "text-white"}`}>
                Time Left: {formatTime(timeLeft[activeTime] || 0)}
              </span>
            </div>

            {/* Join Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 button-press ${
                  timeLeft[activeTime] < 10 
                    ? "bg-[#252547] border border-green-500/20 text-gray-400 cursor-not-allowed" 
                    : "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"
                }`}
                disabled={timeLeft[activeTime] < 10}
                onClick={() => handleJoinClick("Green")}
              >
                Join Green
              </button>
              
              <button 
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 button-press ${
                  timeLeft[activeTime] < 10 
                    ? "bg-[#252547] border border-purple-500/20 text-gray-400 cursor-not-allowed" 
                    : "bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30"
                }`}
                disabled={timeLeft[activeTime] < 10}
                onClick={() => handleJoinClick("Violet")}
              >
                Join Violet
              </button>
              
              <button
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 button-press ${
                  timeLeft[activeTime] < 10 
                    ? "bg-[#252547] border border-red-500/20 text-gray-400 cursor-not-allowed" 
                    : "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                }`}
                disabled={timeLeft[activeTime] < 10}
                onClick={() => handleJoinClick("Red")}
              >
                Join Red
              </button>
            </div>

            {/* 0-9 Number Buttons */}
            <div className="p-3 bg-[#1A1A2E] rounded-lg border border-purple-500/10">
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 10 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handleJoinClick(i)}
                    disabled={timeLeft[activeTime] < 10}
                    className={`relative p-3 text-white font-bold rounded-lg transition-all duration-200 button-press ${
                      timeLeft[activeTime] < 10
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

            {/* Big & Small Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 button-press ${
                  timeLeft[activeTime] < 10 
                    ? "bg-[#252547] border border-red-500/20 text-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90"
                }`}
                disabled={timeLeft[activeTime] < 10}
                onClick={() => handleJoinClick("Big")}
              >
                Big
              </button>
              <button 
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 button-press ${
                  timeLeft[activeTime] < 10 
                    ? "bg-[#252547] border border-green-500/20 text-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-green-600 to-green-500 text-white hover:opacity-90"
                }`}
                disabled={timeLeft[activeTime] < 10}
                onClick={() => handleJoinClick("Small")}
              >
                Small
              </button>
            </div>

            {/* Record Table */}
            <div className="bg-gradient-to-br from-[#252547] to-[#1A1A2E] rounded-xl border border-purple-500/20 overflow-hidden mt-8 shine">
              <div className="p-4 border-b border-purple-500/10 flex items-center">
                <span className="text-amber-300 mr-2">🏆</span>
                <h2 className="text-xl font-bold text-white">{activeTime} min Record</h2>
                
                {isLoading && (
                  <div className="ml-auto w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-purple-500/10">
                      <th className="py-4 px-4 font-medium">Period</th>
                      <th className="py-4 px-4 font-medium">Number</th>
                      <th className="py-4 px-4 font-medium">Result</th>
                      <th className="py-4 px-4 font-medium">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.length > 0 ? (
                      currentRecords.map((record, index) => (
                        <tr 
                          key={index} 
                          className="border-b border-purple-500/10 text-white hover:bg-purple-500/5 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono text-sm">{record.period}</td>
                          <td className="py-3 px-4">{record.number}</td>
                          <td className="py-3 px-4">
                            {record.number === 0 ? 
                              <span className="inline-block w-6 h-6 rounded-full bg-purple-500"></span> : 
                            record.color === "green" ? 
                              <span className="inline-block w-6 h-6 rounded-full bg-green-500"></span> : 
                              <span className="inline-block w-6 h-6 rounded-full bg-red-500"></span>
                            }
                          </td>
                          <td className="py-3 px-4">{record.small_big}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-gray-400">
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                              <span>Loading records...</span>
                            </div>
                          ) : (
                            "No records available"
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {records.length > 0 && (
                <div className="p-4 border-t border-purple-500/10 flex justify-between items-center flex-wrap gap-2">
                  <p className="text-gray-400 text-sm">
                    Showing {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, records.length)} of {records.length} records
                  </p>
                  <div className="flex gap-1">
                    <button
                      className="py-1 px-3 bg-[#1A1A2E] border border-purple-500/20 rounded-lg text-gray-400 hover:text-white transition-colors button-press"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                      Prev
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageToShow;
                      if (totalPages <= 5) {
                        pageToShow = i + 1;
                      } else if (currentPage <= 3) {
                        pageToShow = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageToShow = totalPages - 4 + i;
                      } else {
                        pageToShow = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={i}
                          className={`py-1 px-3 rounded-lg ${
                            currentPage === pageToShow 
                              ? "bg-purple-500/20 border border-purple-500/20 text-white" 
                              : "bg-[#1A1A2E] border border-purple-500/20 text-gray-400 hover:text-white transition-colors"
                          } button-press`}
                          onClick={() => setCurrentPage(pageToShow)}
                        >
                          {pageToShow}
                        </button>
                      );
                    })}
                    
                    <button
                      className="py-1 px-3 bg-[#1A1A2E] border border-purple-500/20 rounded-lg text-gray-400 hover:text-white transition-colors button-press"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popup */}
      {selectedNumber !== null && (
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
      )}
    </div>
  );
};

export default BigSmall;
