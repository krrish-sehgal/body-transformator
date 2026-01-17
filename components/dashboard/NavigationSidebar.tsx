'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavigationSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/calculations', label: 'Calculations', icon: '🔢' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-2 sm:px-3 py-6 sm:py-8 rounded-r-lg shadow-lg hover:bg-blue-700 transition-all z-50"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <span className="text-xl sm:text-2xl">{isOpen ? '‹' : '›'}</span>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-56 sm:w-64 bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto border-r border-gray-200`}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Navigation</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg sm:text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[55]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

