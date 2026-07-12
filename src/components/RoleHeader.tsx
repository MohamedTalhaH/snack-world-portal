import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Bell, Shield, Truck, User, LogOut, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';

interface RoleHeaderProps {
  onOpenCart: () => void;
  cartCount: number;
}

export const RoleHeader: React.FC<RoleHeaderProps> = ({ onOpenCart, cartCount }) => {
  const { currentRole, setCurrentRole, notifications, markNotificationsAsRead, clearNotifications } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#070708]/95 backdrop-blur-md text-white border-b border-white/5 shadow-2xl">
      {/* Role Switcher Toolbar */}
      <div className="bg-[#0b0b0c] text-zinc-300 border-b border-white/5 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-zinc-400 font-sans">Dual-Sync Live Demo Panel: Switch roles below to test real-time ordering</span>
        </div>
        <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setCurrentRole('customer')}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer flex items-center gap-1.5 text-[11px] ${
              currentRole === 'customer'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-bold'
                : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User size={13} />
            Customer View
          </button>
          <button
            onClick={() => setCurrentRole('admin')}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer flex items-center gap-1.5 text-[11px] ${
              currentRole === 'admin'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-bold'
                : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield size={13} />
            Admin Dashboard
          </button>
          <button
            onClick={() => setCurrentRole('delivery')}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer flex items-center gap-1.5 text-[11px] ${
              currentRole === 'delivery'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-bold'
                : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Truck size={13} />
            Delivery Boy App
          </button>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-zinc-950 p-2 rounded-xl font-black text-xl tracking-tight shadow-md shadow-amber-500/10">
            SW
          </div>
          <div>
            <h1 className="font-sans font-extrabold text-lg md:text-xl tracking-tight text-white flex items-center gap-1.5">
              Snacks<span className="text-amber-500">world</span>
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wide hidden sm:block">HOT & CRISPY COD SNACKS</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Notifications Icon with Indicator */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadCount > 0) {
                  markNotificationsAsRead();
                }
              }}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer relative"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-zinc-950 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 md:w-96 bg-[#0e0e11] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 border-b border-white/5 bg-[#070708] flex justify-between items-center">
                  <h4 className="text-[10px] font-extrabold text-zinc-400 tracking-wider uppercase">Order Status Alerts</h4>
                  <div className="flex gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-[10px] text-zinc-400 hover:text-red-400 font-semibold cursor-pointer transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-white/5 scrollbar-none">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-zinc-500 text-xs font-medium">
                      No status notifications yet
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`p-3.5 text-xs transition-colors hover:bg-white/5 flex gap-2.5 ${
                          notif.read ? 'bg-[#0e0e11]/50' : 'bg-amber-500/5 text-zinc-100'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {notif.type === 'success' && <CheckCircle2 size={14} className="text-emerald-500" />}
                          {notif.type === 'warning' && <CheckCircle2 size={14} className="text-amber-500" />}
                          {notif.type === 'error' && <CheckCircle2 size={14} className="text-red-500" />}
                          {notif.type === 'info' && <CheckCircle2 size={14} className="text-sky-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-normal text-zinc-300 leading-relaxed text-[11px]">{notif.text}</p>
                          <span className="text-[9px] text-zinc-500 block mt-1 font-mono">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart Icon (Only visible in Customer View) */}
          {currentRole === 'customer' && (
            <button
              onClick={onOpenCart}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer hover:shadow-lg hover:shadow-amber-500/20 text-sm active:scale-95"
            >
              <ShoppingBag size={16} />
              <span>Cart</span>
              <span className="bg-zinc-950 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-black font-mono">
                {cartCount}
              </span>
            </button>
          )}

          {/* User badge */}
          <div className="flex items-center gap-2 border-l border-white/10 pl-4 text-xs font-mono">
            <span className="text-zinc-500 hidden md:inline">Role:</span>
            <span className="px-2 py-1 rounded-lg bg-[#0e0e11] border border-white/5 text-amber-400 font-extrabold capitalize tracking-wide">
              {currentRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
