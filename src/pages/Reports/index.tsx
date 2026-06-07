import { useState } from 'react';
import { useAppStore } from '../../store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  FileBarChart,
  Download,
  Filter,
  Calendar,
  MapPin,
  Building2,
  Package,
  Users,
  AlertTriangle,
  ClipboardList,
  TrendingUp,
  FileText
} from 'lucide-react';
import { getPlaceTypeText, formatDate, getSupplyStatusText } from '../../utils';

export default function Reports() {
  const { places, supplies, inspections, drills, personRecords } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('year');

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const districtCapacityData = places.map(place => ({
    name: place.name,
    设计容量: place.capacity,
    当前人数: place.currentPeople || 0
  }));

  const supplyCategoryData = supplies.reduce((acc, supply) => {
    acc[supply.category] = (acc[supply.category] || 0) + supply.quantity;
    return acc;
  }, {} as Record<string, number>);

  const supplyPieData = Object.entries(supplyCategoryData).map(([name, value]) => ({
    name,
    value
  }));

  const monthlyTrendData = [
    { month: '1月', 新增场所: 1, 巡检次数: 8, 演练次数: 2 },
    { month: '2月', 新增场所: 0, 巡检次数: 6, 演练次数: 1 },
    { month: '3月', 新增场所: 2, 巡检次数: 10, 演练次数: 3 },
    { month: '4月', 新增场所: 1, 巡检次数: 7, 演练次数: 2 },
    { month: '5月', 新增场所: 0, 巡检次数: 12, 演练次数: 4 },
    { month: '6月', 新增场所: 1, 巡检次数: 9, 演练次数: 2 }
  ];

  const districtStats = places.reduce((acc, place) => {
    if (!acc[place.district]) {
      acc[place.district] = { count: 0, capacity: 0, area: 0 };
    }
    acc[place.district].count++;
    acc[place.district].capacity += place.capacity;
    acc[place.district].area += place.area;
    return acc;
  }, {} as Record<string, { count: number; capacity: number; area: number }>);

  const districtTableData = Object.entries(districtStats).map(([district, stats]) => ({
    district,
    ...stats
  }));

  const inspectionStatusData = [
    { name: '已完成', value: inspections.filter(i => i.status === 'completed').length },
    { name: '待整改', value: inspections.filter(i => i.status === 'pending').length },
    { name: '整改中', value: inspections.filter(i => i.status === 'in_progress').length }
  ];

  const radarData = places.slice(0, 5).map(place => ({
    subject: place.name.substring(0, 4),
    容量: Math.round(place.capacity / 100),
    设施: place.facilities.length * 20,
    物资: Math.round((supplies.filter(s => s.placeId === place.id).length / 5) * 100),
    巡检: place.status === 'normal' ? 90 : 70,
    演练: drills.filter(d => d.placeId === place.id).length * 25
  }));

  const typeStats = places.reduce((acc, place) => {
    acc[place.type] = (acc[place.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typePieData = Object.entries(typeStats).map(([type, count]) => ({
    name: getPlaceTypeText(type as any),
    value: count
  }));

  const tabs = [
    { id: 'overview', label: '综合概览', icon: FileBarChart },
    { id: 'places', label: '场所统计', icon: Building2 },
    { id: 'supplies', label: '物资统计', icon: Package },
    { id: 'inspection', label: '巡检统计', icon: ClipboardList },
    { id: 'drill', label: '演练统计', icon: TrendingUp }
  ];

  const exportReport = (type: string) => {
    alert(`正在导出${type}报表...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报表中心</h1>
          <p className="text-gray-500 mt-1">多维度数据分析与分级统计报表</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="month">本月</option>
            <option value="quarter">本季度</option>
            <option value="year">本年</option>
            <option value="all">全部</option>
          </select>
          <button
            onClick={() => exportReport('综合报表')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="w-5 h-5" />
            导出报表
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">场所总数</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{places.length}</p>
                </div>
                <div className="p-4 bg-blue-100 rounded-xl">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  较上月 +12%
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">总容纳人数</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {places.reduce((s, p) => s + p.capacity, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-green-100 rounded-xl">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  当前在院 {places.reduce((s, p) => s + (p.currentPeople || 0), 0).toLocaleString()} 人
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">物资总数</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {supplies.reduce((s, item) => s + item.quantity, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-purple-100 rounded-xl">
                  <Package className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-orange-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {supplies.filter(s => s.status !== 'normal').length} 项需关注
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">巡检完成率</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {inspections.length > 0
                      ? Math.round((inspections.filter(i => i.status === 'completed').length / inspections.length) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="p-4 bg-orange-100 rounded-xl">
                  <ClipboardList className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  共 {inspections.length} 次巡检
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">各行政区容量对比</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtCapacityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="设计容量" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="当前人数" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">月度工作趋势</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="新增场所" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                    <Line type="monotone" dataKey="巡检次数" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                    <Line type="monotone" dataKey="演练次数" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">场所类型分布</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {typePieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {typePieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">巡检状态分布</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inspectionStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {inspectionStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#10b981', '#f59e0b', '#3b82f6'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {inspectionStatusData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'][index] }}></div>
                    <span className="text-sm text-gray-600">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">场所综合评估</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} />
                    <Radar name="场所" dataKey="容量" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Radar name="设施" dataKey="设施" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Radar name="物资" dataKey="物资" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'places' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">各行政区场所统计</h3>
              <button
                onClick={() => exportReport('场所统计')}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                导出
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">行政区</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">场所数量</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">总容量</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">总面积(㎡)</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">平均容量</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">占比</th>
                  </tr>
                </thead>
                <tbody>
                  {districtTableData.map((item) => (
                    <tr key={item.district} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        {item.district}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{item.count} 个</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">{item.capacity.toLocaleString()} 人</td>
                      <td className="py-3 px-4 text-gray-600">{item.area.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600">{Math.round(item.capacity / item.count).toLocaleString()} 人</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(item.count / places.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.round((item.count / places.length) * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">场所详情列表</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">场所名称</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">类型</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">行政区</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">容量</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">面积(㎡)</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">设施数</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {places.map((place) => (
                    <tr key={place.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{place.name}</td>
                      <td className="py-3 px-4 text-gray-600">{getPlaceTypeText(place.type)}</td>
                      <td className="py-3 px-4 text-gray-600">{place.district}</td>
                      <td className="py-3 px-4 text-gray-600">{place.capacity.toLocaleString()} 人</td>
                      <td className="py-3 px-4 text-gray-600">{place.area.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600">{place.facilities.length} 项</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          place.status === 'normal' ? 'bg-green-100 text-green-700' :
                          place.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {place.status === 'normal' ? '正常' : place.status === 'maintenance' ? '维护中' : '关闭'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'supplies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">物资分类统计</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={supplyPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {supplyPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {supplyPieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">物资状态统计</h3>
              <div className="space-y-4">
                {['normal', 'expiring', 'expired'].map((status) => {
                  const count = supplies.filter(s => s.status === status).length;
                  const total = supplies.length;
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                  const colorMap: Record<string, { bg: string; bar: string; text: string }> = {
                    normal: { bg: 'bg-green-100', bar: 'bg-green-500', text: 'text-green-700' },
                    expiring: { bg: 'bg-yellow-100', bar: 'bg-yellow-500', text: 'text-yellow-700' },
                    expired: { bg: 'bg-red-100', bar: 'bg-red-500', text: 'text-red-700' }
                  };
                  const colors = colorMap[status];
                  return (
                    <div key={status} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                          {getSupplyStatusText(status as any)}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{count} 项</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${colors.bar} rounded-full`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">占比 {percentage}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">物资明细报表</h3>
              <button
                onClick={() => exportReport('物资统计')}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                导出
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">物资名称</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">分类</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">数量</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">单位</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">有效期至</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">所属场所</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {supplies.map((supply) => {
                    const place = places.find(p => p.id === supply.placeId);
                    return (
                      <tr key={supply.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{supply.name}</td>
                        <td className="py-3 px-4 text-gray-600">{supply.category}</td>
                        <td className="py-3 px-4 text-gray-600">{supply.quantity}</td>
                        <td className="py-3 px-4 text-gray-600">{supply.unit}</td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(supply.expiryDate)}</td>
                        <td className="py-3 px-4 text-gray-600">{place?.name || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            supply.status === 'normal' ? 'bg-green-100 text-green-700' :
                            supply.status === 'expiring' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {getSupplyStatusText(supply.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inspection' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">巡检完成情况</h3>
              <div className="space-y-3">
                {[
                  { label: '已完成', count: inspections.filter(i => i.status === 'completed').length, color: 'green' },
                  { label: '整改中', count: inspections.filter(i => i.status === 'in_progress').length, color: 'blue' },
                  { label: '待整改', count: inspections.filter(i => i.status === 'pending').length, color: 'orange' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-gray-600">{item.label}</span>
                    <span className={`text-xl font-bold ${
                      item.color === 'green' ? 'text-green-600' :
                      item.color === 'blue' ? 'text-blue-600' : 'text-orange-600'
                    }`}>{item.count} 次</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">问题类型分布</h3>
              <div className="space-y-2">
                {['设施损坏', '物资缺失', '卫生问题', '安全隐患', '其他'].map((type, idx) => (
                  <div key={type} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                    <span className="text-sm text-gray-600 flex-1">{type}</span>
                    <span className="text-sm font-medium text-gray-900">{Math.floor(Math.random() * 5) + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">整改及时率</h3>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">85%</p>
                <p className="text-sm text-gray-500 mt-2">平均整改时间 2.3 天</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">巡检记录报表</h3>
              <button
                onClick={() => exportReport('巡检统计')}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                导出
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">巡检日期</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">场所名称</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">巡检人员</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">问题描述</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">整改期限</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((inspection) => {
                    const place = places.find(p => p.id === inspection.placeId);
                    return (
                      <tr key={inspection.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{formatDate(inspection.date)}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{place?.name || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{inspection.inspector}</td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{inspection.issues[0] || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(inspection.deadline)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            inspection.status === 'completed' ? 'bg-green-100 text-green-700' :
                            inspection.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {inspection.status === 'completed' ? '已完成' :
                             inspection.status === 'in_progress' ? '整改中' : '待整改'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'drill' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-500 font-medium">演练总次数</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{drills.length}</p>
              <p className="text-sm text-gray-400 mt-1">次</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-500 font-medium">参与总人数</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {drills.reduce((s, d) => s + d.participants, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-400 mt-1">人次</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-500 font-medium">平均参与率</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">78%</p>
              <p className="text-sm text-gray-400 mt-1">签到/报名</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-500 font-medium">平均评分</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">4.6</p>
              <p className="text-sm text-gray-400 mt-1">满分 5 分</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">月度演练统计</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="演练次数" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">演练记录报表</h3>
              <button
                onClick={() => exportReport('演练统计')}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                导出
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">演练名称</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">场所</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">日期</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">参与人数</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">签到人数</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">参与率</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">评分</th>
                  </tr>
                </thead>
                <tbody>
                  {drills.map((drill) => {
                    const place = places.find(p => p.id === drill.placeId);
                    const rate = drill.participants > 0 ? Math.round((drill.signInList.length / drill.participants) * 100) : 0;
                    return (
                      <tr key={drill.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{drill.name}</td>
                        <td className="py-3 px-4 text-gray-600">{place?.name || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(drill.date)}</td>
                        <td className="py-3 px-4 text-gray-600">{drill.participants} 人</td>
                        <td className="py-3 px-4 text-gray-600">{drill.signInList.length} 人</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${rate}%` }}></div>
                            </div>
                            <span className="text-sm text-gray-600">{rate}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            4.6 分
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
