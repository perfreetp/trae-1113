import { useState } from 'react';
import { useAppStore } from '../../store';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Radio,
  Plus,
  Users,
  Clock,
  UserPlus,
  UserMinus,
  Building2,
  MapPin,
  Phone,
  User,
  Send,
  AlertCircle,
  CheckCircle,
  X,
  StopCircle,
  Calendar,
  UserCheck
} from 'lucide-react';
import { formatDateTime, generateId } from '../../utils';
import type { DispatchOrder, PersonRecord } from '../../types';

export default function Dispatch() {
  const {
    places,
    dispatchOrders,
    personRecords,
    addDispatchOrder,
    addPersonRecord,
    deletePersonRecord,
    checkOutPersonRecord,
    checkOutAllByPlaceId,
    updatePlace,
    updateDispatchOrder
  } = useAppStore();

  const [selectedPlace, setSelectedPlace] = useState<string>('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCheckOutConfirmModal, setShowCheckOutConfirmModal] = useState(false);
  const [pendingClosePlaceId, setPendingClosePlaceId] = useState('');
  const [pendingCloseReason, setPendingCloseReason] = useState('');

  const [orderPlaceId, setOrderPlaceId] = useState('');
  const [orderType, setOrderType] = useState<'open' | 'close'>('open');
  const [orderReason, setOrderReason] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerIdCard, setRegisterIdCard] = useState('');

  const openPlaces = places.filter(p => p.status === 'open');
  const placePersonRecords = selectedPlace 
    ? personRecords.filter(r => r.placeId === selectedPlace && !r.checkOutTime)
    : [];

  const selectedPlaceData = places.find(p => p.id === selectedPlace);
  const currentPeople = selectedPlaceData?.currentPeople || 0;
  const capacity = selectedPlaceData?.capacity || 0;
  const utilization = capacity > 0 ? Math.round((currentPeople / capacity) * 100) : 0;

  const getPendingCheckOutRecords = (placeId: string) => {
    return personRecords.filter(r => r.placeId === placeId && !r.checkOutTime);
  };

  const handlePublishOrder = () => {
    if (!orderPlaceId || !orderReason.trim()) {
      alert('请选择场所并填写指令原因');
      return;
    }

    if (orderType === 'close') {
      const pendingRecords = getPendingCheckOutRecords(orderPlaceId);
      if (pendingRecords.length > 0) {
        setPendingClosePlaceId(orderPlaceId);
        setPendingCloseReason(orderReason);
        setShowOrderModal(false);
        setShowCheckOutConfirmModal(true);
        return;
      }
    }

    executePublishOrder(orderPlaceId, orderType, orderReason);
  };

  const executePublishOrder = (placeId: string, type: 'open' | 'close', reason: string) => {
    const newOrder: DispatchOrder = {
      id: generateId(),
      placeId: placeId,
      type: type,
      reason: reason,
      createTime: new Date().toISOString(),
      executeTime: new Date().toISOString(),
      operator: '系统管理员',
      status: 'active'
    };

    addDispatchOrder(newOrder);

    const place = places.find(p => p.id === placeId);
    if (place) {
      const updatedPlace = {
        ...place,
        status: (type === 'open' ? 'open' : 'closed') as 'open' | 'closed',
        currentPeople: type === 'close' ? 0 : place.currentPeople
      };
      updatePlace(updatedPlace);

      if (type === 'close') {
        checkOutAllByPlaceId(placeId);
      }
    }

    setOrderPlaceId('');
    setOrderType('open');
    setOrderReason('');
    setShowOrderModal(false);
    setShowCheckOutConfirmModal(false);
    setPendingClosePlaceId('');
    setPendingCloseReason('');
  };

  const confirmCloseWithCheckOut = () => {
    executePublishOrder(pendingClosePlaceId, 'close', pendingCloseReason);
  };

  const handleEndOrder = (orderId: string) => {
    if (!confirm('确认结束该指令吗？结束后指令状态将变为已过期。')) {
      return;
    }

    const order = dispatchOrders.find(o => o.id === orderId);
    if (order) {
      updateDispatchOrder({
        ...order,
        status: 'expired',
        endTime: new Date().toISOString()
      });
    }
  };

  const handleRegister = () => {
    if (!registerName.trim()) {
      alert('请输入姓名');
      return;
    }

    if (!selectedPlace) {
      alert('请先选择场所');
      return;
    }

    const newRecord: PersonRecord = {
      id: generateId(),
      placeId: selectedPlace,
      name: registerName,
      idCard: registerIdCard || undefined,
      checkInTime: new Date().toISOString(),
      checkOutTime: undefined
    };

    addPersonRecord(newRecord);

    const place = places.find(p => p.id === selectedPlace);
    if (place) {
      updatePlace({
        ...place,
        currentPeople: (place.currentPeople || 0) + 1
      });
    }

    setRegisterName('');
    setRegisterIdCard('');
    setShowRegisterModal(false);
  };

  const handleCheckOut = (recordId: string) => {
    if (!confirm('确认签出该人员吗？')) {
      return;
    }

    checkOutPersonRecord(recordId);

    if (selectedPlace) {
      const place = places.find(p => p.id === selectedPlace);
      if (place) {
        updatePlace({
          ...place,
          currentPeople: Math.max(0, (place.currentPeople || 0) - 1)
        });
      }
    }
  };

  const pendingRecords = pendingClosePlaceId ? getPendingCheckOutRecords(pendingClosePlaceId) : [];
  const pendingClosePlace = pendingClosePlaceId ? places.find(p => p.id === pendingClosePlaceId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">开放调度</h1>
          <p className="text-gray-500 mt-1">发布开放指令与人员接纳登记管理</p>
        </div>
        <button
          onClick={() => setShowOrderModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          发布指令
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">已开放场所</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{openPlaces.length}</p>
              <p className="text-sm text-gray-400 mt-1">个</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-xl">
              <Radio className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">当前在院</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {places.reduce((sum, p) => sum + (p.currentPeople || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-400 mt-1">人</p>
            </div>
            <div className="p-4 bg-green-100 rounded-xl">
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">活跃指令</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {dispatchOrders.filter(o => o.status === 'active').length}
              </p>
              <p className="text-sm text-gray-400 mt-1">条</p>
            </div>
            <div className="p-4 bg-orange-100 rounded-xl">
              <Send className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">今日登记</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{personRecords.length}</p>
              <p className="text-sm text-gray-400 mt-1">人次</p>
            </div>
            <div className="p-4 bg-purple-100 rounded-xl">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">选择场所</h3>
          <div className="space-y-2">
            {places.map((place) => (
              <button
                key={place.id}
                onClick={() => setSelectedPlace(place.id)}
                className={`w-full p-4 rounded-lg border transition-all text-left ${
                  selectedPlace === place.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      place.status === 'open' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Building2 className={`w-5 h-5 ${
                        place.status === 'open' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{place.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {place.district}
                      </p>
                    </div>
                  </div>
                  <StatusBadge type="place" status={place.status} />
                </div>
                <div className="mt-3 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{place.currentPeople || 0}</span> / {place.capacity} 人
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedPlaceData ? (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedPlaceData.name}</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      disabled={selectedPlaceData.status !== 'open'}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                        selectedPlaceData.status === 'open'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                      人员登记
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">当前人数</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{currentPeople.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">设计容量</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{capacity.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">使用率</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      utilization > 80 ? 'text-red-600' : utilization > 50 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {utilization}%
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">负责人</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">{selectedPlaceData.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">容量使用进度</span>
                    <span className="font-medium">{utilization}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        utilization > 80 ? 'bg-red-500' : utilization > 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">当前在院人员</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">姓名</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">证件号码</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">登记时间</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {placePersonRecords.length > 0 ? (
                        placePersonRecords.map((record) => (
                          <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="font-medium text-gray-900">{record.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 text-sm">{record.idCard || '-'}</td>
                            <td className="py-3 px-4 text-gray-600 text-sm">{formatDateTime(record.checkInTime)}</td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleCheckOut(record.id)}
                                className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                              >
                                <UserMinus className="w-4 h-4" />
                                签出
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-400">
                            暂无在院人员记录
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">请选择一个场所查看详情</p>
              <p className="text-gray-400 text-sm mt-1">从左侧列表选择场所进行管理</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">调度指令记录</h3>
        <div className="space-y-4">
          {dispatchOrders.length > 0 ? (
            dispatchOrders.map((order) => {
              const place = places.find(p => p.id === order.placeId);
              return (
                <div
                  key={order.id}
                  className={`p-4 rounded-lg border ${
                    order.type === 'open' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        order.type === 'open' ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {order.type === 'open' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-gray-900">
                            {order.type === 'open' ? '开放指令' : '关闭指令'}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status === 'active' ? '执行中' : '已结束'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          场所：{place?.name || '未知'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{order.reason}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            发布时间：{formatDateTime(order.createTime)}
                          </span>
                          {order.executeTime && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              执行时间：{formatDateTime(order.executeTime)}
                            </span>
                          )}
                          {order.endTime && (
                            <span className="flex items-center gap-1">
                              <StopCircle className="w-3.5 h-3.5" />
                              结束时间：{formatDateTime(order.endTime)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            操作人：{order.operator}
                          </span>
                        </div>
                      </div>
                    </div>
                    {order.status === 'active' && (
                      <button
                        onClick={() => handleEndOrder(order.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <StopCircle className="w-4 h-4" />
                        结束指令
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-gray-400">
              <Send className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无调度指令记录</p>
            </div>
          )}
        </div>
      </div>

      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">发布调度指令</h3>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setOrderPlaceId('');
                  setOrderType('open');
                  setOrderReason('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择场所</label>
                <select
                  value={orderPlaceId}
                  onChange={(e) => setOrderPlaceId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择场所</option>
                  {places.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">指令类型</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as 'open' | 'close')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="open">开放场所</option>
                  <option value="close">关闭场所</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">指令原因</label>
                <textarea
                  rows={3}
                  value={orderReason}
                  onChange={(e) => setOrderReason(e.target.value)}
                  placeholder="请输入指令原因..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setOrderPlaceId('');
                  setOrderType('open');
                  setOrderReason('');
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handlePublishOrder}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                发布指令
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckOutConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">确认关闭场所</h3>
                <p className="text-sm text-gray-500 mt-1">该场所当前有在院人员，请确认后统一签出</p>
              </div>
              <button
                onClick={() => {
                  setShowCheckOutConfirmModal(false);
                  setPendingClosePlaceId('');
                  setPendingCloseReason('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-800">
                      {pendingClosePlace?.name}
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      当前有 <span className="font-bold">{pendingRecords.length}</span> 名在院人员，关闭后将全部自动签出
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">姓名</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">证件号</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">登记时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRecords.map((record) => (
                      <tr key={record.id} className="border-t border-gray-100">
                        <td className="py-2 px-3 text-sm font-medium text-gray-900">{record.name}</td>
                        <td className="py-2 px-3 text-sm text-gray-600">{record.idCard || '-'}</td>
                        <td className="py-2 px-3 text-sm text-gray-500">{formatDateTime(record.checkInTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowCheckOutConfirmModal(false);
                  setPendingClosePlaceId('');
                  setPendingCloseReason('');
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmCloseWithCheckOut}
                className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                确认签出并关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">人员登记</h3>
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setRegisterName('');
                  setRegisterIdCard('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="请输入姓名"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">身份证号（选填）</label>
                <input
                  type="text"
                  value={registerIdCard}
                  onChange={(e) => setRegisterIdCard(e.target.value)}
                  placeholder="请输入身份证号"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setRegisterName('');
                  setRegisterIdCard('');
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRegister}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                确认登记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
