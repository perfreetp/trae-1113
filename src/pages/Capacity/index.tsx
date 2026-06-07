import { useState } from 'react';
import { useAppStore } from '../../store';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Calculator,
  Users,
  Square,
  AlertTriangle,
  TrendingUp,
  Building2,
  MapPin,
  Info
} from 'lucide-react';
import { calculateCapacity, getPlaceTypeText } from '../../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { PlaceType } from '../../types';

export default function Capacity() {
  const { places } = useAppStore();
  const [area, setArea] = useState<number>(5000);
  const [type, setType] = useState<PlaceType>('indoor');

  const calculatedCapacity = calculateCapacity(area, type);

  const capacityData = places.map(place => ({
    name: place.name.substring(0, 6),
    设计容量: place.capacity,
    当前人数: place.currentPeople || 0
  }));

  const utilizationData = places.map(place => ({
    name: place.name.substring(0, 6),
    使用率: Math.round(((place.currentPeople || 0) / place.capacity) * 100)
  }));

  const totalCapacity = places.reduce((sum, p) => sum + p.capacity, 0);
  const totalCurrent = places.reduce((sum, p) => sum + (p.currentPeople || 0), 0);
  const avgUtilization = totalCapacity > 0 ? Math.round((totalCurrent / totalCapacity) * 100) : 0;
  const overloaded = places.filter(p => (p.currentPeople || 0) / p.capacity > 0.8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">容量评估</h1>
        <p className="text-gray-500 mt-1">避难场所容量测算与负荷分析</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">总设计容量</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalCapacity.toLocaleString()}</p>
              <p className="text-sm text-gray-400 mt-1">人</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-xl">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">当前在院人数</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalCurrent.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">较昨日 +12%</p>
            </div>
            <div className="p-4 bg-green-100 rounded-xl">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">平均使用率</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{avgUtilization}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className={`h-2 rounded-full ${avgUtilization > 80 ? 'bg-red-500' : avgUtilization > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${avgUtilization}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">高负荷场所</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{overloaded.length}</p>
              <p className="text-sm text-gray-400 mt-1">需重点关注</p>
            </div>
            <div className="p-4 bg-orange-100 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">容量测算工具</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">场所面积 (㎡)</label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">场所类型</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PlaceType)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="indoor">室内场所 (0.5人/㎡)</option>
                <option value="outdoor">室外场所 (2人/㎡)</option>
                <option value="comprehensive">综合场所 (1人/㎡)</option>
              </select>
            </div>

            <div className="p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <p className="text-sm text-blue-600 font-medium">测算可容纳人数</p>
              <p className="text-4xl font-bold text-blue-700 mt-2">{calculatedCapacity.toLocaleString()}</p>
              <p className="text-sm text-blue-600 mt-1">人</p>
              <p className="text-xs text-blue-500 mt-3">* 实际容量需根据设施配置调整</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">容量测算标准：</p>
                  <ul className="space-y-1 text-gray-500">
                    <li>• 室内：每人约 2 ㎡</li>
                    <li>• 室外：每人约 0.5 ㎡</li>
                    <li>• 综合：每人约 1 ㎡</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">各场所容量对比</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capacityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="设计容量" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="当前人数" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">场所使用率趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} unit="%" />
                <Tooltip />
                <Line type="monotone" dataKey="使用率" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">负荷预警列表</h3>
          <div className="space-y-3">
            {places.map((place) => {
              const utilization = ((place.currentPeople || 0) / place.capacity) * 100;
              const isWarning = utilization > 80;
              const isCaution = utilization > 50 && utilization <= 80;

              return (
                <div
                  key={place.id}
                  className={`p-4 rounded-lg border ${
                    isWarning ? 'border-red-200 bg-red-50' : isCaution ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isWarning ? 'bg-red-100' : isCaution ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        <Building2 className={`w-5 h-5 ${
                          isWarning ? 'text-red-600' : isCaution ? 'text-yellow-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{place.name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {place.district}
                        </p>
                      </div>
                    </div>
                    <StatusBadge type="place" status={place.status} />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">使用率</span>
                        <span className={`font-medium ${
                          isWarning ? 'text-red-600' : isCaution ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {Math.round(utilization)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isWarning ? 'bg-red-500' : isCaution ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, utilization)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-600">{(place.currentPeople || 0).toLocaleString()} / {place.capacity.toLocaleString()}</p>
                      <p className="text-gray-400">人</p>
                    </div>
                  </div>
                  {isWarning && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>容量接近饱和，建议启动分流预案</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
