
import { toast } from "sonner";

const BASE_URL = "https://rollix777.com/api";

// Helper function to handle API errors
const handleError = (error: any) => {
  console.error("API Error:", error);
  const message = error.response?.data?.message || "An error occurred. Please try again.";
  toast.error(message);
  return null;
};

// Fetch game results
export const fetchGameResults = async () => {
  try {
    const response = await fetch(`${BASE_URL}/color/results`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error);
    return [];
  }
};

// Place a bet
export const placeBet = async (params: {
  betType: string;
  betValue: string;
  amount: number;
  periodNumber: string | number;
}) => {
  try {
    const payload = {
      userId: 13, // Using test user ID
      betType: params.betType,
      betValue: params.betValue,
      amount: params.amount,
      periodNumber: params.periodNumber
    };
    
    const response = await fetch(`${BASE_URL}/place-bet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    toast.success("Bet placed successfully!");
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
};
