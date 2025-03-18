import { useState, useEffect } from "react";
import { initDB, getTimer, saveTimer, updateTimer } from "../utils/indexedDB";
import { fetchGameResults, placeBet } from "../services/api";
import { toast } from "sonner";

interface GameRecord {
  period: string;
  number: number;
  color: string;
  small_big: string;
}

export const useBigSmallGame = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: number }>({});
  const [isRunning, setIsRunning] = useState<{ [key: number]: boolean }>({});
  const [activeTime, setActiveTime] = useState<number>(1); // Default to 1 min
  const [selectedNumber, setSelectedNumber] = useState<any>(null);
  const [contractMoney, setContractMoney] = useState<number | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [records, setRecords] = useState<GameRecord[]>([]); // State to store fetched data
  const [currentPeriod, setCurrentPeriod] = useState<string>("1"); // Set static period as "1"
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
        // Always keep period as "1" for testing
        setCurrentPeriod("1");
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
                // Keep period as "1" for testing
                setCurrentPeriod("1");
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

  // Generate a random period number - not used now since we're using static "1"
  const generatePeriod = () => {
    return "1"; // Always return "1" for testing
  };

  const generateMockData = () => {
    const mockData = Array.from({ length: 20 }, (_, i) => ({
      period: "1", // Static period for testing
      number: Math.floor(Math.random() * 10),
      color: Math.random() > 0.5 ? "green" : "red",
      small_big: Math.random() > 0.5 ? "Small" : "Big"
    }));
    setRecords(mockData);
    setCurrentPeriod("1"); // Always use "1" for testing
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
        periodNumber: "1" // Always use "1" for testing
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

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(records.length / recordsPerPage);

  return {
    currentPage,
    setCurrentPage,
    timeLeft,
    activeTime,
    selectedNumber,
    setSelectedNumber,
    contractMoney,
    setContractMoney,
    agreed,
    setAgreed,
    records,
    currentPeriod,
    isLoading,
    timerDurations,
    handleTimeSelect,
    formatTime,
    handleJoinClick,
    handlePlaceBet,
    indexOfLastRecord,
    indexOfFirstRecord,
    currentRecords,
    totalPages
  };
};
