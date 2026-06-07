import { useState } from 'react';
import { useAppStore } from '../../store';
import StatusBadge from '../../components/common/StatusBadge';
import {
  MapPin,
  Search,
  Navigation,
  Phone,
  User,
  Square,
  Users,
  Accessibility,
  Star,
  ThumbsUp,
  MessageSquare,
  Filter,
  Map,
  List,
  Building2,
  Clock,
  Send
} from 'lucide-react';
import { getPlaceTypeText, formatDate, generateId } from '../../utils';
import type { Feedback } from '../../types';

export default function PublicQuery() {
  const { places, feedbacks, addFeedback } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const districts = [...new Set(places.map(p => p.district))];

  const filteredPlaces = places.filter(place => {
    const matchSearch = place.name.includes(searchTerm) || place.address.includes(searchTerm);
    const matchDistrict = !districtFilter || place.district === districtFilter;
    const matchType = !typeFilter || place.type === typeFilter;
    return matchSearch && matchDistrict && matchType;
  });

  const selectedPlaceData = places.find(p => p.id === selectedPlace);
  const placeFeedbacks = feedbacks.filter(f => f.placeId === selectedPlace);

  const getAverageRating = (placeId: string) => {
    const placeFeedback = feedbacks.filter(f => f.placeId === placeId);
    if (placeFeedback.length === 0) return 0;
    return placeFeedback.reduce((sum, f) => sum + f.rating, 0) / placeFeedback.length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">公众查询</h1>
        <p className="text-gray-500 mt-1">面向公众的应急避难场所查询与服务</p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">查找您附近的应急避难场所</h2>
          <p className="text-blue-100 mb-6">快速定位周边避难场所，了解设施配置，获取路线指引</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="输入地址、场所名称搜索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
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
          </div>

          <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {viewMode === 'list' ? (
            filteredPlaces.map((place) => {
              const avgRating = getAverageRating(place.id);
              const isSelected = selectedPlace === place.id;

              return (
                <div
                  key={place.id}
                  onClick={() => setSelectedPlace(isSelected ? null : place.id)}
                  className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{place.name}</h3>
                        <p className="text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {place.address}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <StatusBadge type="place" status={place.status} />
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Square className="w-4 h-4" />
                            {place.area.toLocaleString()} ㎡
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {place.capacity.toLocaleString()} 人
                          </span>
                          {place.accessible && (
                            <span className="text-sm text-green-600 flex items-center gap-1">
                              <Accessibility className="w-4 h-4" />
                              无障碍
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(avgRating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-500 ml-2">
                            {avgRating > 0 ? avgRating.toFixed(1) : '暂无评分'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <Navigation className="w-4 h-4" />
                      导航
                    </button>
                  </div>

                  {isSelected && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-3">设施配置</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {place.facilities.map((facility, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">负责人</p>
                          <p className="font-medium text-gray-900 flex items-center gap-2 mt-1">
                            <User className="w-4 h-4" />
                            {place.manager}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">联系电话</p>
                          <p className="font-medium text-gray-900 flex items-center gap-2 mt-1">
                            <Phone className="w-4 h-4" />
                            {place.phone}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFeedbackModal(true);
                        }}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        提交满意度反馈
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">地图视图</p>
                  <p className="text-gray-400 text-sm mt-1">集成地图服务后将显示场所位置分布</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {filteredPlaces.map((place) => (
                  <div
                    key={place.id}
                    className="p-4 border border-gray-100 rounded-lg hover:border-blue-200 cursor-pointer transition-all"
                  >
                    <h4 className="font-medium text-gray-900">{place.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{place.district}</p>
                    <StatusBadge type="place" status={place.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷入口</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors">
                <Navigation className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">附近的避难场所</p>
                  <p className="text-xs text-blue-600">查看距离您最近的场所</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors">
                <Phone className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">紧急联系电话</p>
                  <p className="text-xs text-green-600">一键拨打应急电话</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors">
                <Clock className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">应急指南</p>
                  <p className="text-xs text-orange-600">学习应急避难知识</p>
                </div>
              </button>
            </div>
          </div>

          {selectedPlaceData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">用户评价</h3>
              <div className="space-y-4">
                {placeFeedbacks.length > 0 ? (
                  placeFeedbacks.map((feedback) => (
                    <div key={feedback.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= feedback.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(feedback.createTime)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{feedback.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无用户评价</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">场所类型说明</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">室内场所</p>
                  <p className="text-xs text-gray-500">如体育馆、学校、会展中心等</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">室外场所</p>
                  <p className="text-xs text-gray-500">如公园、广场、体育场等</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">综合场所</p>
                  <p className="text-xs text-gray-500">兼具室内外功能的大型场所</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">满意度反馈</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">评分</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600 font-medium">{rating} 分</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">评价内容</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="请分享您的使用体验..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setRating(5);
                  setComment('');
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!selectedPlace) return;
                  if (!comment.trim()) {
                    alert('请填写评价内容');
                    return;
                  }
                  const newFeedback: Feedback = {
                    id: generateId(),
                    placeId: selectedPlace,
                    rating,
                    comment,
                    createTime: new Date().toISOString()
                  };
                  addFeedback(newFeedback);
                  setShowFeedbackModal(false);
                  setRating(5);
                  setComment('');
                }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                提交反馈
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
