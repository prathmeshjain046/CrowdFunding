import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "../utils/axios";
import { RootState } from "../redux/store";

interface Campaign {
  id: number;
  founderId: number;
  title: string;
  description: string;
  fundingGoal: number;
  equityOffered: number;
  amountRaised: number;
  status: string;
  createdAt: string;
}

interface CampaignState {
  campaigns: Campaign[];
  myCampaigns: Campaign[];
  selectedCampaign: Campaign | null;
  loading: boolean;
  error: string | null;
}

const initialState: CampaignState = {
  campaigns: [],
  myCampaigns: [],
  selectedCampaign: null,
  loading: false,
  error: null,
};

export const fetchCampaigns = createAsyncThunk(
  "campaign/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/campaigns");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch campaigns");
    }
  }
);

export const fetchMyCampaigns = createAsyncThunk(
  "campaign/fetchMyCampaigns",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;
      if (!token) throw new Error("User is not authenticated");

      const response = await axios.get(`/campaigns/founder`);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch campaigns");
    }
  }
);

export const createCampaign = createAsyncThunk(
  "campaign/create",
  async (
    campaignData: { title: string; description: string; fundingGoal: number; equityOffered: number },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;
      const userId = state.auth.user?.id; 

      if (!token || !userId) throw new Error("User is not authenticated");

      const response = await axios.post("/campaigns/create", campaignData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

     
      return { ...response.data, founderId: userId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to create campaign");
    }
  }
);

export const updateCampaignStatus = createAsyncThunk(
  "campaign/updateStatus",
  async ({ campaignId, status }: { campaignId: number; status: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;
      if (!token) throw new Error("User is not authenticated");

      await axios.put(
        `/campaigns/${campaignId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      return { campaignId, status };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to update campaign status");
    }
  }
);

const campaignSlice = createSlice({
  name: "campaign",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action: PayloadAction<Campaign[]>) => {
        state.loading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyCampaigns.fulfilled, (state, action: PayloadAction<Campaign[]>) => {
        state.loading = false;
        state.myCampaigns = action.payload;
      })
      .addCase(fetchMyCampaigns.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCampaign.fulfilled, (state, action: PayloadAction<Campaign>) => {
        state.campaigns.push(action.payload); 
        state.myCampaigns.push(action.payload); 
      })
      .addCase(updateCampaignStatus.fulfilled, (state, action: PayloadAction<{ campaignId: number; status: string }>) => {
  
        const campaign = state.campaigns.find((c) => c.id === action.payload.campaignId);
        if (campaign) {
          campaign.status = action.payload.status;
        }

        const myCampaign = state.myCampaigns.find((c) => c.id === action.payload.campaignId);
        if (myCampaign) {
          myCampaign.status = action.payload.status;
        }
      });
  },
});

export default campaignSlice.reducer;

