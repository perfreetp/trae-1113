export type PlaceType = 'indoor' | 'outdoor' | 'comprehensive';
export type PlaceStatus = 'normal' | 'open' | 'closed' | 'maintenance';
export type SupplyStatus = 'normal' | 'expiring' | 'expired';
export type InspectionStatus = 'pending' | 'rectifying' | 'completed';
export type DispatchType = 'open' | 'close';
export type DispatchStatus = 'active' | 'expired';

export interface Place {
  id: string;
  name: string;
  address: string;
  area: number;
  capacity: number;
  type: PlaceType;
  status: PlaceStatus;
  lat: number;
  lng: number;
  facilities: string[];
  accessible: boolean;
  manager: string;
  phone: string;
  district: string;
  photos?: string[];
  description?: string;
  currentPeople?: number;
  updatedAt?: string;
}

export interface Supply {
  id: string;
  placeId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expireDate: string;
  status: SupplyStatus;
}

export interface Inspection {
  id: string;
  placeId: string;
  date: string;
  inspector: string;
  issues: string[];
  status: InspectionStatus;
  rectifyDeadline?: string;
  rectifyResult?: string;
  photos?: string[];
}

export interface Drill {
  id: string;
  placeId: string;
  name: string;
  date: string;
  participants: number;
  evaluation: string;
  signInList: string[];
  photos?: string[];
}

export interface PersonRecord {
  id: string;
  placeId: string;
  name: string;
  idCard?: string;
  checkInTime: string;
  checkOutTime?: string;
}

export interface DispatchOrder {
  id: string;
  placeId: string;
  type: DispatchType;
  reason: string;
  createTime: string;
  executeTime?: string;
  endTime?: string;
  operator: string;
  status: DispatchStatus;
}

export interface Feedback {
  id: string;
  placeId: string;
  rating: number;
  comment: string;
  createTime: string;
}
