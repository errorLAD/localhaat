'use client';

import React from 'react';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: 'for-you' | 'fashion' | 'mobiles' | 'electronics' | 'beauty' | 'home' | 'appliances' | 'medicine';
}

export const CATEGORY_ITEMS: CategoryItem[] = [
  { id: 'for-you', name: 'For You', slug: '', icon: 'for-you' },
  { id: 'fashion', name: 'Fashion', slug: 'fashion', icon: 'fashion' },
  { id: 'mobiles', name: 'Mobiles', slug: 'mobiles', icon: 'mobiles' },
  { id: 'electronics', name: 'Electronics', slug: 'electronics', icon: 'electronics' },
  { id: 'beauty', name: 'Beauty', slug: 'beauty', icon: 'beauty' },
  { id: 'home', name: 'Home', slug: 'home', icon: 'home' },
  { id: 'appliances', name: 'Appliances', slug: 'appliances', icon: 'appliances' },
  { id: 'medicine', name: 'Medicine', slug: 'medicine', icon: 'medicine' },
];

export const CategoryIcon: React.FC<{ type: CategoryItem['icon']; active?: boolean }> = ({ type, active }) => {
  switch (type) {
    case 'for-you':
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="8" width="20" height="25" rx="5" stroke="#1e293b" strokeWidth="2.3" fill="transparent" />
          <path d="M14 17 C14 23 26 23 26 17 Z" fill="#facc15" stroke="#1e293b" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case 'fashion':
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15 9 C17 11 23 11 25 9 L32 13 L29 17 L26 15 L26 31 L14 31 L14 15 L11 17 L8 13 Z"
            stroke="#1e293b"
            strokeWidth="2.3"
            strokeLinejoin="round"
            fill="transparent"
          />
          <rect x="14" y="27" width="12" height="4" fill="#facc15" stroke="#1e293b" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case 'mobiles':
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="13" y="7" width="14" height="26" rx="3.5" stroke="#1e293b" strokeWidth="2.3" fill="transparent" />
          <line x1="18" y1="10" x2="22" y2="10" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="13" y="26" width="14" height="7" rx="2" fill="#facc15" stroke="#1e293b" strokeWidth="1.8" />
        </svg>
      );
    case 'electronics':
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="11" y="9" width="18" height="14" rx="2.5" stroke="#1e293b" strokeWidth="2.3" fill="transparent" />
          <path d="M8 25 L32 25 C32 27 30 28 28 28 L12 28 C10 28 8 27 8 25 Z" fill="#facc15" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 'beauty':
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="15" y="19" width="10" height="13" rx="2" stroke="#1e293b" strokeWidth="2.3" fill="transparent" />
          <rect x="16.5" y="15" width="7" height="4" stroke="#1e293b" strokeWidth="1.8" fill="transparent" />
          <path d="M16.5 15 L16.5 11 L23.5 7 L23.5 15 Z" fill="#facc15" stroke="#1e293b" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case 'home':
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 8 L25 8 L28 18 L12 18 Z" fill="#facc15" stroke="#1e293b" strokeWidth="2.3" strokeLinejoin="round" />
          <line x1="20" y1="18" x2="20" y2="30" stroke="#1e293b" strokeWidth="2.3" strokeLinecap="round" />
          <line x1="14" y1="30" x2="26" y2="30" stroke="#1e293b" strokeWidth="2.3" strokeLinecap="round" />
        </svg>
      );
    case 'appliances':
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="8" width="22" height="17" rx="2" stroke="#1e293b" strokeWidth="2.3" fill="transparent" />
          <line x1="11" y1="22" x2="29" y2="22" stroke="#facc15" strokeWidth="2.5" />
          <line x1="14" y1="28" x2="26" y2="28" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="20" y1="25" x2="20" y2="28" stroke="#1e293b" strokeWidth="2.2" />
        </svg>
      );
    case 'medicine':
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Medicine Bottle Cap */}
          <rect x="15" y="7" width="10" height="4" rx="1.5" stroke="#1e293b" strokeWidth="2.3" fill="transparent" />
          {/* Bottle Body */}
          <rect x="11" y="11" width="18" height="21" rx="4" stroke="#1e293b" strokeWidth="2.3" fill="transparent" />
          {/* Golden Yellow Medical Cross */}
          <path
            d="M18.5 17 H21.5 V20 H24.5 V23 H21.5 V26 H18.5 V23 H15.5 V20 H18.5 Z"
            fill="#facc15"
            stroke="#1e293b"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
};

interface CategoryNavStripProps {
  selectedCategory: string; // '' for 'For You' or category slug
  onSelectCategory: (slug: string) => void;
  className?: string;
}

export const CategoryNavStrip: React.FC<CategoryNavStripProps> = ({
  selectedCategory,
  onSelectCategory,
  className = '',
}) => {
  return (
    <nav
      aria-label="Product categories navigation"
      className={`bg-white border-b border-gray-200/80 pt-3 pb-1 select-none ${className}`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-start sm:justify-center gap-3 sm:gap-6 md:gap-10 overflow-x-auto overscroll-x-contain touch-pan-x no-scrollbar scrollbar-none py-1 px-1 sm:px-0 w-full">
          {CATEGORY_ITEMS.map((item) => {
            const isActive = selectedCategory === item.slug;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectCategory(item.slug)}
                className="group flex flex-col items-center shrink-0 cursor-pointer focus:outline-none transition-all py-1 px-2 sm:px-2.5 min-w-[56px] select-none"
              >
                {/* Icon Container (Blue rounded rectangle when active) */}
                <div
                  className={`w-12 h-12 sm:w-15 sm:h-15 rounded-2xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-sky-100/90 shadow-2xs scale-105 ring-2 ring-blue-500/30'
                      : 'bg-transparent group-hover:bg-gray-100/80 group-hover:scale-102'
                  }`}
                >
                  <CategoryIcon type={item.icon} active={isActive} />
                </div>

                {/* Text Label */}
                <span
                  className={`text-[11px] sm:text-sm tracking-tight whitespace-nowrap mt-1.5 transition-colors ${
                    isActive
                      ? 'font-extrabold text-gray-950'
                      : 'font-semibold text-gray-700 group-hover:text-gray-950'
                  }`}
                >
                  {item.name}
                </span>

                {/* Active Indicator Underline Bar */}
                <div
                  className={`h-1 rounded-full transition-all mt-1 ${
                    isActive
                      ? 'w-full max-w-[36px] sm:max-w-[42px] bg-blue-600'
                      : 'w-0 bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
export default CategoryNavStrip;
