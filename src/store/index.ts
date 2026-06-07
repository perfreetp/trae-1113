import { create } from 'zustand';
import type { Place, Supply, Inspection, Drill, PersonRecord, DispatchOrder, Feedback } from '../types';
import { mockPlaces, mockSupplies, mockInspections, mockDrills, mockPersonRecords, mockDispatchOrders, mockFeedbacks } from '../data/mockData';

interface AppState {
  places: Place[];
  supplies: Supply[];
  inspections: Inspection[];
  drills: Drill[];
  personRecords: PersonRecord[];
  dispatchOrders: DispatchOrder[];
  feedbacks: Feedback[];
  selectedPlace: Place | null;
  
  setPlaces: (places: Place[]) => void;
  addPlace: (place: Place) => void;
  updatePlace: (place: Place) => void;
  deletePlace: (id: string) => void;
  setSelectedPlace: (place: Place | null) => void;
  
  addSupply: (supply: Supply) => void;
  updateSupply: (supply: Supply) => void;
  
  addInspection: (inspection: Inspection) => void;
  updateInspection: (inspection: Inspection) => void;
  
  addDrill: (drill: Drill) => void;
  
  addPersonRecord: (record: PersonRecord) => void;
  updatePersonRecord: (record: PersonRecord) => void;
  
  addDispatchOrder: (order: DispatchOrder) => void;
  
  addFeedback: (feedback: Feedback) => void;
}

export const useAppStore = create<AppState>((set) => ({
  places: mockPlaces,
  supplies: mockSupplies,
  inspections: mockInspections,
  drills: mockDrills,
  personRecords: mockPersonRecords,
  dispatchOrders: mockDispatchOrders,
  feedbacks: mockFeedbacks,
  selectedPlace: null,

  setPlaces: (places) => set({ places }),
  addPlace: (place) => set((state) => ({ places: [...state.places, place] })),
  updatePlace: (place) => set((state) => ({
    places: state.places.map((p) => p.id === place.id ? place : p)
  })),
  deletePlace: (id) => set((state) => ({
    places: state.places.filter((p) => p.id !== id)
  })),
  setSelectedPlace: (place) => set({ selectedPlace: place }),

  addSupply: (supply) => set((state) => ({ supplies: [...state.supplies, supply] })),
  updateSupply: (supply) => set((state) => ({
    supplies: state.supplies.map((s) => s.id === supply.id ? supply : s)
  })),

  addInspection: (inspection) => set((state) => ({ inspections: [...state.inspections, inspection] })),
  updateInspection: (inspection) => set((state) => ({
    inspections: state.inspections.map((i) => i.id === inspection.id ? inspection : i)
  })),

  addDrill: (drill) => set((state) => ({ drills: [...state.drills, drill] })),

  addPersonRecord: (record) => set((state) => ({ personRecords: [...state.personRecords, record] })),
  updatePersonRecord: (record) => set((state) => ({
    personRecords: state.personRecords.map((r) => r.id === record.id ? record : r)
  })),

  addDispatchOrder: (order) => set((state) => ({ dispatchOrders: [...state.dispatchOrders, order] })),

  addFeedback: (feedback) => set((state) => ({ feedbacks: [...state.feedbacks, feedback] }))
}));
