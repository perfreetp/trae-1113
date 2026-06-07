import { useState } from 'react';
import { useAppStore } from '../../store';
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  Users,
  MapPin,
  Calendar,
  FileText,
  UserCheck,
  Camera,
  Download,
  Building2,
  Clock,
  TrendingUp,
  Star
} from 'lucide-react';
import { formatDate } from '../../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Drills() {
  const { drills, places } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrill, setSelectedDrill] = useState<string | null>(null);

  const filteredDrills = drills.filter(drill => {
    const place = places.find(p => p.id === drill.placeId);
    return !searchTerm || 
      drill.name.includes(searchTerm) || 
      place?.name.includes(searchTerm);
  });

  const totalParticipants = drills.reduce((sum, d) => sum + d.participants, 0);
  const avgParticipants = drills.length > 0 ? Math.round(totalParticipants / drills.length) : 0;

  const monthlyData = [
    { month: '1月', 演练次数: 2, 参与人数: 350 },
    { month: '2月', 演练次数: 1, 参与人数: 180 },
    { month: '3月', 演练次数: 3, 参与人数: 520 },
    { month: '4月', 演练次数: 2, 参与人数: 400 },
    { month: '5月', 演练次数: 4, 参与人数: 680 },
    { month: '6月', 演练次数: 2, 参与人数: 350 }
  ];

  const getPlaceName = (placeId: string) => {
    const place = places.find(p => p.id === placeId);
    return place ? place.name : '未知场所';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">演练记录</h1>
          <p className="text-gray-500 mt-1">应急演练计划管理与效果评估</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
          新建演练
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">演练总数</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{drills.length}</p>
              <p className="text-sm text-gray-400 mt-1">次</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-xl">
              <CalendarCheck className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">参与总人数</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{totalParticipants.toLocaleString()}</p>
              <p className="text-sm text-gray-400 mt-1">人次</p>
            </div>
            <div className="p-4 bg-green-100 rounded-xl">
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">平均参与</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{avgParticipants}</p>
              <p className="text-sm text-gray-400 mt-1">人/次</p>
            </div>
            <div className="p-4 bg-purple-100 rounded-xl">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">平均评分</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">4.6</p>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <div className="p-4 bg-yellow-100 rounded-xl">
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">月度演练统计</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="演练次数" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">参与人数趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="参与人数" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索演练名称、场所..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">全部时间</option>
              <option value="month">本月</option>
              <option value="quarter">本季度</option>
              <option value="year">本年</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-5 h-5" />
            导出
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredDrills.map((drill) => {
          const isSelected = selectedDrill === drill.id;
          const place = places.find(p => p.id === drill.placeId);

          return (
            <div
              key={drill.id}
              onClick={() => setSelectedDrill(isSelected ? null : drill.id)}
              className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 hover:border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CalendarCheck className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{drill.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {place?.name || '未知场所'}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(drill.date)}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {drill.participants} 人参与
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <UserCheck className="w-4 h-4" />
                        {drill.signInList.length} 人签到
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">{drill.evaluation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    已完成
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">签到人员</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {drill.signInList.slice(0, 5).map((name, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white rounded text-sm text-gray-700">
                            {name}
                          </span>
                        ))}
                        {drill.signInList.length > 5 && (
                          <span className="px-2 py-1 bg-gray-200 rounded text-sm text-gray-600">
                            +{drill.signInList.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">演练时长</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">2.5 小时</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">演练评分</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <FileText className="w-4 h-4" />
                      查看详情
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                      <Camera className="w-4 h-4" />
                      照片记录
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                      <Download className="w-4 h-4" />
                      导出报告
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-3 p-6 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">创建演练</p>
              <p className="text-xs text-gray-500 mt-1">新建演练计划</p>
            </div>
          </button>
          <button className="flex flex-col items-center gap-3 p-6 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-200 transition-colors">
            <div className="p-3 bg-green-100 rounded-xl">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">演练签到</p>
              <p className="text-xs text-gray-500 mt-1">扫码或手动签到</p>
            </div>
          </button>
          <button className="flex flex-col items-center gap-3 p-6 border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-colors">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">评估模板</p>
              <p className="text-xs text-gray-500 mt-1">演练效果评估</p>
            </div>
          </button>
          <button className="flex flex-col items-center gap-3 p-6 border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-colors">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">年度计划</p>
              <p className="text-xs text-gray-500 mt-1">查看年度演练安排</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
