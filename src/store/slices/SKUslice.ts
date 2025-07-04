
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from 'axios';
import { API_URL } from '@/config/sourceConfig';
import { skulist } from "@/types/sku_types";

interface sku_data {
  skulist: skulist[];
  loading: boolean;
  error?: string;
}


const initialState: sku_data = {
  skulist: [],
  loading: false,
};

export const fetchsku = createAsyncThunk(
  'settings/fetchSKU',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('tokek');

      const [getskures] = await Promise.all([
        axios.get(`${API_URL}/hots_settings/get_srf_sku`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!getskures.data.success) {
        return rejectWithValue('One or more SRF fetches failed');
      }
      console.log("getskures.data", getskures.data.results)
      return {
        skulist: getskures.data.results || [],
      };
    } catch (error: any) {
      console.error('fetchSKU API Error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Network error'
      );
    }
  }
);

const skuslice = createSlice({
  name: 'sku',
  initialState,
  reducers: {
    clearSkuErrors: (state) => {
      state.error = undefined;
    },
    clearSkuData: (state) => {
      state.skulist = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchsku.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchsku.fulfilled, (state, action: PayloadAction<{ skulist: skulist[]; }>) => {
        state.loading = false;
        state.skulist = action.payload.skulist;
      })
      .addCase(fetchsku.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSkuErrors, clearSkuData } = skuslice.actions;
export default skuslice.reducer;
