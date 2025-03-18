
import React from "react";

interface GameRecord {
  period: string;
  number: number;
  color: string;
  small_big: string;
}

interface RecordTableProps {
  activeTime: number;
  currentRecords: GameRecord[];
  isLoading: boolean;
  indexOfFirstRecord: number;
  indexOfLastRecord: number;
  records: GameRecord[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const RecordTable = ({ 
  activeTime, 
  currentRecords, 
  isLoading, 
  indexOfFirstRecord, 
  indexOfLastRecord, 
  records, 
  currentPage, 
  totalPages, 
  setCurrentPage 
}: RecordTableProps) => {
  return (
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
  );
};

export default RecordTable;
