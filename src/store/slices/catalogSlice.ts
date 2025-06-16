
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '@/config/sourceConfig';

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

// Async thunk for fetching service catalog from API
export const fetchServiceCatalog = createAsyncThunk(
  'catalog/fetchServiceCatalog',
  async () => {
    const userToken = localStorage.getItem("tokek");
    const response = await axios.get(`${API_URL}/hots_settings/get_service`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    console.log('Service catalog data:', response.data.data);
    return response.data.data;
  }
);

// Async thunk for fetching categories from API
export const fetchCategoryList = createAsyncThunk(
  'catalog/fetchCategoryList',
  async () => {
    const userToken = localStorage.getItem("tokek");
    const response = await axios.get(`${API_URL}/hots_settings/get_serviceCategory`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    console.log('Category data:', response.data.data);
    return response.data.data;
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

// Helper to create grouped menu (like your original logic)
export const selectGroupedMenu = (state: any, searchKeyword: string = '') => {
  const categories = state.catalog.categoryList;
  const services = state.catalog.serviceCatalog;
  const keyword = searchKeyword.trim().toLowerCase();

  return categories.reduce((acc: any[], category: Category) => {
    const filteredServices = services.filter((service: ServiceCatalogItem) => {
      const descMatch = service.service_description?.toLowerCase().includes(keyword);
      const nameMatch = service.service_name?.toLowerCase().includes(keyword);
      const keywordMatch = !keyword || descMatch || nameMatch;
      const categoryMatch = service.category_id === category.category_id;

      return keywordMatch && categoryMatch;
    });

    if (filteredServices.length > 0) {
      acc.push({ ...category, services: filteredServices });
    }

    return acc;
  }, []);
};
