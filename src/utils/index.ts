import type { PlaceStatus, SupplyStatus, InspectionStatus, PlaceType } from '../types';

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('zh-CN');
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('zh-CN');
};

export const getPlaceStatusText = (status: PlaceStatus): string => {
  const map: Record<PlaceStatus, string> = {
    normal: '正常',
    open: '开放中',
    closed: '已关闭',
    maintenance: '维护中'
  };
  return map[status];
};

export const getPlaceStatusColor = (status: PlaceStatus): string => {
  const map: Record<PlaceStatus, string> = {
    normal: 'bg-green-100 text-green-800',
    open: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-800',
    maintenance: 'bg-orange-100 text-orange-800'
  };
  return map[status];
};

export const getPlaceTypeText = (type: PlaceType): string => {
  const map: Record<PlaceType, string> = {
    indoor: '室内',
    outdoor: '室外',
    comprehensive: '综合'
  };
  return map[type];
};

export const getSupplyStatusText = (status: SupplyStatus): string => {
  const map: Record<SupplyStatus, string> = {
    normal: '正常',
    expiring: '即将到期',
    expired: '已过期'
  };
  return map[status];
};

export const getSupplyStatusColor = (status: SupplyStatus): string => {
  const map: Record<SupplyStatus, string> = {
    normal: 'bg-green-100 text-green-800',
    expiring: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-red-100 text-red-800'
  };
  return map[status];
};

export const getInspectionStatusText = (status: InspectionStatus): string => {
  const map: Record<InspectionStatus, string> = {
    pending: '待处理',
    rectifying: '整改中',
    completed: '已完成'
  };
  return map[status];
};

export const getInspectionStatusColor = (status: InspectionStatus): string => {
  const map: Record<InspectionStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    rectifying: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  };
  return map[status];
};

export const calculateCapacity = (area: number, type: PlaceType): number => {
  const density: Record<PlaceType, number> = {
    indoor: 0.5,
    outdoor: 2,
    comprehensive: 1
  };
  return Math.floor(area * density[type]);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const daysUntilExpire = (expireDate: string): number => {
  const today = new Date();
  const expire = new Date(expireDate);
  const diffTime = expire.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
