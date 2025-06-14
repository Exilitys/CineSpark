import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Camera, Image, Download, Settings, HelpCircle } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const mainNavItems = [
    { path: '/story', icon: FileText, label: 'Story Development' },
    { path: '/shots', icon: Camera, label: 'Shot List' },
    { path: '/photoboard', icon: Image, label: 'Photoboard' },
    { path: '/export', icon: Download, label: 'Export' },
  ];

  const secondaryNavItems = [
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/help', icon: HelpCircle, label: 'Help' },
  ];

  if (location.pathname === '/') return null;

  return (
    <aside className="bg-gray-800 w-64 min-h-screen border-r border-gray-700 hidden lg:block">
      <div className="p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Production Tools
        </h2>
        <nav className="space-y-2">
          {mainNavItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === path
                  ? 'bg-cinema-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <nav className="space-y-2">
            {secondaryNavItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};