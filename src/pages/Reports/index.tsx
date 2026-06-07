import { useState, useMemo } from 'react';
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
  FileText,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Save,
  FolderOpen,
  ArrowUpDown,
  Plus
} from 'lucide-react';
import { getPlaceTypeText, formatDate, getSupplyStatusText, getInspectionStatusText, generateId } from '../../utils';
import type { ReportTemplate } from '../../types';

export default function Reports() {
  const {
    places,
    supplies,
    inspections,
    drills,
    supplyTransactions,
    reportTemplates,
    addReportTemplate,
    deleteReportTemplate
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('');
  const [placeStatusFilter, setPlaceStatusFilter] = useState('');
  const [placeTypeFilter, setPlaceTypeFilter] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportContent, setExportContent] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const districts = [...new Set(places.map((p) => p.district))];

  const getDateRangeFilter = (range: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    switch (range) {
      case 'month':
        return startOfMonth;
      case 'quarter':
        return startOfQuarter;
      case 'year':
        return startOfYear;
      default:
        return null;
    }
  };

  const isInDateRange = (dateStr: string, range: string): boolean => {
    const startDate = getDateRangeFilter(range);
    if (!startDate) return true;
    const date = new Date(dateStr);
    return date >= startDate;
  };

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchDistrict = !districtFilter || place.district === districtFilter;
      const matchStatus = !placeStatusFilter || place.status === placeStatusFilter;
      const matchType = !placeTypeFilter || place.type === placeTypeFilter;
      return matchDistrict && matchStatus && matchType;
    });
  }, [places, districtFilter, placeStatusFilter, placeTypeFilter]);

  const filteredPlaceIds = useMemo(() => {
    return new Set(filteredPlaces.map((p) => p.id));
  }, [filteredPlaces]);

  const filteredSupplies = useMemo(() => {
    return supplies.filter((s) => {
      const matchDate = isInDateRange(s.expireDate, dateRange);
      const matchPlace = filteredPlaceIds.has(s.placeId);
      return matchDate && matchPlace;
    });
  }, [supplies, dateRange, filteredPlaceIds]);

  const filteredInspections = useMemo(() => {
    return inspections.filter((i) => {
      const matchDate = isInDateRange(i.date, dateRange);
      const matchPlace = filteredPlaceIds.has(i.placeId);
      return matchDate && matchPlace;
    });
  }, [inspections, dateRange, filteredPlaceIds]);

  const filteredDrills = useMemo(() => {
    return drills.filter((d) => {
      const matchDate = isInDateRange(d.date, dateRange);
      const matchPlace = filteredPlaceIds.has(d.placeId);
      return matchDate && matchPlace;
    });
  }, [drills, dateRange, filteredPlaceIds]);

  const filteredTransactions = useMemo(() => {
    return supplyTransactions.filter((t) => {
      const matchDate = isInDateRange(t.createTime, dateRange);
      const matchPlace = filteredPlaceIds.has(t.placeId);
      return matchDate && matchPlace;
    });
  }, [supplyTransactions, dateRange, filteredPlaceIds]);

  const districtCapacityData = filteredPlaces.map((place) => ({
    name: place.name.substring(0, 8),
    设计容量: place.capacity,
    当前人数: place.currentPeople || 0
  }));

  const supplyCategoryData = filteredSupplies.reduce((acc, supply) => {
    acc[supply.category] = (acc[supply.category] || 0) + supply.quantity;
    return acc;
  }, {} as Record<string, number>);

  const supplyPieData = Object.entries(supplyCategoryData).map(([name, value]) => ({
    name,
    value
  }));

  const monthlyTrendData = useMemo(() => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const now = new Date();
    const currentMonth = now.getMonth();

    return months.slice(0, currentMonth + 1).map((month, idx) => {
      const monthStart = new Date(now.getFullYear(), idx, 1);
      const monthEnd = new Date(now.getFullYear(), idx + 1, 1);

      const monthInspections = filteredInspections.filter((i) => {
        const d = new Date(i.date);
        return d >= monthStart && d < monthEnd;
      });

      const monthDrills = filteredDrills.filter((d) => {
        const date = new Date(d.date);
        return date >= monthStart && date < monthEnd;
      });

      return {
        month,
        巡检次数: monthInspections.length,
        演练次数: monthDrills.length
      };
    });
  }, [filteredInspections, filteredDrills]);

  const districtStats = filteredPlaces.reduce((acc, place) => {
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
    { name: '已完成', value: filteredInspections.filter((i) => i.status === 'completed').length },
    { name: '待整改', value: filteredInspections.filter((i) => i.status === 'pending').length },
    { name: '整改中', value: filteredInspections.filter((i) => i.status === 'rectifying').length },}
  ];

  const radarData = filteredPlaces.slice(0, 5).map((place) => ({
    subject: place.name.substring(0, 4),
    容量: Math.round(place.capacity / 100),
    设施: place.facilities.length * 20,
    物资: Math.round((filteredSupplies.filter((s) => s.placeId === place.id).length / 5) * 100),
    巡检: place.status === 'normal' ? 90 : 70,
    演练: filteredDrills.filter((d) => d.placeId === place.id).length * 25
  }));

  const typeStats = filteredPlaces.reduce((acc, place) => {
    acc[place.type] = (acc[place.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typePieData = Object.entries(typeStats).map(([type, count]) => ({
    name: getPlaceTypeText(type as any),
    value: count
  }));

  const supplyStatusStats = useMemo(() => {
    const normal = filteredSupplies.filter((s) => s.status === 'normal').length;
    const expiring = filteredSupplies.filter((s) => s.status === 'expiring').length;
    const expired = filteredSupplies.filter((s) => s.status === 'expired').length;
    return { normal, expiring, expired, total: filteredSupplies.length };
  }, [filteredSupplies]);

  const supplyTransactionStats = useMemo(() => {
    const inQty = filteredTransactions.filter((t) => t.type === 'in').reduce((s, t) => s + t.quantity, 0);
    const outQty = filteredTransactions.filter((t) => t.type === 'out').reduce((s, t) => s + t.quantity, 0);
    const scrapQty = filteredTransactions.filter((t) => t.type === 'scrap').reduce((s, t) => s + t.quantity, 0);
    return { inQty, outQty, scrapQty, total: filteredTransactions.length };
  }, [filteredTransactions]);

  const tabs = [
    { id: 'overview', label: '综合概览', icon: FileBarChart },
    { id: 'places', label: '场所统计', icon: Building2 },
    { id: 'supplies', label: '物资统计', icon: Package },
    { id: 'inspection', label: '巡检统计', icon: ClipboardList },
    { id: 'drill', label: '演练统计', icon: TrendingUp }
  ];

  const getFilterSummary = () => {
    const parts: string[] = [];
    if (dateRange !== 'all') parts.push({ month: '本月', quarter: '本季度', year: '本年' }[dateRange] || '全部');
    if (districtFilter) parts.push(districtFilter);
    if (placeStatusFilter) parts.push({ normal: '正常', open: '开放中', closed: '已关闭', maintenance: '维护中' }[placeStatusFilter]);
    if (placeTypeFilter) parts.push(getPlaceTypeText(placeTypeFilter as any));
    return parts.length > 0 ? parts.join(' / ') : '全部数据';
  };

  const generateExportContent = (tab: string) => {
    const dateRangeText = { month: '本月', quarter: '本季度', year: '本年', all: '全部' }[dateRange];

    let content = `========================================\n`;
    content += `  应急避难场所管理系统 - 报表导出\n`;
    content += `========================================\n\n`;
    content += `报表类型: ${tabs.find((t) => t.id === tab)?.label || '综合报表'}\n`;
    content += `统计范围: ${dateRangeText}\n`;
    content += `筛选条件: ${getFilterSummary()}\n`;
    content += `导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    content += `----------------------------------------\n\n`;

    switch (tab) {
      case 'overview':
        content += `【一、基本概况】\n\n`;
        content += `场所总数: ${filteredPlaces.length} 个\n`;
        content += `总容纳人数: ${filteredPlaces.reduce((s, p) => s + p.capacity, 0).toLocaleString()} 人\n`;
        content += `当前在院人数: ${filteredPlaces.reduce((s, p) => s + (p.currentPeople || 0), 0).toLocaleString()} 人\n`;
        content += `物资总数: ${filteredSupplies.reduce((s, item) => s + item.quantity, 0).toLocaleString()} 件\n`;
        content += `巡检总次数: ${filteredInspections.length} 次\n`;
        content += `巡检完成率: ${filteredInspections.length > 0 ? Math.round((filteredInspections.filter((i) => i.status === 'completed').length / filteredInspections.length) * 100) : 0}%\n`;
        content += `演练总次数: ${filteredDrills.length} 次\n\n`;

        content += `【二、各行政区场所统计】\n\n`;
        districtTableData.forEach((item) => {
          content += `${item.district}: ${item.count} 个场所, 总容量 ${item.capacity.toLocaleString()} 人\n`;
        });
        break;

      case 'places':
        content += `【场所详情列表】\n\n`;
        filteredPlaces.forEach((place, idx) => {
          content += `${idx + 1}. ${place.name}\n`;
          content += `   类型: ${getPlaceTypeText(place.type)}\n`;
          content += `   行政区: ${place.district}\n`;
          content += `   地址: ${place.address}\n`;
          content += `   容量: ${place.capacity.toLocaleString()} 人\n`;
          content += `   面积: ${place.area.toLocaleString()} ㎡\n`;
          content += `   设施数: ${place.facilities.length} 项\n`;
          content += `   状态: ${place.status === 'normal' ? '正常' : place.status === 'maintenance' ? '维护中' : place.status === 'open' ? '开放中' : '关闭'}\n\n`;
        });
        break;

      case 'supplies':
        content += `【物资状态统计】\n\n`;
        content += `正常: ${supplyStatusStats.normal} 项\n`;
        content += `临期: ${supplyStatusStats.expiring} 项\n`;
        content += `过期: ${supplyStatusStats.expired} 项\n`;
        content += `总计: ${supplyStatusStats.total} 项\n\n`;

        content += `【库存变动统计】\n\n`;
        content += `入库总量: ${supplyTransactionStats.inQty} 件\n`;
        content += `出库总量: ${supplyTransactionStats.outQty} 件\n`;
        content += `报废总量: ${supplyTransactionStats.scrapQty} 件\n`;
        content += `流水记录: ${supplyTransactionStats.total} 条\n\n`;

        content += `【物资明细列表】\n\n`;
        filteredSupplies.forEach((supply, idx) => {
          const place = places.find((p) => p.id === supply.placeId);
          content += `${idx + 1}. ${supply.name}\n`;
          content += `   分类: ${supply.category}\n`;
          content += `   数量: ${supply.quantity} ${supply.unit}\n`;
          content += `   有效期至: ${formatDate(supply.expireDate)}\n`;
          content += `   所属场所: ${place?.name || '-'}\n`;
          content += `   状态: ${getSupplyStatusText(supply.status)}\n\n`;
        });
        break;

      case 'inspection':
        content += `【巡检完成情况】\n\n`;
        content += `已完成: ${filteredInspections.filter((i) => i.status === 'completed').length} 次\n`;
        content += `整改中: ${filteredInspections.filter((i) => i.status === 'rectifying' || i.status === 'in_progress').length} 次\n`;
        content += `待整改: ${filteredInspections.filter((i) => i.status === 'pending').length} 次\n`;
        content += `总计: ${filteredInspections.length} 次\n\n`;

        content += `【巡检记录列表】\n\n`;
        filteredInspections.forEach((inspection, idx) => {
          const place = places.find((p) => p.id === inspection.placeId);
          content += `${idx + 1}. 巡检日期: ${formatDate(inspection.date)}\n`;
          content += `   场所: ${place?.name || '-'}\n`;
          content += `   巡检人员: ${inspection.inspector}\n`;
          content += `   问题: ${inspection.issues.join('、') || '-'}\n`;
          content += `   整改期限: ${inspection.rectifyDeadline ? formatDate(inspection.rectifyDeadline) : '-'}\n`;
          content += `   状态: ${getInspectionStatusText(inspection.status as any)}\n\n`;
        });
        break;

      case 'drill':
        content += `【演练基本统计】\n\n`;
        content += `演练总次数: ${filteredDrills.length} 次\n`;
        content += `参与总人数: ${filteredDrills.reduce((s, d) => s + d.participants, 0).toLocaleString()} 人次\n\n`;

        content += `【演练记录列表】\n\n`;
        filteredDrills.forEach((drill, idx) => {
          const place = places.find((p) => p.id === drill.placeId);
          content += `${idx + 1}. ${drill.name}\n`;
          content += `   日期: ${formatDate(drill.date)}\n`;
          content += `   场所: ${place?.name || '-'}\n`;
          content += `   参与人数: ${drill.participants} 人\n`;
          content += `   评估: ${drill.evaluation}\n\n`;
        });
        break;
    }

    content += `\n========================================\n`;
    content += `  报表结束\n`;
    content += `========================================\n`;

    return content;
  };

  const handleExport = () => {
    const content = generateExportContent(activeTab);
    setExportContent(content);
    setShowExportModal(true);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('请输入模板名称');
      return;
    }

    const template: ReportTemplate = {
      id: generateId(),
      name: templateName,
      description: templateDesc,
      tab: activeTab,
      dateRange,
      districtFilter,
      placeStatusFilter,
      placeTypeFilter,
      createTime: new Date().toISOString()
    };

    addReportTemplate(template);
    setTemplateName('');
    setTemplateDesc('');
    setShowTemplateModal(false);
    alert('模板保存成功！');
  };

  const applyTemplate = (template: ReportTemplate) => {
    setActiveTab(template.tab);
    setDateRange(template.dateRange);
    setDistrictFilter(template.districtFilter);
    setPlaceStatusFilter(template.placeStatusFilter);
    setPlaceTypeFilter(template.placeTypeFilter);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('确认删除该模板吗？')) {
      deleteReportTemplate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报表中心</h1>
          <p className="text-gray-500 mt-1">多维度数据分析与分级统计报表</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Save className="w-5 h-5" />
            保存模板
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="w-5 h-5" />
            导出报表
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">筛选条件</span>
          <span className="text-xs text-gray-500 ml-2">({getFilterSummary()})</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="all">全部时间</option>
              <option value="month">本月</option>
              <option value="quarter">本季度</option>
              <option value="year">本年</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="">全部区域</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-500" />
            <select
              value={placeTypeFilter}
              onChange={(e) => setPlaceTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="">全部类型</option>
              <option value="indoor">室内</option>
              <option value="outdoor">室外</option>
              <option value="comprehensive">综合</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <select
              value={placeStatusFilter}
              onChange={(e) => setPlaceStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="">全部状态</option>
              <option value="normal">正常</option>
              <option value="open">开放中</option>
              <option value="maintenance">维护中</option>
              <option value="closed">已关闭</option>
            </select>
          </div>

          <button
            onClick={() => {
              setDateRange('all');
              setDistrictFilter('');
              setPlaceStatusFilter('');
              setPlaceTypeFilter('');
            }}
            className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            重置筛选
          </button>
        </div>
      </div>

      {reportTemplates.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">常用模板</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {reportTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-300 transition-colors group"
              >
                <button
                  onClick={() => applyTemplate(template)}
                  className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  title={template.description}
                >
                  {template.name}
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors flex-1 justify-center ${
              activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
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
                  <p className="text-3xl font-bold text-gray-900 mt-2">{filteredPlaces.length}</p>
                </div>
                <div className="p-4 bg-blue-100 rounded-xl">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">总容纳人数</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {filteredPlaces.reduce((s, p) => s + p.capacity, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-green-100 rounded-xl">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">物资总数</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {filteredSupplies.reduce((s, item) => s + item.quantity, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-purple-100 rounded-xl">
                  <Package className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">巡检完成率</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {filteredInspections.length > 0
                      ? Math.round((filteredInspections.filter((i) => i.status === 'completed').length / filteredInspections.length) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="p-4 bg-orange-100 rounded-xl">
                  <ClipboardList className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">各场所容量对比</h3>
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
                    <Radar name="容量" dataKey="容量" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
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
                onClick={handleExport}
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlaces.map((place) => (
                    <tr key={place.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{place.name}</td>
                      <td className="py-3 px-4 text-gray-600">{getPlaceTypeText(place.type)}</td>
                      <td className="py-3 px-4 text-gray-600">{place.district}</td>
                      <td className="py-3 px-4 text-gray-600">{place.capacity.toLocaleString()} 人</td>
                      <td className="py-3 px-4 text-gray-600">{place.area.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            place.status === 'normal'
                              ? 'bg-green-100 text-green-700'
                              : place.status === 'maintenance'
                              ? 'bg-yellow-100 text-yellow-700'
                              : place.status === 'open'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {place.status === 'normal'
                            ? '正常'
                            : place.status === 'maintenance'
                            ? '维护中'
                            : place.status === 'open'
                            ? '开放中'
                            : '关闭'}
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">正常物资</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{supplyStatusStats.normal}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">临期物资</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{supplyStatusStats.expiring}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">过期物资</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{supplyStatusStats.expired}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">入库总量</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{supplyTransactionStats.inQty}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">出库/报废</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {supplyTransactionStats.outQty + supplyTransactionStats.scrapQty}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ArrowUpDown className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

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
                  const count = filteredSupplies.filter((s) => s.status === status).length;
                  const total = filteredSupplies.length;
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
                onClick={handleExport}
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
                  {filteredSupplies.map((supply) => {
                    const place = places.find((p) => p.id === supply.placeId);
                    return (
                      <tr key={supply.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{supply.name}</td>
                        <td className="py-3 px-4 text-gray-600">{supply.category}</td>
                        <td className="py-3 px-4 text-gray-600">{supply.quantity}</td>
                        <td className="py-3 px-4 text-gray-600">{supply.unit}</td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(supply.expireDate)}</td>
                        <td className="py-3 px-4 text-gray-600">{place?.name || '-'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              supply.status === 'normal'
                                ? 'bg-green-100 text-green-700'
                                : supply.status === 'expiring'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
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

          {filteredTransactions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">库存流水记录</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">时间</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">物资名称</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">类型</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">数量</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">操作人</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">所属场所</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.slice(0, 20).map((t) => {
                      const supply = supplies.find((s) => s.id === t.supplyId);
                      const place = places.find((p) => p.id === t.placeId);
                      return (
                        <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-600 text-sm">{formatDate(t.createTime)}</td>
                          <td className="py-3 px-4 font-medium text-gray-900">{supply?.name || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              t.type === 'in'
                                ? 'bg-green-100 text-green-700'
                                : t.type === 'out'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
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
                          <td className="py-3 px-4 text-gray-600 text-sm">{t.operator}</td>
                          <td className="py-3 px-4 text-gray-600 text-sm">{place?.name || '-'}</td>
                          <td className="py-3 px-4 text-gray-500 text-sm">{t.remark || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredTransactions.length > 20 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  仅显示前 20 条记录，共 {filteredTransactions.length} 条流水记录
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'inspection' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">巡检完成情况</h3>
              <div className="space-y-3">
                {[
                  { label: '已完成', count: filteredInspections.filter((i) => i.status === 'completed').length, color: 'green' },
                  { label: '整改中', count: filteredInspections.filter((i) => i.status === 'rectifying' || i.status === 'in_progress').length, color: 'blue' },
                  { label: '待整改', count: filteredInspections.filter((i) => i.status === 'pending').length, color: 'orange' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-gray-600">{item.label}</span>
                    <span
                      className={`text-xl font-bold ${
                        item.color === 'green' ? 'text-green-600' : item.color === 'blue' ? 'text-blue-600' : 'text-orange-600'
                      }`}
                    >
                      {item.count} 次
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">问题类型分布</h3>
              <div className="space-y-2">
                {['设施损坏', '物资缺失', '卫生问题', '安全隐患', '其他'].map((type, idx) => {
                  const count = filteredInspections.filter((i) => i.issues.some((issue) => issue.includes(type))).length;
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                      <span className="text-sm text-gray-600 flex-1">{type}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">整改及时率</h3>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">
                  {filteredInspections.length > 0
                    ? Math.round((filteredInspections.filter((i) => i.status === 'completed').length / filteredInspections.length) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  已完成 {filteredInspections.filter((i) => i.status === 'completed').length} / {filteredInspections.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">巡检记录报表</h3>
              <button
                onClick={handleExport}
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
                  {filteredInspections.map((inspection) => {
                    const place = places.find((p) => p.id === inspection.placeId);
                    return (
                      <tr key={inspection.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{formatDate(inspection.date)}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{place?.name || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{inspection.inspector}</td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{inspection.issues[0] || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{inspection.rectifyDeadline ? formatDate(inspection.rectifyDeadline) : '-'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              inspection.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : inspection.status === 'rectifying'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {inspection.status === 'completed'
                              ? '已完成'
                              : inspection.status === 'rectifying'
                              ? '整改中'
                              : '待整改'}
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
              <p className="text-3xl font-bold text-gray-900 mt-2">{filteredDrills.length}</p>
              <p className="text-sm text-gray-400 mt-1">次</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-500 font-medium">参与总人数</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {filteredDrills.reduce((s, d) => s + d.participants, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-400 mt-1">人次</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-500 font-medium">平均参与率</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {filteredDrills.length > 0
                  ? Math.round((filteredDrills.reduce((s, d) => s + d.participants, 0) / filteredDrills.length / 50) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-gray-400 mt-1">签到/报名</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-500 font-medium">平均评分</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">4.6</p>
              <p className="text-sm text-gray-400 mt-1">综合评估</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">演练参与趋势</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="演练次数" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">演练记录报表</h3>
              <button
                onClick={handleExport}
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">日期</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">场所</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">参与人数</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">评估结果</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">签到人数</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrills.map((drill) => {
                    const place = places.find((p) => p.id === drill.placeId);
                    return (
                      <tr key={drill.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{drill.name}</td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(drill.date)}</td>
                        <td className="py-3 px-4 text-gray-600">{place?.name || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{drill.participants} 人</td>
                        <td className="py-3 px-4 text-gray-600">{drill.evaluation}</td>
                        <td className="py-3 px-4 text-gray-600">{drill.signInList.length} 人</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">报表预览</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {tabs.find((t) => t.id === activeTab)?.label} - {getFilterSummary()}
                </p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 font-mono whitespace-pre-wrap">
                {exportContent}
              </pre>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `报表_${new Date().toISOString().split('T')[0]}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                下载文件
              </button>
            </div>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">保存报表模板</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">模板名称</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="例如：月度巡检整改报表"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">模板说明（可选）</label>
                <textarea
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  placeholder="描述这个模板的用途..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">当前筛选条件</p>
                <p className="text-sm text-gray-600">{getFilterSummary()}</p>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveTemplate}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

