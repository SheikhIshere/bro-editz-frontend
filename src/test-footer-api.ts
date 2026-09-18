// Test file to verify footer API connection
import axiosInstance from "@/lib/axios";

export const testFooterAPI = async () => {
  try {
    console.log("Testing footer API connection...");
    const response = await axiosInstance.get("/footer/");
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
