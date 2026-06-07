import { useState } from 'react';
import { useAppStore } from '../../store';
import StatusBadge from '../../components/common/StatusBadge';
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  Wrench,
  Building2,
  Calendar,
  User,
  Camera,
  FileText
} from 'lucide-react';
import { formatDate, getInspectionStatusColor, getInspectionStatusText } from '../../utils';

export default function Inspection() {
  const { inspections, places } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);

  const filteredInspections = inspections.filter(inspection => {
    const place = places.find(p => p.id === inspection.placeId);
    const matchSearch = !searchTerm || 
      place?.name.includes(searchTerm) || 
      inspection.inspector.includes(searchTerm);
    const matchStatus = !statusFilter || inspection.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = inspections.filter(i => i.status === 'pending').length;
  const rectifyingCount = inspections.filter(i => i.status === 'rectifying').length;
  const completedCount = inspections.filter(i => i.status === 'completed').length;

  const getPlaceName = (placeId: string) => {
    const place = places.find(p => p.id === placeId);
    return place ? place.name : '未知场所';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">巡检维护</h1>
          <p className="text-gray-500 mt-1">巡检计划管理与问题整改跟踪</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
          新建巡检
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">巡检总数</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{inspections.length}</p>
              <p className="text-sm text-gray-400 mt-1">次</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-xl">
              <ClipboardCheck className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">待处理</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
              <p className="text-sm text-gray-400 mt-1">项</p>
            </div>
            <div className="p-4 bg-yellow-100 rounded-xl">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">整改中</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{rectifyingCount}</p>
              <p className="text-sm text-gray-400 mt-1">项</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-xl">
              <Wrench className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">已完成</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{completedCount}</p>
              <p className="text-sm text-gray-400 mt-1">项</p>
            </div>
            <div className="p-4 bg-green-100 rounded-xl">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
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
                placeholder="搜索场所、巡检员..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">全部状态</option>
              <option value="pending">待处理</option>
              <option value="rectifying">整改中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredInspections.map((inspection) => {
            const place = places.find(p => p.id === inspection.placeId);
            const isSelected = selectedInspection === inspection.id;

            return (
              <div
                key={inspection.id}
                onClick={() => setSelectedInspection(isSelected ? null : inspection.id)}
                className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 hover:border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      inspection.status === 'completed' ? 'bg-green-100' :
                      inspection.status === 'rectifying' ? 'bg-blue-100' : 'bg-yellow-100'
                    }`}>
                      {inspection.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : inspection.status === 'rectifying' ? (
                        <Wrench className="w-6 h-6 text-blue-600" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900">{place?.name || '未知场所'}</h4>
                        <StatusBadge type="inspection" status={inspection.status} />
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(inspection.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {inspection.inspector}
                        </span>
                      </div>
                      {inspection.issues.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">发现问题：</p>
                          <ul className="space-y-1">
                            {inspection.issues.slice(0, 2).map((issue, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                {issue}
                              </li>
                            ))}
                            {inspection.issues.length > 2 && (
                              <li className="text-sm text-gray-400">+{inspection.issues.length - 2} 项更多问题</li>
                            )}
                          </ul>
                        </div>
                      )}
                      {inspection.rectifyDeadline && (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className="text-orange-600">整改截止：{formatDate(inspection.rectifyDeadline)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                        <FileText className="w-4 h-4" />
                        查看详情
                      </button>
                      <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                        标记完成
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">问题分布统计</h3>
            <div className="space-y-4">
              {[
                { label: '设施设备故障', count: 5, color: 'bg-blue-500' },
                { label: '消防隐患', count: 3, color: 'bg-red-500' },
                { label: '环境卫生', count: 2, color: 'bg-yellow-500' },
                { label: '物资缺失', count: 4, color: 'bg-purple-500' },
                { label: '标识不清', count: 2, color: 'bg-green-500' }
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-900">{item.count} 项</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${(item.count / 16) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">整改时限提醒</h3>
            <div className="space-y-3">
              {inspections
                .filter(i => i.status !== 'completed' && i.rectifyDeadline)
                .sort((a, b) => new Date(a.rectifyDeadline!).getTime() - new Date(b.rectifyDeadline!).getTime())
                .slice(0, 3)
                .map((inspection) => {
                  const place = places.find(p => p.id === inspection.placeId);
                  const daysLeft = Math.ceil((new Date(inspection.rectifyDeadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysLeft <= 3;

                  return (
                    <div
                      key={inspection.id}
                      className={`p-4 rounded-lg border ${
                        isUrgent ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{place?.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{inspection.issues[0]}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          isUrgent ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {daysLeft > 0 ? `剩${daysLeft}天` : '已逾期'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">创建巡检计划</p>
                  <p className="text-xs text-gray-500">安排新的巡检任务</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Camera className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">上传巡检照片</p>
                  <p className="text-xs text-gray-500">记录巡检现场情况</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">生成巡检报告</p>
                  <p className="text-xs text-gray-500">导出巡检统计报表</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
