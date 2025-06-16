
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types for the catalog data
export interface ServiceCatalogItem {
  service_id: number;
  category_id: number;
  service_name: string;
  service_description: string;
  approval_level: number;
  image_url: string;
  nav_link: string;
  active: number;
  team_id: number | null;
}

export interface Category {
  category_id: number;
  category_name: string;
  description: string | null;
  creation_date: string | null;
  finished_date: string | null;
}

interface CatalogState {
  serviceCatalog: ServiceCatalogItem[];
  categoryList: Category[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  serviceCatalog: [],
  categoryList: [],
  isLoading: false,
  error: null,
};

// Async thunks for fetching data
export const fetchServiceCatalog = createAsyncThunk(
  'catalog/fetchServiceCatalog',
  async () => {
    // Replace with your actual API call
    const response = await fetch('/api/service-catalog');
    if (!response.ok) {
      throw new Error('Failed to fetch service catalog');
    }
    return response.json();
  }
);

export const fetchCategoryList = createAsyncThunk(
  'catalog/fetchCategoryList',
  async () => {
    // Replace with your actual API call
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  }
);

// Thunk to fetch both datasets
export const fetchCatalogData = createAsyncThunk(
  'catalog/fetchCatalogData',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchServiceCatalog()),
      dispatch(fetchCategoryList())
    ]);
  }
);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    // Synchronous actions for setting data directly
    setServiceCatalog: (state, action: PayloadAction<ServiceCatalogItem[]>) => {
      state.serviceCatalog = action.payload;
    },
    setCategoryList: (state, action: PayloadAction<Category[]>) => {
      state.categoryList = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Service catalog cases
      .addCase(fetchServiceCatalog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceCatalog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.serviceCatalog = action.payload;
      })
      .addCase(fetchServiceCatalog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch service catalog';
      })
      // Category list cases
      .addCase(fetchCategoryList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoryList = action.payload;
      })
      .addCase(fetchCategoryList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      // Combined fetch cases
      .addCase(fetchCatalogData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCatalogData.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchCatalogData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch catalog data';
      });
  },
});

export const { setServiceCatalog, setCategoryList, clearError } = catalogSlice.actions;
export default catalogSlice.reducer;

// Selectors
export const selectServiceCatalog = (state: any) => state.catalog.serviceCatalog;
export const selectCategoryList = (state: any) => state.catalog.categoryList;
export const selectCatalogLoading = (state: any) => state.catalog.isLoading;
export const selectCatalogError = (state: any) => state.catalog.error;

// Helper selectors
export const selectServicesByCategory = (state: any, categoryId: number) =>
  state.catalog.serviceCatalog.filter((service: ServiceCatalogItem) => 
    service.category_id === categoryId && service.active === 1
  );

export const selectActiveServices = (state: any) =>
  state.catalog.serviceCatalog.filter((service: ServiceCatalogItem) => service.active === 1);

export const selectCategoryById = (state: any, categoryId: number) =>
  state.catalog.categoryList.find((category: Category) => category.category_id === categoryId);
