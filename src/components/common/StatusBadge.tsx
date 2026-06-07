import { getPlaceStatusText, getPlaceStatusColor, getSupplyStatusText, getSupplyStatusColor, getInspectionStatusText, getInspectionStatusColor } from '../../utils';
import type { PlaceStatus, SupplyStatus, InspectionStatus } from '../../types';

interface StatusBadgeProps {
  type: 'place' | 'supply' | 'inspection';
  status: PlaceStatus | SupplyStatus | InspectionStatus;
}

export default function StatusBadge({ type, status }: StatusBadgeProps) {
  let text = '';
  let colorClass = '';

  if (type === 'place') {
    text = getPlaceStatusText(status as PlaceStatus);
    colorClass = getPlaceStatusColor(status as PlaceStatus);
  } else if (type === 'supply') {
    text = getSupplyStatusText(status as SupplyStatus);
    colorClass = getSupplyStatusColor(status as SupplyStatus);
  } else if (type === 'inspection') {
    text = getInspectionStatusText(status as InspectionStatus);
    colorClass = getInspectionStatusColor(status as InspectionStatus);
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {text}
    </span>
  );
}
