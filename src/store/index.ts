import { create } from 'zustand';
import type { Place, Supply, Inspection, Drill, PersonRecord, DispatchOrder, Feedback, SupplyTransaction, ReportTemplate } from '../types';
import { mockPlaces, mockSupplies, mockInspections, mockDrills, mockPersonRecords, mockDispatchOrders, mockFeedbacks } from '../data/mockData';

const STORAGE_KEY = 'emergency-shelter-data';

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
  return null;
};

const saveToStorage = (state: Partial<AppState>) => {
  try {
    const data = {
      supplyTransactions: state.supplyTransactions || [],
      reportTemplates: state.reportTemplates || [],
      personRecords: state.personRecords || mockPersonRecords,
      supplies: state.supplies || mockSupplies,
      places: state.places || mockPlaces,
      inspections: state.inspections || mockInspections,
      drills: state.drills || mockDrills,
      dispatchOrders: state.dispatchOrders || mockDispatchOrders,
      feedbacks: state.feedbacks || mockFeedbacks
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

const storedData = loadFromStorage();

interface AppState {
  places: Place[];
  supplies: Supply[];
  inspections: Inspection[];
  drills: Drill[];
  personRecords: PersonRecord[];
  dispatchOrders: DispatchOrder[];
  feedbacks: Feedback[];
  supplyTransactions: SupplyTransaction[];
  reportTemplates: ReportTemplate[];
  selectedPlace: Place | null;
  
  setPlaces: (places: Place[]) => void;
  addPlace: (place: Place) => void;
  updatePlace: (place: Place) => void;
  deletePlace: (id: string) => void;
  setSelectedPlace: (place: Place | null) => void;
  
  addSupply: (supply: Supply) => void;
  updateSupply: (supply: Supply) => void;
  deleteSupply: (id: string) => void;
  
  addSupplyTransaction: (transaction: SupplyTransaction) => void;
  deleteSupplyTransactionsByPlaceId: (placeId: string) => void;
  
  addInspection: (inspection: Inspection) => void;
  updateInspection: (inspection: Inspection) => void;
  
  addDrill: (drill: Drill) => void;
  
  addPersonRecord: (record: PersonRecord) => void;
  updatePersonRecord: (record: PersonRecord) => void;
  deletePersonRecord: (id: string) => void;
  checkOutPersonRecord: (id: string) => void;
  checkOutAllByPlaceId: (placeId: string) => void;
  
  addDispatchOrder: (order: DispatchOrder) => void;
  updateDispatchOrder: (order: DispatchOrder) => void;
  
  addFeedback: (feedback: Feedback) => void;
  
  addReportTemplate: (template: ReportTemplate) => void;
  updateReportTemplate: (template: ReportTemplate) => void;
  deleteReportTemplate: (id: string) => void;
  
  deleteSuppliesByPlaceId: (placeId: string) => void;
  deleteInspectionsByPlaceId: (placeId: string) => void;
  deleteDrillsByPlaceId: (placeId: string) => void;
  deletePersonRecordsByPlaceId: (placeId: string) => void;
  deleteDispatchOrdersByPlaceId: (placeId: string) => void;
  deleteFeedbacksByPlaceId: (placeId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  places: storedData?.places || mockPlaces,
  supplies: storedData?.supplies || mockSupplies,
  inspections: storedData?.inspections || mockInspections,
  drills: storedData?.drills || mockDrills,
  personRecords: storedData?.personRecords || mockPersonRecords,
  dispatchOrders: storedData?.dispatchOrders || mockDispatchOrders,
  feedbacks: storedData?.feedbacks || mockFeedbacks,
  supplyTransactions: storedData?.supplyTransactions || [],
  reportTemplates: storedData?.reportTemplates || [],
  selectedPlace: null,

  setPlaces: (places) => set((state) => {
    const newState = { ...state, places };
    saveToStorage(newState);
    return newState;
  }),
  addPlace: (place) => set((state) => {
    const newState = { ...state, places: [...state.places, place] };
    saveToStorage(newState);
    return newState;
  }),
  updatePlace: (place) => set((state) => {
    const newState = { ...state, places: state.places.map((p) => p.id === place.id ? place : p) };
    saveToStorage(newState);
    return newState;
  }),
  deletePlace: (id) => set((state) => {
    const newState = { ...state, places: state.places.filter((p) => p.id !== id) };
    saveToStorage(newState);
    return newState;
  }),
  setSelectedPlace: (place) => set({ selectedPlace: place }),

  addSupply: (supply) => set((state) => {
    const newState = { ...state, supplies: [...state.supplies, supply] };
    saveToStorage(newState);
    return newState;
  }),
  updateSupply: (supply) => set((state) => {
    const newState = { ...state, supplies: state.supplies.map((s) => s.id === supply.id ? supply : s) };
    saveToStorage(newState);
    return newState;
  }),
  deleteSupply: (id) => set((state) => {
    const newState = { ...state, supplies: state.supplies.filter((s) => s.id !== id) };
    saveToStorage(newState);
    return newState;
  }),

  addSupplyTransaction: (transaction) => set((state) => {
    const newState = { ...state, supplyTransactions: [...state.supplyTransactions, transaction] };
    saveToStorage(newState);
    return newState;
  }),
  deleteSupplyTransactionsByPlaceId: (placeId) => set((state) => {
    const newState = { ...state, supplyTransactions: state.supplyTransactions.filter((t) => t.placeId !== placeId) };
    saveToStorage(newState);
    return newState;
  }),

  addInspection: (inspection) => set((state) => {
    const newState = { ...state, inspections: [...state.inspections, inspection] };
    saveToStorage(newState);
    return newState;
  }),
  updateInspection: (inspection) => set((state) => {
    const newState = { ...state, inspections: state.inspections.map((i) => i.id === inspection.id ? inspection : i) };
    saveToStorage(newState);
    return newState;
  }),

  addDrill: (drill) => set((state) => {
    const newState = { ...state, drills: [...state.drills, drill] };
    saveToStorage(newState);
    return newState;
  }),

  addPersonRecord: (record) => set((state) => {
    const newState = { ...state, personRecords: [...state.personRecords, record] };
    saveToStorage(newState);
    return newState;
  }),
  updatePersonRecord: (record) => set((state) => {
    const newState = { ...state, personRecords: state.personRecords.map((r) => r.id === record.id ? record : r) };
    saveToStorage(newState);
    return newState;
  }),
  deletePersonRecord: (id) => set((state) => {
    const newState = { ...state, personRecords: state.personRecords.filter((r) => r.id !== id) };
    saveToStorage(newState);
    return newState;
  }),
  checkOutPersonRecord: (id) => set((state) => {
    const newState = {
      ...state,
      personRecords: state.personRecords.map((r) =>
        r.id === id ? { ...r, checkOutTime: new Date().toISOString() } : r
      )
    };
    saveToStorage(newState);
    return newState;
  }),
  checkOutAllByPlaceId: (placeId) => set((state) => {
    const newState = {
      ...state,
      personRecords: state.personRecords.map((r) =>
        r.placeId === placeId && !r.checkOutTime
          ? { ...r, checkOutTime: new Date().toISOString() }
          : r
      )
    };
    saveToStorage(newState);
    return newState;
  }),

  addDispatchOrder: (order) => set((state) => {
    const newState = { ...state, dispatchOrders: [...state.dispatchOrders, order] };
    saveToStorage(newState);
    return newState;
  }),
  updateDispatchOrder: (order) => set((state) => {
    const newState = { ...state, dispatchOrders: state.dispatchOrders.map((o) => o.id === order.id ? order : o) };
    saveToStorage(newState);
    return newState;
  }),

  addFeedback: (feedback) => set((state) => {
    const newState = { ...state, feedbacks: [...state.feedbacks, feedback] };
    saveToStorage(newState);
    return newState;
  }),

  addReportTemplate: (template) => set((state) => {
    const newState = { ...state, reportTemplates: [...state.reportTemplates, template] };
    saveToStorage(newState);
    return newState;
  }),
  updateReportTemplate: (template) => set((state) => {
    const newState = { ...state, reportTemplates: state.reportTemplates.map((t) => t.id === template.id ? template : t) };
    saveToStorage(newState);
    return newState;
  }),
  deleteReportTemplate: (id) => set((state) => {
    const newState = { ...state, reportTemplates: state.reportTemplates.filter((t) => t.id !== id) };
    saveToStorage(newState);
    return newState;
  }),

  deleteSuppliesByPlaceId: (placeId) => set((state) => {
    const newState = { ...state, supplies: state.supplies.filter((s) => s.placeId !== placeId) };
    saveToStorage(newState);
    return newState;
  }),
  deleteInspectionsByPlaceId: (placeId) => set((state) => {
    const newState = { ...state, inspections: state.inspections.filter((i) => i.placeId !== placeId) };
    saveToStorage(newState);
    return newState;
  }),
  deleteDrillsByPlaceId: (placeId) => set((state) => {
    const newState = { ...state, drills: state.drills.filter((d) => d.placeId !== placeId) };
    saveToStorage(newState);
    return newState;
  }),
  deletePersonRecordsByPlaceId: (placeId) => set((state) => {
    const newState = { ...state, personRecords: state.personRecords.filter((r) => r.placeId !== placeId) };
    saveToStorage(newState);
    return newState;
  }),
  deleteDispatchOrdersByPlaceId: (placeId) => set((state) => {
    const newState = { ...state, dispatchOrders: state.dispatchOrders.filter((o) => o.placeId !== placeId) };
    saveToStorage(newState);
    return newState;
  }),
  deleteFeedbacksByPlaceId: (placeId) => set((state) => {
    const newState = { ...state, feedbacks: state.feedbacks.filter((f) => f.placeId !== placeId) };
    saveToStorage(newState);
    return newState;
  })
}));
