import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils';
import {
  LayoutDashboard,
  Train,
  Wrench,
  Brain,
  Bell,
  Megaphone,
  History,
  Settings,
  BarChart3,
  FileSpreadsheet,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Induction Decisions', href: '/induction', icon: Train },
  { name: 'Maintenance & Depot', href: '/maintenance', icon: Wrench },
  { name: 'What-If Simulator', href: '/simulator', icon: Brain },
  { name: 'IoT Alerts', href: '/alerts', icon: Bell },
  { name: 'Branding Campaigns', href: '/branding', icon: Megaphone },
  { name: 'ML Data Ingest', href: '/ml-ingest', icon: FileSpreadsheet },
  { name: 'History & Export', href: '/history', icon: History },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive
                        ? 'text-primary-600'
                        : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>Kochi Metro Rail Limited</p>
          <p>v1.0.0 - AI Induction System</p>
        </div>
      </div>
    </div>
  );
};
