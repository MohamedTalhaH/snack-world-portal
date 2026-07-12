import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { Truck, CheckCircle2, DollarSign, MapPin, Phone, AlertCircle, ShoppingBag, Eye, ShieldAlert, ShieldCheck } from 'lucide-react';

export const DeliveryPortal: React.FC = () => {
  const { orders, updateOrderStatus, addNotification, deliveryBoys, updateDeliveryBoy } = useApp();
  
  // Login & Session State
  const [currentRiderId, setCurrentRiderId] = useState<string | null>(() => {
    return localStorage.getItem('snack_active_rider_id');
  });
  const [loginDriverId, setLoginDriverId] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  const activeRider = deliveryBoys.find(db => db.id === currentRiderId);

  // Sync isOnline with activeRider availability
  useEffect(() => {
    if (activeRider) {
      setIsOnline(activeRider.available);
    }
  }, [activeRider?.id]);

  // Handle automatic logout if driver is deleted by admin
  useEffect(() => {
    if (currentRiderId && !activeRider && deliveryBoys.length > 0) {
      localStorage.removeItem('snack_active_rider_id');
      setCurrentRiderId(null);
    }
  }, [currentRiderId, activeRider, deliveryBoys]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginDriverId) {
      setLoginError('Please select your driver profile.');
      return;
    }
    const rider = deliveryBoys.find(db => db.id === loginDriverId);
    if (!rider) {
      setLoginError('Driver not found.');
      return;
    }
    if (rider.pin !== pinInput.trim()) {
      setLoginError('Incorrect PIN passcode. Please try again or consult the administrator.');
      return;
    }
    localStorage.setItem('snack_active_rider_id', rider.id);
    setCurrentRiderId(rider.id);
    setLoginError('');
    setPinInput('');
    addNotification(`Welcome back, ${rider.name}! Have a safe and fast delivery run!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('snack_active_rider_id');
    setCurrentRiderId(null);
    setLoginDriverId('');
    setPinInput('');
    addNotification('Logged out from Delivery Partner Hub successfully.', 'info');
  };

  // --- STATS COMPUTING FOR THIS RIDER ---
  const riderOrders = activeRider ? orders.filter(o => o.deliveryBoyId === activeRider.id) : [];
  const deliveredCount = riderOrders.filter(o => o.status === 'delivered').length;
  
  // Total cash collected from COD
  const cashCollected = riderOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Active Assigned Orders (Preparing or Out for delivery)
  const activeAssignedOrders = riderOrders.filter(o => 
    o.status === 'accepted' || 
    o.status === 'preparing' || 
    o.status === 'out_for_delivery'
  );

  // Delivered history
  const deliveredHistory = riderOrders.filter(o => o.status === 'delivered');

  // Actions
  const handlePickUp = (orderId: string) => {
    if (!activeRider) return;
    updateOrderStatus(
      orderId, 
      'out_for_delivery', 
      `Rider ${activeRider.name} has picked up the hot snack box and is speeding to your address!`
    );
    addNotification(`Picked up order ${orderId} successfully. Now delivering!`, 'info');
  };

  const handleDeliver = (orderId: string, amount: number) => {
    updateOrderStatus(
      orderId, 
      'delivered', 
      `Delivered! Order package received and Cash of ₹${amount.toFixed(2)} collected successfully.`
    );
    addNotification(`Order ${orderId} marked as delivered! COD Cash Collected: ₹${amount.toFixed(2)}`, 'success');
  };

  // Secure Sign-in gate if rider is not authenticated
  if (!activeRider) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-in fade-in duration-300">
        <div className="bg-[#0e0e11] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex bg-amber-500/10 border border-amber-500/25 text-amber-400 p-3 rounded-2xl mb-2">
              <Truck size={32} />
            </div>
            <h2 className="font-sans font-extrabold text-xl text-white tracking-tight">Delivery Partner Portal</h2>
            <p className="text-xs text-zinc-500">Sign in to access your assigned active runs and manage COD cash collections.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1.5">Select Your Driver Profile</label>
              <select
                required
                value={loginDriverId}
                onChange={(e) => {
                  setLoginDriverId(e.target.value);
                  setLoginError('');
                }}
                className="w-full bg-[#070708] text-white text-xs border border-white/5 rounded-xl px-3 py-3 font-bold focus:outline-none focus:border-amber-500/50 cursor-pointer"
              >
                <option value="" disabled>Choose your name...</option>
                {deliveryBoys.map(db => (
                  <option key={db.id} value={db.id}>
                    {db.name} ({db.available ? 'Online' : 'Offline'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1.5">Secure Passcode PIN</label>
              <input
                type="password"
                required
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setLoginError('');
                }}
                placeholder="Enter your secret PIN (e.g. 1234)"
                className="w-full bg-[#070708] text-white text-center font-mono tracking-widest text-sm border border-white/5 rounded-xl px-3 py-3 focus:outline-none focus:border-amber-500/50 placeholder:font-sans placeholder:text-zinc-600 placeholder:tracking-normal placeholder:text-xs"
              />
            </div>

            {loginError && (
              <div className="bg-red-500/5 border border-red-500/25 rounded-xl p-3 flex gap-2.5 items-center text-xs text-red-400 animate-pulse">
                <AlertCircle size={14} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs rounded-xl cursor-pointer transition-all hover:shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={14} strokeWidth={2.5} />
              Sign In to Fleet
            </button>
          </form>

          {/* Quick Demo Info */}
          <div className="bg-[#070708] border border-white/5 rounded-xl p-3.5 space-y-1.5 text-[11px] text-zinc-400 font-sans">
            <span className="font-extrabold text-amber-500 uppercase tracking-wider block text-[10px]">Testing Credentials:</span>
            <p className="leading-relaxed">
              Default riders are pre-loaded with passcode <span className="font-mono text-white bg-white/5 px-1 rounded">1234</span>. 
              You can add, edit, or remove delivery drivers and passwords under the <span className="text-zinc-200 font-bold">"Drivers Fleet"</span> tab in the Admin Control Dashboard!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-350">
      {/* Driver Identity Card Banner */}
      <div className="bg-[#0e0e11] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/25 text-amber-400 p-2.5 rounded-xl">
            <Truck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans font-extrabold text-base text-white tracking-tight">Delivery Partner Hub</h2>
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></span>
            </div>
            
            {/* Authenticated Identity display */}
            <div className="flex flex-col gap-0.5 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wide">Rider Account:</span>
                <span className="text-xs text-amber-400 font-extrabold">{activeRider.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wide">Contact:</span>
                <span className="text-[11px] text-zinc-400 font-mono">{activeRider.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Toggle and Sign Out actions */}
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold font-sans bg-[#070708] border border-white/5 px-3 py-1.5 rounded-xl">
            <span className={`inline-block w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></span>
            <span>Status: {isOnline ? <span className="text-emerald-400 font-extrabold">ONLINE / ACTIVE</span> : <span className="text-zinc-500">OFFLINE</span>}</span>
          </div>
          <button
            onClick={() => {
              const updatedStatus = !isOnline;
              setIsOnline(updatedStatus);
              updateDeliveryBoy({
                ...activeRider,
                available: updatedStatus
              });
              addNotification(`Status changed: You are now ${updatedStatus ? 'Online' : 'Offline'}`, 'info');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              isOnline
                ? 'bg-[#121214] hover:bg-white/5 text-zinc-300 border border-white/5'
                : 'bg-amber-500 hover:bg-amber-600 text-zinc-950'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Go Available'}
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 hover:border-red-500/20 rounded-xl text-xs font-black cursor-pointer transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Rider Performance Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Completed Deliveries', value: deliveredCount, desc: 'Successful dropoffs', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'COD Cash Handover', value: `₹${cashCollected.toFixed(2)}`, desc: 'Cash collected in hand', icon: DollarSign, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'Estimated Tips (Tips/Bonuses)', value: `₹${(deliveredCount * 120).toFixed(2)}`, desc: 'Simulated driver incentive', icon: Truck, color: 'text-sky-400 bg-sky-500/10' }
        ].map((stat, i) => {
          const StatIcon = stat.icon;
          return (
            <div key={i} className="bg-[#0e0e11] border border-white/5 rounded-2xl p-4.5 space-y-2.5 shadow-xl hover:border-white/10 transition-colors">
              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">
                <span>{stat.label}</span>
                <span className={`p-1.5 rounded-lg border border-white/5 ${stat.color}`}>
                  <StatIcon size={14} />
                </span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">{stat.value}</h3>
              <p className="text-[10px] text-zinc-400 font-sans">{stat.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Main Delivery Task Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-sans font-extrabold text-sm text-zinc-200 border-b border-white/5 pb-2 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            Assigned Active Runs ({activeAssignedOrders.length})
          </h3>

          {!isOnline ? (
            <div className="bg-[#0e0e11] border border-white/5 rounded-2xl p-12 text-center text-zinc-500 space-y-3 shadow-xl">
              <ShieldAlert className="mx-auto text-zinc-700 animate-pulse" size={32} />
              <div>
                <p className="text-sm font-extrabold text-zinc-400">You are currently OFFLINE.</p>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-[280px] mx-auto leading-relaxed">Toggle "Go Available" to simulate live deliveries and start taking snack order tasks!</p>
              </div>
            </div>
          ) : activeAssignedOrders.length === 0 ? (
            <div className="bg-[#0e0e11] border border-white/5 rounded-2xl p-12 text-center text-zinc-500 space-y-3 shadow-xl">
              <ShoppingBag className="mx-auto text-zinc-750 animate-pulse" size={32} />
              <div>
                <p className="text-sm font-extrabold text-zinc-400">No active deliveries assigned yet.</p>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-[320px] mx-auto leading-relaxed font-sans">
                  Go to the Customer View, place an order, then go to the Admin Dashboard to assign it to <span className="font-bold text-amber-400">{activeRider.name}</span>!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAssignedOrders.map(order => {
                const isPrepping = order.status === 'accepted' || order.status === 'preparing';
                const isOut = order.status === 'out_for_delivery';

                return (
                  <div
                    key={order.id}
                    className="bg-[#0e0e11] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl hover:border-white/10 transition-all"
                  >
                    {/* Run Header */}
                    <div className="flex justify-between items-start border-b border-white/5 pb-3 text-xs">
                      <div>
                        <span className="font-mono text-xs font-black text-amber-500">RUN: {order.id}</span>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">Assigned: {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <span className={`inline-block text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                        isOut 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                          : 'bg-[#070708] border-white/5 text-zinc-400'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Customer details for rider */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#070708] p-3.5 rounded-xl border border-white/5">
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 font-extrabold uppercase block tracking-wider">Dropoff Client</span>
                        <p className="font-extrabold text-zinc-200">{order.customerName}</p>
                        <p className="text-zinc-400 font-mono text-[11px]">{order.customerPhone}</p>
                        {order.deliveryNotes && (
                          <p className="text-[11px] text-amber-400 bg-amber-400/5 p-2 rounded-lg border border-amber-400/10 mt-1.5 italic font-sans">
                            " {order.deliveryNotes} "
                          </p>
                        )}
                      </div>

                      <div className="space-y-1 border-t md:border-t-0 md:border-l border-white/5 pt-2.5 md:pt-0 md:pl-4">
                        <span className="text-[10px] text-zinc-500 font-extrabold uppercase block flex items-center gap-1 tracking-wider">
                          <MapPin size={10} /> Address Coordinates
                        </span>
                        <p className="text-zinc-300 leading-relaxed font-sans">{order.address}</p>
                      </div>
                    </div>

                    {/* Items & Payment Due */}
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-extrabold uppercase block tracking-wider">Cargo Size</span>
                        <span className="text-zinc-300 font-medium">{order.items.reduce((sum, item) => sum + item.quantity, 0)} snacks (box packed)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 font-extrabold uppercase block tracking-wider">COD Collection Due</span>
                        <span className="text-base font-black text-amber-400 font-mono">₹{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
                      {isPrepping && (
                        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 text-xs bg-[#070708]/40 p-2.5 rounded-xl border border-white/5">
                          <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                            <AlertCircle size={14} className="text-amber-500" />
                            Awaiting kitchen food prep. You can pick up once ready.
                          </span>
                          <button
                            onClick={() => handlePickUp(order.id)}
                            className="w-full md:w-auto px-4 py-2 bg-amber-500 text-zinc-950 font-black text-xs rounded-xl hover:bg-amber-600 cursor-pointer transition-colors"
                          >
                            Pick Up & Start Run
                          </button>
                        </div>
                      )}

                      {isOut && (
                        <button
                          onClick={() => handleDeliver(order.id, order.totalAmount)}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-[#070708] font-black text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/15"
                        >
                          Handover Snack Box & Collect COD Cash (₹{order.totalAmount.toFixed(2)})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rider History log Column (1/3 width) */}
        <div className="space-y-4">
          <h3 className="font-sans font-extrabold text-sm text-zinc-300 border-b border-white/5 pb-2">
            Completed Run History ({deliveredHistory.length})
          </h3>

          {deliveredHistory.length === 0 ? (
            <div className="bg-[#0e0e11] border border-white/5 p-6 rounded-2xl text-center text-zinc-500 shadow-xl">
              <CheckCircle2 size={24} className="mx-auto text-zinc-700 mb-1 animate-pulse" />
              <p className="text-xs font-medium text-zinc-500">No successful drops logged yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {deliveredHistory.map(order => (
                <div
                  key={order.id}
                  className="bg-[#070708]/80 border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs hover:border-white/10 transition-colors"
                >
                  <div>
                    <span className="font-mono font-black text-zinc-300">{order.id}</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">{order.customerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-emerald-400">+${order.totalAmount.toFixed(2)}</span>
                    <span className="block text-[9px] text-zinc-500 uppercase font-extrabold mt-0.5">COD Collected</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
