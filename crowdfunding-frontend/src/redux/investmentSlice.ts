import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "../utils/axios";
import { RootState } from "./store"; 

interface Investment {
  id: number;
  campaignId: number;
  amount: number;
  status: string;
}

interface InvestmentState {
  investments: Investment[];
  loading: boolean;
  error: string | null;
}

const initialState: InvestmentState = {
  investments: [],
  loading: false,
  error: null,
};

// Fetch User Investments
export const fetchInvestments = createAsyncThunk(
  "investment/fetchInvestments",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) throw new Error("User is not authenticated");

      const response = await axios.get("/investments/my-investments", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch investments");
    }
  }
);

// Invest in a Campaign
export const investInCampaign = createAsyncThunk(
  "investment/invest",
  async ({ campaignId, amount }: { campaignId: number; amount: number }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) throw new Error("User is not authenticated");

      const response = await axios.post(
        "/investments/invest",
        { campaignId, amount },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Investment failed");
    }
  }
);

const investmentSlice = createSlice({
  name: "investment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestments.fulfilled, (state, action: PayloadAction<Investment[]>) => {
        state.loading = false;
        state.investments = action.payload;
      })
      .addCase(fetchInvestments.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(investInCampaign.fulfilled, (state, action: PayloadAction<{ id: number; campaignId: number; amount: number; status: string }>) => {
        state.investments.push(action.payload);
      });
  },
});

export default investmentSlice.reducer;
