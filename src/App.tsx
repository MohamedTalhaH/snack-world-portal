/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleHeader } from './components/RoleHeader';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminPortal } from './components/AdminPortal';
import { DeliveryPortal } from './components/DeliveryPortal';
import { Compass, Sparkles, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentRole, cart } = useApp();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Compute quantity of items in cart
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200 font-sans">
      <div>
        {/* Universal Role Navigation Header */}
        <RoleHeader onOpenCart={() => setIsCartOpen(true)} cartCount={cartCount} />

        {/* Dynamic Multi-role Screens */}
        <main className="animate-in fade-in duration-300">
          {currentRole === 'customer' && (
            <CustomerPortal isCartOpen={isCartOpen} onCloseCart={() => setIsCartOpen(false)} />
          )}
          {currentRole === 'admin' && (
            <AdminPortal />
          )}
          {currentRole === 'delivery' && (
            <DeliveryPortal />
          )}
        </main>
      </div>

      {/* Footer layout */}
      <footer className="border-t border-white/5 bg-[#070708] py-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-white tracking-tight">
              Snacks<span className="text-amber-500">world</span>
            </span>
            <span className="text-zinc-800">|</span>
            <p className="font-mono text-[10px] text-zinc-600">Licensed for COD snacks online delivery © 2026</p>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600 font-sans">
            <span>Powered by React 19 & Tailwind CSS v4</span>
            <span className="text-zinc-800">•</span>
            <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-semibold">
              <Compass size={12} className="text-amber-500" />
              Cash On Delivery Only
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

