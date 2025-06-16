
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { 
  fetchCatalogData, 
  setServiceCatalog, 
  setCategoryList,
  selectServiceCatalog,
  selectCategoryList,
  selectCatalogLoading,
  selectCatalogError,
  selectActiveServices,
  selectServicesByCategory,
  selectCategoryById
} from '@/store/slices/catalogSlice';
import type { ServiceCatalogItem, Category } from '@/store/slices/catalogSlice';

// Example data (you can use this to populate initially or as fallback)
const exampleServiceCatalog: ServiceCatalogItem[] = [
  {
    service_id: 1,
    category_id: 1,
    service_name: "PC/Notebook Request",
    service_description: "Request a new or replacement computer",
    approval_level: 2,
    image_url: "itassetrequest.png",
    nav_link: "asset-request",
    active: 1,
    team_id: 2
  },
  {
    service_id: 7,
    category_id: 3,
    service_name: "IT Technical Support",
    service_description: "Get help with IT issues from computer to software errors",
    approval_level: 1,
    image_url: "ittechnicalsupport.png",
    nav_link: "it-support",
    active: 1,
    team_id: 1
  },
  {
    service_id: 8,
    category_id: 1,
    service_name: "Idea Bank",
    service_description: "Submit and share your suggestions to enhance our company processes",
    approval_level: 0,
    image_url: "srf.png",
    nav_link: "idea-bank",
    active: 1,
    team_id: 8
  },
  {
    service_id: 9,
    category_id: 3,
    service_name: "Data Revision and Update Request",
    service_description: "Request updates or revisions to system data for accuracy and reliability",
    approval_level: 2,
    image_url: "datarevision.png",
    nav_link: "data-update",
    active: 1,
    team_id: 9
  },
  {
    service_id: 10,
    category_id: 4,
    service_name: "Payment Advance Request",
    service_description: "Create and submit requests for payment advances through ticketing system",
    approval_level: 3,
    image_url: "paymentadvancerequest.png",
    nav_link: "par",
    active: 1,
    team_id: 10
  }
];

const exampleCategoryList: Category[] = [
  {
    category_id: 1,
    category_name: "Hardware",
    description: null,
    creation_date: null,
    finished_date: null
  },
  {
    category_id: 2,
    category_name: "Software",
    description: null,
    creation_date: null,
    finished_date: null
  },
  {
    category_id: 3,
    category_name: "Support",
    description: null,
    creation_date: null,
    finished_date: null
  },
  {
    category_id: 4,
    category_name: "HRGA",
    description: null,
    creation_date: null,
    finished_date: null
  },
  {
    category_id: 5,
    category_name: "Marketing",
    description: null,
    creation_date: null,
    finished_date: null
  }
];

export const useCatalogData = () => {
  const dispatch = useAppDispatch();
  
  const serviceCatalog = useAppSelector(selectServiceCatalog);
  const categoryList = useAppSelector(selectCategoryList);
  const isLoading = useAppSelector(selectCatalogLoading);
  const error = useAppSelector(selectCatalogError);

  // Initialize with example data if needed
  const initializeWithExampleData = () => {
    dispatch(setServiceCatalog(exampleServiceCatalog));
    dispatch(setCategoryList(exampleCategoryList));
  };

  // Fetch data from API
  const fetchData = () => {
    dispatch(fetchCatalogData());
  };

  // Helper functions
  const getActiveServices = () => {
    return useAppSelector(selectActiveServices);
  };

  const getServicesByCategory = (categoryId: number) => {
    return useAppSelector(state => selectServicesByCategory(state, categoryId));
  };

  const getCategoryById = (categoryId: number) => {
    return useAppSelector(state => selectCategoryById(state, categoryId));
  };

  const getCategoryName = (categoryId: number) => {
    const category = getCategoryById(categoryId);
    return category?.category_name || 'Unknown Category';
  };

  return {
    // Data
    serviceCatalog,
    categoryList,
    isLoading,
    error,
    
    // Actions
    initializeWithExampleData,
    fetchData,
    
    // Helper functions
    getActiveServices,
    getServicesByCategory,
    getCategoryById,
    getCategoryName,
  };
};
