import { useAppStore } from '../../store';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Building2,
  Users,
  Package,
  AlertTriangle,
  MapPin,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getPlaceTypeText, formatDate } from '../../utils';

export default function Dashboard() {
  const { places, supplies, inspections, personRecords, drills } = useAppStore();

  const totalCapacity = places.reduce((sum, p) => sum + p.capacity, 0);
  const currentPeople = places.reduce((sum, p) => sum + (p.currentPeople || 0), 0);
  const expiringSupplies = supplies.filter(s => s.status !== 'normal').length;
  const pendingInspections = inspections.filter(i => i.status !== 'completed').length;

  const districtData = places.reduce((acc, place) => {
    acc[place.district] = (acc[place.district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barChartData = Object.entries(districtData).map(([name, count]) => ({ name, 场所数: count }));

  const typeData = places.reduce((acc, place) => {
    acc[place.type] = (acc[place.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(typeData).map(([name, value]) => ({
    name: getPlaceTypeText(name as any),
    value
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  const recentPlaces = places.slice(0, 5);
  const recentDrills = drills.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">数据概览</h1>
        <p className="text-gray-500 mt-1">城市应急避难场所管理平台 - 实时数据监控</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="避难场所总数"
          value={places.length}
          icon={Building2}
          color="blue"
          trend="较上月 +2"
          trendUp
        />
        <StatCard
          title="总容纳人数"
          value={totalCapacity.toLocaleString()}
          icon={Users}
          color="green"
          trend={`当前在院 ${currentPeople}`}
        />
        <StatCard
          title="物资种类"
          value={supplies.length}
          icon={Package}
          color="purple"
          trend={`${expiringSupplies} 项即将过期`}
          trendUp={false}
        />
        <StatCard
          title="待处理问题"
          value={pendingInspections}
          icon={AlertTriangle}
          color="orange"
          trend="需及时整改"
          trendUp={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">各行政区场所分布</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="场所数" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">场所类型分布</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieChartData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">最近场所动态</h3>
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentPlaces.map((place) => (
              <div key={place.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{place.name}</p>
                    <p className="text-sm text-gray-500">{place.district}</p>
                  </div>
                </div>
                <StatusBadge type="place" status={place.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">近期演练记录</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentDrills.map((drill) => (
              <div key={drill.id} className="p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{drill.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(drill.date)} · {drill.participants}人参与</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{drill.evaluation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">当前在院人员统计</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">场所名称</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">所在区域</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">设计容量</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">当前人数</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">使用率</th>
              </tr>
            </thead>
            <tbody>
              {places.filter(p => p.currentPeople && p.currentPeople > 0).map((place) => (
                <tr key={place.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{place.name}</td>
                  <td className="py-3 px-4 text-gray-600">{place.district}</td>
                  <td className="py-3 px-4"><StatusBadge type="place" status={place.status} /></td>
                  <td className="py-3 px-4 text-gray-600">{place.capacity.toLocaleString()}人</td>
                  <td className="py-3 px-4 text-gray-900 font-medium">{place.currentPeople?.toLocaleString()}人</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, ((place.currentPeople || 0) / place.capacity) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {Math.round(((place.currentPeople || 0) / place.capacity) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
