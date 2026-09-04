import React from 'react';
import { Layers, Film, Tv, Heart, Clock, Smartphone } from 'lucide-react';
import { ContentTab } from '../types';

interface BottomNavProps {
  activeTab: ContentTab;
  onSelectTab: (tab: ContentTab) => void;
  favoritesCount: number;
  historyCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  favoritesCount,
  historyCount = 0,
}) => {
  const tabs = [
    { id: 'all' as ContentTab, label: 'Todo', icon: Layers },
    { id: 'movies' as ContentTab, label: 'Películas', icon: Film },
    { id: 'series' as ContentTab, label: 'Series', icon: Tv },
    { id: 'history' as ContentTab, label: 'Historial', icon: Clock, badge: historyCount > 0 ? historyCount : undefined },
    { id: 'favorites' as ContentTab, label: 'Favoritos', icon: Heart, badge: favoritesCount > 0 ? favoritesCount : undefined },
    { id: 'settings' as ContentTab, label: 'Ajustes', icon: Smartphone },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#060a15]/95 backdrop-blur-lg border-t border-cyan-950/50 py-1.5 px-1 sm:px-2 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2.5 rounded-xl transition-all duration-150 relative active:scale-95 cursor-pointer ${
                isActive ? 'text-cyan-400 font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className={`absolute -top-1 -right-2 min-w-3.5 h-3.5 px-1 rounded-full text-white text-[8.5px] font-bold flex items-center justify-center shadow ${tab.id === 'history' ? 'bg-cyan-600' : 'bg-red-500'}`}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[9.5px] sm:text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-3.5 h-0.5 rounded-full bg-cyan-400 mt-0.5 shadow-sm shadow-cyan-400/80"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

