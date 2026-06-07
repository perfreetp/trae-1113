import type { Place, Supply, Inspection, Drill, PersonRecord, DispatchOrder, Feedback } from '../types';

export const mockPlaces: Place[] = [
  {
    id: '1',
    name: '市民中心应急避难所',
    address: '人民路88号市民广场地下一层',
    area: 5000,
    capacity: 2500,
    type: 'indoor',
    status: 'normal',
    lat: 31.2304,
    lng: 121.4737,
    facilities: ['应急照明', '供水设施', '卫生间', '医疗站', '通讯设备'],
    accessible: true,
    manager: '张明',
    phone: '138****1234',
    district: '黄浦区',
    description: '市级核心避难场所，配备完善的应急设施',
    currentPeople: 0,
    updatedAt: '2026-06-01'
  },
  {
    id: '2',
    name: '中山公园临时避难区',
    address: '长宁路780号中山公园内',
    area: 12000,
    capacity: 6000,
    type: 'outdoor',
    status: 'normal',
    lat: 31.2234,
    lng: 121.4217,
    facilities: ['应急帐篷区', '供水点', '临时厕所', '应急供电'],
    accessible: true,
    manager: '李华',
    phone: '139****5678',
    district: '长宁区',
    description: '大型公园避难区，可容纳大量人员',
    currentPeople: 0,
    updatedAt: '2026-06-02'
  },
  {
    id: '3',
    name: '第一中学应急避难中心',
    address: '教育路128号第一中学体育馆',
    area: 3500,
    capacity: 1800,
    type: 'comprehensive',
    status: 'open',
    lat: 31.2456,
    lng: 121.5012,
    facilities: ['应急照明', '住宿区', '食堂', '医疗站', '心理咨询', '无障碍通道'],
    accessible: true,
    manager: '王芳',
    phone: '137****9012',
    district: '静安区',
    description: '学校改建的综合避难中心，设施齐全',
    currentPeople: 1250,
    updatedAt: '2026-06-05'
  },
  {
    id: '4',
    name: '滨江体育中心避难所',
    address: '滨江大道666号体育中心',
    area: 8000,
    capacity: 4000,
    type: 'indoor',
    status: 'maintenance',
    lat: 31.1987,
    lng: 121.5123,
    facilities: ['大型场馆', '淋浴设施', '厨房', '医疗中心', '物资仓库'],
    accessible: true,
    manager: '陈强',
    phone: '136****3456',
    district: '浦东新区',
    description: '正在进行设施检修维护',
    currentPeople: 0,
    updatedAt: '2026-06-03'
  },
  {
    id: '5',
    name: '社区公园避难点',
    address: '花园路100号社区公园',
    area: 2000,
    capacity: 1000,
    type: 'outdoor',
    status: 'normal',
    lat: 31.2567,
    lng: 121.4567,
    facilities: ['应急帐篷', '基本供水', '临时卫生间'],
    accessible: false,
    manager: '刘军',
    phone: '135****7890',
    district: '虹口区',
    description: '社区级应急避难场所',
    currentPeople: 0,
    updatedAt: '2026-06-04'
  },
  {
    id: '6',
    name: '会展中心应急安置点',
    address: '徐泾镇会展中心',
    area: 15000,
    capacity: 8000,
    type: 'indoor',
    status: 'normal',
    lat: 31.1876,
    lng: 121.2876,
    facilities: ['大型展厅', '医疗站', '物资分发', '通讯中心', '无障碍设施'],
    accessible: true,
    manager: '赵伟',
    phone: '138****2345',
    district: '青浦区',
    description: '大型会展中心改建的安置点',
    currentPeople: 0,
    updatedAt: '2026-06-01'
  }
];

export const mockSupplies: Supply[] = [
  { id: 's1', placeId: '1', name: '矿泉水', category: '食品饮料', quantity: 5000, unit: '瓶', expireDate: '2027-03-15', status: 'normal' },
  { id: 's2', placeId: '1', name: '方便面', category: '食品饮料', quantity: 3000, unit: '桶', expireDate: '2026-09-20', status: 'normal' },
  { id: 's3', placeId: '1', name: '急救包', category: '医疗物资', quantity: 200, unit: '个', expireDate: '2026-08-10', status: 'expiring' },
  { id: 's4', placeId: '1', name: '应急手电筒', category: '照明设备', quantity: 500, unit: '个', expireDate: '2028-12-01', status: 'normal' },
  { id: 's5', placeId: '2', name: '帐篷', category: '住宿装备', quantity: 300, unit: '顶', expireDate: '2029-06-30', status: 'normal' },
  { id: 's6', placeId: '2', name: '防潮垫', category: '住宿装备', quantity: 1000, unit: '个', expireDate: '2028-03-15', status: 'normal' },
  { id: 's7', placeId: '3', name: '压缩饼干', category: '食品饮料', quantity: 2000, unit: '包', expireDate: '2026-07-01', status: 'expiring' },
  { id: 's8', placeId: '3', name: '常用药品', category: '医疗物资', quantity: 500, unit: '盒', expireDate: '2026-05-20', status: 'expired' },
  { id: 's9', placeId: '3', name: '睡袋', category: '住宿装备', quantity: 800, unit: '个', expireDate: '2027-11-30', status: 'normal' },
  { id: 's10', placeId: '4', name: '发电机', category: '电力设备', quantity: 10, unit: '台', expireDate: '2030-01-01', status: 'normal' },
  { id: 's11', placeId: '5', name: '饮用水', category: '食品饮料', quantity: 1000, unit: '瓶', expireDate: '2026-06-30', status: 'expiring' },
  { id: 's12', placeId: '6', name: '毛毯', category: '保暖物资', quantity: 2000, unit: '条', expireDate: '2028-09-15', status: 'normal' }
];

