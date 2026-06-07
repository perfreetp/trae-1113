import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  Radio,
  ClipboardCheck,
  MapPin,
  CalendarCheck,
  BarChart3
} from 'lucide-react';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: '数据概览' },
  { path: '/places', icon: Building2, label: '场所台账' },
  { path: '/capacity', icon: Users, label: '容量评估' },
  { path: '/supplies', icon: Package, label: '物资清单' },
  { path: '/dispatch', icon: Radio, label: '开放调度' },
  { path: '/inspection', icon: ClipboardCheck, label: '巡检维护' },
  { path: '/public', icon: MapPin, label: '公众查询' },
  { path: '/drills', icon: CalendarCheck, label: '演练记录' },
  { path: '/reports', icon: BarChart3, label: '报表中心' }
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 min-h-screen text-white shadow-xl">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Building2 className="w-8 h-8" />
          应急避难管理
        </h1>
        <p className="text-blue-200 text-sm mt-1">城市应急管理平台</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="font-bold">管</span>
          </div>
          <div>
            <p className="font-medium text-sm">管理员</p>
            <p className="text-xs text-blue-200">应急管理部门</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
