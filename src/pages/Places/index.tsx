import { useState } from 'react';
import { useAppStore } from '../../store';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Building2,
  Plus,
  Search,
  Map,
  List,
  Filter,
  Eye,
  Edit,
  Trash2,
  Phone,
  User,
  MapPin,
  Square,
  Users,
  Accessibility
} from 'lucide-react';
import { getPlaceTypeText, formatDate } from '../../utils';

type ViewMode = 'list' | 'map';

export default function Places() {
  const { places } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const districts = [...new Set(places.map(p => p.district))];

  const filteredPlaces = places.filter(place => {
    const matchSearch = place.name.includes(searchTerm) || place.address.includes(searchTerm);
    const matchDistrict = !districtFilter || place.district === districtFilter;
    const matchType = !typeFilter || place.type === typeFilter;
    const matchStatus = !statusFilter || place.status === statusFilter;
    return matchSearch && matchDistrict && matchType && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">场所台账</h1>
          <p className="text-gray-500 mt-1">管理全市应急避难场所基础信息</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
          新增场所
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索场所名称、地址..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">全部区域</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">全部类型</option>
              <option value="indoor">室内</option>
              <option value="outdoor">室外</option>
              <option value="comprehensive">综合</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">全部状态</option>
              <option value="normal">正常</option>
              <option value="open">开放中</option>
              <option value="maintenance">维护中</option>
              <option value="closed">已关闭</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Map className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">场所信息</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">区域</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">类型</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">面积/容量</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">无障碍</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">状态</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">更新时间</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPlaces.map((place) => (
                  <tr key={place.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{place.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {place.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{place.district}</td>
                    <td className="py-4 px-6 text-gray-600">{getPlaceTypeText(place.type)}</td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <p className="text-gray-600 flex items-center gap-1">
                          <Square className="w-3.5 h-3.5" />
                          {place.area.toLocaleString()} ㎡
                        </p>
                        <p className="text-gray-600 flex items-center gap-1 mt-1">
                          <Users className="w-3.5 h-3.5" />
                          {place.capacity.toLocaleString()} 人
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {place.accessible ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                          <Accessibility className="w-4 h-4" />
                          支持
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">不支持</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge type="place" status={place.status} />
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm">{place.updatedAt}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">共 {filteredPlaces.length} 条记录</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50">上一页</button>
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">1</button>
              <button className="px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50">下一页</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
            <div className="text-center">
              <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">地图视图</p>
              <p className="text-gray-400 text-sm mt-1">集成地图服务后将显示场所位置分布</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {filteredPlaces.map((place) => (
              <div key={place.id} className="p-4 border border-gray-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <StatusBadge type="place" status={place.status} />
                </div>
                <h4 className="font-medium text-gray-900 mt-3">{place.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{place.district}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {place.capacity.toLocaleString()}人
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {place.phone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">负责人通讯录</h4>
          <div className="space-y-3">
            {places.slice(0, 4).map((place) => (
              <div key={place.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {place.manager.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{place.manager}</p>
                  <p className="text-xs text-gray-500">{place.name}</p>
                </div>
                <Phone className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
          <h4 className="font-semibold text-gray-900 mb-4">设施配置统计</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['应急照明', '供水设施', '医疗站', '通讯设备', '卫生间', '住宿区', '物资仓库', '无障碍通道'].map((item, idx) => {
              const count = places.filter(p => p.facilities.includes(item)).length;
              return (
                <div key={item} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                  <p className="text-sm text-gray-600 mt-1">{item}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
