
import React from "react";
import Header from "../components/big-small/Header";
import TimerButtons from "../components/big-small/TimerButtons";
import PeriodDisplay from "../components/big-small/PeriodDisplay";
import TimerDisplay from "../components/big-small/TimerDisplay";
import ColorButtons from "../components/big-small/ColorButtons";
import NumberButtons from "../components/big-small/NumberButtons";
import SizeButtons from "../components/big-small/SizeButtons";
import RecordTable from "../components/big-small/RecordTable";
import BetPopup from "../components/big-small/BetPopup";
import { useBigSmallGame } from "../hooks/useBigSmallGame";

const BigSmall = () => {
  const {
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
  } = useBigSmallGame();

  return (
    <div className="min-h-screen w-full bg-game-bg font-['SF_Pro_Display',sans-serif] overflow-x-hidden">
      <div className="max-w-md mx-auto pt-16 pb-24 px-4">
        <div className="w-full mx-auto bg-gradient-to-b from-game-cardLight to-game-card text-white rounded-2xl overflow-hidden shadow-lg border border-purple-500/10 animate-scale-in">
          <Header />

          <div className="px-4 py-5 space-y-5">
            <TimerButtons 
              timerDurations={timerDurations} 
              activeTime={activeTime} 
              handleTimeSelect={handleTimeSelect} 
            />
            
            <PeriodDisplay currentPeriod={currentPeriod} />
            
            <TimerDisplay 
              timeLeft={timeLeft[activeTime]} 
              formatTime={formatTime} 
            />
            
            <ColorButtons 
              timeLeft={timeLeft[activeTime]} 
              handleJoinClick={handleJoinClick} 
            />
            
            <NumberButtons 
              timeLeft={timeLeft[activeTime]} 
              handleJoinClick={handleJoinClick} 
            />
            
            <SizeButtons 
              timeLeft={timeLeft[activeTime]} 
              handleJoinClick={handleJoinClick} 
            />

            <RecordTable 
              activeTime={activeTime}
              currentRecords={currentRecords}
              isLoading={isLoading}
              indexOfFirstRecord={indexOfFirstRecord}
              indexOfLastRecord={indexOfLastRecord}
              records={records}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <BetPopup
        selectedNumber={selectedNumber}
        contractMoney={contractMoney}
        agreed={agreed}
        setSelectedNumber={setSelectedNumber}
        setContractMoney={setContractMoney}
        setAgreed={setAgreed}
        handlePlaceBet={handlePlaceBet}
      />
    </div>
  );
};

export default BigSmall;
