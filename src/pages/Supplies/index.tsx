import { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  Download,
  Upload,
  Building2,
  Calendar,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  Trash2,
  History,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { formatDate, daysUntilExpire, generateId } from '../../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { SupplyTransactionType } from '../../types';

export default function Supplies() {
  const { supplies, places, supplyTransactions, addSupplyTransaction, updateSupply } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [placeFilter, setPlaceFilter] = useState('');
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<typeof supplies[0] | null>(null);
  const [transactionType, setTransactionType] = useState<SupplyTransactionType>('in');
  const [transactionQuantity, setTransactionQuantity] = useState(1);
  const [transactionRemark, setTransactionRemark] = useState('');
  const [operator, setOperator] = useState('管理员');

  const categories = [...new Set(supplies.map(s => s.category))];

  const filteredSupplies = supplies.filter(supply => {
    const matchSearch = supply.name.includes(searchTerm);
    const matchCategory = !categoryFilter || supply.category === categoryFilter;
    const matchStatus = !statusFilter || supply.status === statusFilter;
    const matchPlace = !placeFilter || supply.placeId === placeFilter;
    return matchSearch && matchCategory && matchStatus && matchPlace;
  });

  const supplyTransactionsForSelected = useMemo(() => {
    if (!selectedSupply) return [];
    return supplyTransactions.filter(t => t.supplyId === selectedSupply.id).sort((a, b) => 
      new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );
  }, [selectedSupply, supplyTransactions]);

  const handleOpenTransaction = (supply: typeof supplies[0], type: SupplyTransactionType) => {
    setSelectedSupply(supply);
    setTransactionType(type);
    setTransactionQuantity(1);
    setTransactionRemark('');
    setShowTransactionModal(true);
  };

  const handleOpenHistory = (supply: typeof supplies[0]) => {
    setSelectedSupply(supply);
    setShowHistoryModal(true);
  };

  const handleSubmitTransaction = () => {
    if (!selectedSupply || transactionQuantity <= 0) return;

    let newQuantity = selectedSupply.quantity;
    if (transactionType === 'in') {
      newQuantity += transactionQuantity;
    } else if (transactionType === 'out' || transactionType === 'scrap') {
      newQuantity = Math.max(0, newQuantity - transactionQuantity);
    }

    const transaction = {
      id: generateId(),
      supplyId: selectedSupply.id,
      placeId: selectedSupply.placeId,
      type: transactionType,
      quantity: transactionQuantity,
      operator,
      remark: transactionRemark,
      createTime: new Date().toISOString()
    };

    addSupplyTransaction(transaction);
    updateSupply({ ...selectedSupply, quantity: newQuantity });

    setShowTransactionModal(false);
    setSelectedSupply(null);
  };

  const expiringCount = supplies.filter(s => s.status === 'expiring').length;
  const expiredCount = supplies.filter(s => s.status === 'expired').length;
  const totalValue = supplies.reduce((sum, s) => sum + s.quantity, 0);

  const categoryData = categories.map(cat => ({
    name: cat,
    value: supplies.filter(s => s.category === cat).reduce((sum, s) => sum + s.quantity, 0)
  }));

  const placeSupplyData = places.map(place => ({
    name: place.name.substring(0, 6),
    物资数量: supplies.filter(s => s.placeId === place.id).length
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const getPlaceName = (placeId: string) => {
    const place = places.find(p => p.id === placeId);
    return place ? place.name : '未知场所';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">物资清单</h1>
          <p className="text-gray-500 mt-1">应急物资库存管理与到期提醒</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="w-5 h-5" />
            数据导入
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
            新增物资
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">物资总数</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{supplies.length}</p>
              <p className="text-sm text-gray-400 mt-1">个品类</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-xl">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">库存总量</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalValue.toLocaleString()}</p>
              <p className="text-sm text-gray-400 mt-1">件</p>
            </div>
            <div className="p-4 bg-green-100 rounded-xl">
              <ArrowUpDown className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">即将到期</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{expiringCount}</p>
              <p className="text-sm text-yellow-600 mt-1">项需关注</p>
            </div>
            <div className="p-4 bg-yellow-100 rounded-xl">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">已过期</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{expiredCount}</p>
              <p className="text-sm text-red-600 mt-1">项需处理</p>
            </div>
            <div className="p-4 bg-red-100 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">物资分类统计</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">各场所物资分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={placeSupplyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="物资数量" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
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
                placeholder="搜索物资名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">全部分类</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">全部状态</option>
              <option value="normal">正常</option>
              <option value="expiring">即将到期</option>
              <option value="expired">已过期</option>
            </select>

            <select
              value={placeFilter}
              onChange={(e) => setPlaceFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">全部场所</option>
              {places.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-5 h-5" />
            导出
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">物资信息</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">分类</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">库存数量</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">所属场所</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">有效期</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">状态</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSupplies.map((supply) => {
                const daysLeft = daysUntilExpire(supply.expireDate);
                return (
                  <tr key={supply.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{supply.name}</p>
                          <p className="text-sm text-gray-500">ID: {supply.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                        {supply.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-900">{supply.quantity.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{supply.unit}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm">{getPlaceName(supply.placeId)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">{formatDate(supply.expireDate)}</p>
                          {supply.status !== 'normal' && (
                            <p className={`text-xs ${supply.status === 'expired' ? 'text-red-600' : 'text-yellow-600'}`}>
                              {supply.status === 'expired' ? `已过期 ${Math.abs(daysLeft)} 天` : `还剩 ${daysLeft} 天`}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge type="supply" status={supply.status} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenTransaction(supply, 'in')}
                          className="px-2 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded transition-colors flex items-center gap-1"
                          title="入库"
                        >
                          <ArrowDownCircle className="w-4 h-4" />
                          入库
                        </button>
                        <button
                          onClick={() => handleOpenTransaction(supply, 'out')}
                          className="px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center gap-1"
                          title="出库"
                        >
                          <ArrowUpCircle className="w-4 h-4" />
                          出库
                        </button>
                        <button
                          onClick={() => handleOpenTransaction(supply, 'scrap')}
                          className="px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                          title="报废"
                        >
                          <Trash2 className="w-4 h-4" />
                          报废
                        </button>
                        <button
                          onClick={() => handleOpenHistory(supply)}
                          className="px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors flex items-center gap-1"
                          title="流水记录"
                        >
                          <History className="w-4 h-4" />
                          流水
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">共 {filteredSupplies.length} 条记录</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50">上一页</button>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">1</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50">下一页</button>
          </div>
        </div>
      </div>

      {(expiringCount > 0 || expiredCount > 0) && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">物资到期提醒</h4>
              <p className="text-gray-600 mt-1">
                共有 <span className="font-semibold text-yellow-600">{expiringCount}</span> 项物资即将到期，
                <span className="font-semibold text-red-600">{expiredCount}</span> 项物资已过期，请及时处理。
              </p>
              <div className="mt-4 flex gap-3">
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                  查看全部
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm">
                  生成采购计划
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTransactionModal && selectedSupply && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {transactionType === 'in' && '物资入库'}
                {transactionType === 'out' && '物资出库'}
                {transactionType === 'scrap' && '物资报废'}
              </h3>
              <button
                onClick={() => {
                  setShowTransactionModal(false);
                  setSelectedSupply(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">物资名称</p>
                <p className="font-medium text-gray-900">{selectedSupply.name}</p>
                <p className="text-sm text-gray-500 mt-2">当前库存</p>
                <p className="font-semibold text-gray-900">{selectedSupply.quantity.toLocaleString()} {selectedSupply.unit}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">操作类型</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTransactionType('in')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                      transactionType === 'in'
                        ? 'bg-green-100 text-green-700 border-2 border-green-500'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <ArrowDownCircle className="w-4 h-4" />
                    入库
                  </button>
                  <button
                    onClick={() => setTransactionType('out')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                      transactionType === 'out'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    出库
                  </button>
                  <button
                    onClick={() => setTransactionType('scrap')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                      transactionType === 'scrap'
                        ? 'bg-red-100 text-red-700 border-2 border-red-500'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    报废
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                <input
                  type="number"
                  min="1"
                  value={transactionQuantity}
                  onChange={(e) => setTransactionQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">操作人</label>
                <input
                  type="text"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={transactionRemark}
                  onChange={(e) => setTransactionRemark(e.target.value)}
                  rows={3}
                  placeholder="请输入备注说明..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowTransactionModal(false);
                  setSelectedSupply(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitTransaction}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  transactionType === 'in'
                    ? 'bg-green-600 hover:bg-green-700'
                    : transactionType === 'out'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && selectedSupply && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">库存流水记录</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedSupply.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedSupply(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {supplyTransactionsForSelected.length === 0 ? (
                <div className="p-12 text-center">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无流水记录</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">时间</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">类型</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">数量</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">操作人</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {supplyTransactionsForSelected.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">{formatDate(t.createTime)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            t.type === 'in'
                              ? 'bg-green-100 text-green-700'
                              : t.type === 'out'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {t.type === 'in' && <TrendingUp className="w-3 h-3" />}
                            {t.type === 'out' && <TrendingDown className="w-3 h-3" />}
                            {t.type === 'scrap' && <Trash2 className="w-3 h-3" />}
                            {t.type === 'in' ? '入库' : t.type === 'out' ? '出库' : '报废'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${
                            t.type === 'in' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {t.type === 'in' ? '+' : '-'}{t.quantity.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{t.operator}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{t.remark || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-500">共 {supplyTransactionsForSelected.length} 条记录</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