export const mockInspections: Inspection[] = [
  {
    id: 'i1',
    placeId: '1',
    date: '2026-06-05',
    inspector: '检查组A',
    issues: ['部分应急灯故障', '消防通道有杂物堆积'],
    status: 'rectifying',
    rectifyDeadline: '2026-06-15',
    rectifyResult: ''
  },
  {
    id: 'i2',
    placeId: '2',
    date: '2026-06-03',
    inspector: '检查组B',
    issues: [],
    status: 'completed',
    rectifyResult: '检查通过，无问题'
  },
  {
    id: 'i3',
    placeId: '3',
    date: '2026-06-01',
    inspector: '检查组A',
    issues: ['供水管道漏水', '部分床位损坏'],
    status: 'pending',
    rectifyDeadline: '2026-06-20'
  },
  {
    id: 'i4',
    placeId: '4',
    date: '2026-05-28',
    inspector: '检查组C',
    issues: ['主发电机需保养', '通风系统过滤网需更换'],
    status: 'rectifying',
    rectifyDeadline: '2026-06-10'
  },
  {
    id: 'i5',
    placeId: '5',
    date: '2026-06-02',
    inspector: '检查组B',
    issues: ['无障碍通道不达标'],
    status: 'pending',
    rectifyDeadline: '2026-06-25'
  }
];

export const mockDrills: Drill[] = [
  {
    id: 'd1',
    placeId: '1',
    name: '2026年上半年地震应急演练',
    date: '2026-05-15',
    participants: 200,
    evaluation: '演练效果良好，各环节配合顺畅，建议加强通讯协调',
    signInList: ['张三', '李四', '王五', '赵六', '陈七']
  },
  {
    id: 'd2',
    placeId: '3',
    name: '消防疏散演练',
    date: '2026-04-20',
    participants: 150,
    evaluation: '疏散时间符合标准，人员有序撤离',
    signInList: ['人员A', '人员B', '人员C']
  },
  {
    id: 'd3',
    placeId: '2',
    name: '台风应急响应演练',
    date: '2026-03-10',
    participants: 300,
    evaluation: '物资调运及时，人员安置有序',
    signInList: ['人员D', '人员E']
  },
  {
    id: 'd4',
    placeId: '6',
    name: '大规模人员安置演练',
    date: '2026-05-28',
    participants: 500,
    evaluation: '整体流程顺畅，需优化登记环节',
    signInList: ['人员F', '人员G', '人员H', '人员I']
  }
];

export const mockPersonRecords: PersonRecord[] = [
  { id: 'p1', placeId: '3', name: '张三', idCard: '310***********1234', checkInTime: '2026-06-05 08:30:00', checkOutTime: undefined },
  { id: 'p2', placeId: '3', name: '李四', idCard: '310***********5678', checkInTime: '2026-06-05 09:15:00', checkOutTime: undefined },
  { id: 'p3', placeId: '3', name: '王五', idCard: '310***********9012', checkInTime: '2026-06-05 10:00:00', checkOutTime: '2026-06-06 14:30:00' },
  { id: 'p4', placeId: '3', name: '赵六', checkInTime: '2026-06-05 11:20:00', checkOutTime: undefined },
  { id: 'p5', placeId: '3', name: '陈七', checkInTime: '2026-06-05 13:45:00', checkOutTime: undefined }
];

export const mockDispatchOrders: DispatchOrder[] = [
  {
    id: 'o1',
    placeId: '3',
    type: 'open',
    reason: '区域暴雨预警，需开放应急避难场所',
    createTime: '2026-06-05 07:00:00',
    operator: '应急指挥中心',
    status: 'active'
  },
  {
    id: 'o2',
    placeId: '4',
    type: 'close',
    reason: '设施定期维护检修',
    createTime: '2026-06-03 09:00:00',
    operator: '设施管理科',
    status: 'active'
  }
];

export const mockFeedbacks: Feedback[] = [
  { id: 'f1', placeId: '1', rating: 5, comment: '设施完善，管理有序', createTime: '2026-05-20' },
  { id: 'f2', placeId: '2', rating: 4, comment: '场地很大，建议增加更多遮阴设施', createTime: '2026-05-25' },
  { id: 'f3', placeId: '3', rating: 5, comment: '工作人员服务态度很好', createTime: '2026-06-01' },
  { id: 'f4', placeId: '5', rating: 3, comment: '设施比较简陋', createTime: '2026-05-28' }
];
