import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SnackItem, Order } from '../types';
import { CATEGORIES } from '../data';
import { Search, Clock, Plus, Minus, ShoppingBag, X, Phone, MapPin, Truck, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerPortalProps {
  isCartOpen: boolean;
  onCloseCart: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ isCartOpen, onCloseCart }) => {
  const {
    snacks,
    orders,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    placeOrder,
    updateOrderStatus
  } = useApp();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Checkout State
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  // Selected Order for Real-Time Tracking
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Filter Snacks
  const filteredSnacks = snacks.filter(snack => {
    const matchesSearch = snack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          snack.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || snack.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Cart Metrics
  const cartTotal = cart.reduce((total, item) => total + (item.snack.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Place Order Handle
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setCheckoutError('Please fill out all required fields.');
      return;
    }

    const createdOrder = placeOrder(customerName, customerPhone, customerAddress, deliveryNotes);
    if (createdOrder) {
      setIsCheckingOut(false);
      onCloseCart();
      setTrackingOrderId(createdOrder.id); // Go directly to real-time tracking for this order!
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setDeliveryNotes('');
    }
  };

  const activeTrackingOrder = orders.find(o => o.id === trackingOrderId) || orders.find(o => o.status !== 'delivered' && o.status !== 'cancelled');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Banner / Hero section */}
      <div className="bg-gradient-to-br from-[#111115] via-[#0c0c0e] to-[#070708] rounded-3xl p-6 md:p-10 border border-white/5 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="max-w-xl relative z-10">
          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5 w-fit mb-4">
            <Sparkles size={12} className="text-amber-500" /> Live Fresh Snacks 
          </span>
          <h2 className="font-sans font-extrabold text-3xl md:text-5xl text-white tracking-tight leading-tight">
            Craving delicious snacks? <span className="text-amber-500 font-black">Fast COD delivery</span> at your doorstep.
          </h2>
          <p className="text-zinc-400 mt-4 text-xs md:text-sm leading-relaxed font-sans">
            Choose from crispy samosas, house-tossed potato chips, signature boba teas, and soft-baked cookies. Order now and pay safely only when it arrives!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Snack Listing (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters & Search Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e0e11]/90 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search savory samosas, spicy chips, sweets..."
                className="w-full bg-[#070708] text-white placeholder-zinc-500 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none transition-all shadow-inner"
              />
            </div>
            
            {/* Categories Carousel */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/20'
                      : 'bg-[#121214] text-zinc-400 border border-white/5 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Snacks Grid */}
          {filteredSnacks.length === 0 ? (
            <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-12 text-center text-zinc-500">
              <ShoppingBag size={40} className="mx-auto mb-3 text-zinc-600" />
              <p className="font-bold text-zinc-400">No delicious snacks found matching your search.</p>
              <p className="text-xs text-zinc-500 mt-1">Try selecting a different category or adjusting your search term!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredSnacks.map(snack => {
                const isOutOfStock = snack.stock === 0;
                const isLowStock = snack.stock > 0 && snack.stock <= 5;
                const inCartItem = cart.find(item => item.snack.id === snack.id);

                return (
                  <div
                    key={snack.id}
                    className="bg-[#0e0e11] border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 shadow-xl group flex flex-col"
                  >
                    {/* Item Image */}
                    <div className="relative h-44 overflow-hidden bg-[#070708]">
                      <img
                        src={snack.image}
                        alt={snack.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-90 group-hover:opacity-100"
                      />
                      {/* Popular tag */}
                      {snack.popular && (
                        <span className="absolute top-3 left-3 bg-amber-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md shadow-amber-500/20">
                          Popular Item
                        </span>
                      )}
                      
                      {/* Category tag */}
                      <span className="absolute bottom-3 right-3 bg-[#070708]/90 backdrop-blur-md text-zinc-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-white/10">
                        {snack.category}
                      </span>
                    </div>

                    {/* Item Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-sans font-extrabold text-zinc-100 text-sm group-hover:text-amber-400 transition-colors">
                            {snack.name}
                          </h3>
                          <span className="text-sm font-black text-amber-400 whitespace-nowrap">
                            ₹{snack.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {snack.description}
                        </p>
                      </div>

                      {/* Info & Action Row */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                        {/* Preparation Time & Stock Badge */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <Clock size={12} className="text-zinc-600" />
                            <span>Prep: {snack.prepTime} mins</span>
                          </div>
                          <div>
                            {isOutOfStock ? (
                              <span className="inline-block text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
                                Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-block text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded animate-pulse">
                                Only {snack.stock} left!
                              </span>
                            ) : (
                              <span className="inline-block text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                {snack.stock} in stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Add Button */}
                        {isOutOfStock ? (
                          <button
                            disabled
                            className="bg-[#121214] text-zinc-600 text-xs px-3 py-1.5 rounded-xl font-bold cursor-not-allowed border border-white/5"
                          >
                            Out of Stock
                          </button>
                        ) : (
                          <button
                            onClick={() => addToCart(snack)}
                            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-black px-4 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-amber-500/10 active:scale-95"
                          >
                            <Plus size={13} strokeWidth={3} />
                            Add {inCartItem && `(${inCartItem.quantity})`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Real-time Tracker Panel (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-[#0e0e11] border border-white/5 p-5 rounded-2xl shadow-2xl flex flex-col">
            <h3 className="font-sans font-extrabold text-sm text-white border-b border-white/5 pb-3.5 flex items-center gap-2 tracking-tight">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Real-Time Order Tracker
            </h3>

            {activeTrackingOrder ? (
              <div className="mt-4 space-y-4">
                {/* Active Selection Dropdown */}
                {orders.length > 1 && (
                  <div className="flex items-center justify-between gap-2 bg-[#070708] p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-500 font-black uppercase pl-1 tracking-wide">Select Order:</span>
                    <select
                      value={activeTrackingOrder.id}
                      onChange={(e) => setTrackingOrderId(e.target.value)}
                      className="bg-transparent text-xs text-amber-400 font-extrabold focus:outline-none cursor-pointer max-w-[150px]"
                    >
                      {orders.map(o => (
                        <option key={o.id} value={o.id} className="bg-[#0e0e11] text-white font-mono">
                          {o.id} ({o.status.replace('_', ' ')})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Tracker Card Head */}
                <div className="bg-[#070708] p-3 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-zinc-500 font-mono">ID: <span className="text-amber-500 font-black">{activeTrackingOrder.id}</span></span>
                    <span className="block text-[9px] text-zinc-500 mt-0.5 font-mono">
                      Placed: {new Date(activeTrackingOrder.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2.5 py-1 rounded-lg">
                      {activeTrackingOrder.status.replace('_', ' ')}
                    </span>
                    <span className="block text-[9px] text-zinc-500 font-bold mt-1.5 uppercase tracking-wide">COD Only</span>
                  </div>
                </div>

                {/* Stepper Progression */}
                <div className="space-y-4 py-2 pl-3">
                  {[
                    { key: 'pending', label: 'Order Placed', desc: 'Awaiting shop confirmation' },
                    { key: 'accepted', label: 'Order Accepted', desc: 'Confirmed by kitchen' },
                    { key: 'preparing', label: 'Preparing Snacks', desc: 'Frying hot and crisp' },
                    { key: 'out_for_delivery', label: 'On The Way', desc: 'Rider is en route' },
                    { key: 'delivered', label: 'Delivered', desc: 'Enjoy your snack treat!' }
                  ].map((step, idx) => {
                    const stepStatusOrder: Record<string, number> = {
                      pending: 1,
                      accepted: 2,
                      preparing: 3,
                      out_for_delivery: 4,
                      delivered: 5,
                      cancelled: -1
                    };

                    const currentOrderStepNum = stepStatusOrder[activeTrackingOrder.status];
                    const thisStepNum = idx + 1;
                    
                    const isCompleted = currentOrderStepNum >= thisStepNum && activeTrackingOrder.status !== 'cancelled';
                    const isActive = currentOrderStepNum === thisStepNum && activeTrackingOrder.status !== 'cancelled';
                    
                    // Retrieve matching detail if available
                    const matchedUpdate = activeTrackingOrder.orderUpdates.find(up => up.status === step.key);

                    return (
                      <div key={step.key} className="flex gap-4 relative">
                        {/* Vertical line connector */}
                        {idx < 4 && (
                          <div className={`absolute left-3 top-6 bottom-0 w-0.5 -translate-x-1/2 ${
                            currentOrderStepNum > thisStepNum ? 'bg-amber-500' : 'bg-white/5'
                          }`}></div>
                        )}

                        {/* Step Marker Circle */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all duration-300 relative z-10 ${
                          isCompleted
                            ? 'bg-amber-500 text-zinc-950 border-amber-600 shadow-md shadow-amber-500/20'
                            : isActive
                            ? 'bg-[#070708] text-amber-500 border-amber-500 animate-pulse'
                            : 'bg-[#070708] text-zinc-600 border-white/5'
                        }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </div>

                        {/* Step Details */}
                        <div className="flex-1 text-xs">
                          <h4 className={`font-extrabold tracking-tight ${isActive ? 'text-amber-400' : isCompleted ? 'text-zinc-200' : 'text-zinc-500'}`}>
                            {step.label}
                          </h4>
                          <p className="text-[10px] text-zinc-400 leading-snug mt-0.5">
                            {matchedUpdate ? matchedUpdate.note : step.desc}
                          </p>
                          {matchedUpdate && (
                            <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                              {new Date(matchedUpdate.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Simulated GPS Tracking Visualizer (Only visible when out_for_delivery or preparing) */}
                {(activeTrackingOrder.status === 'out_for_delivery' || activeTrackingOrder.status === 'preparing' || activeTrackingOrder.status === 'accepted') && (
                  <div className="bg-[#070708] border border-white/5 rounded-xl p-3.5 space-y-2.5 overflow-hidden">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1 text-zinc-400">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        Simulated Live Location
                      </span>
                      <span className="font-mono text-amber-500/90 font-bold">ETA: {activeTrackingOrder.status === 'out_for_delivery' ? '7 mins' : 'Kitchen Prep'}</span>
                    </div>

                    {/* Simple Vector Animated Route Map */}
                    <div className="h-20 bg-[#0c0c0e] rounded-lg border border-white/5 relative flex items-center justify-between px-6 overflow-hidden">
                      {/* Grid background pattern */}
                      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:10px_10px]"></div>

                      {/* Store Node */}
                      <div className="text-center relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-black shadow-sm">
                          🏪
                        </div>
                        <span className="text-[8px] text-zinc-500 font-bold uppercase mt-1">Kitchen</span>
                      </div>

                      {/* Travel Path */}
                      <div className="flex-1 h-1 bg-white/5 relative mx-2 rounded-full overflow-hidden">
                        {/* Dashed background route */}
                        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] bg-[size:4px_4px]"></div>
                        
                        {/* Animated runner status indicator */}
                        {activeTrackingOrder.status === 'out_for_delivery' && (
                          <div className="absolute top-0 bottom-0 left-0 bg-amber-500 w-1/2 animate-pulse rounded-full" style={{
                            animation: 'moveRider 8s infinite linear',
                            animationName: 'moveWidth'
                          }}></div>
                        )}
                      </div>

                      {/* Animated Courier Bike Icon */}
                      {activeTrackingOrder.status === 'out_for_delivery' && (
                        <div className="absolute left-1/2 -translate-x-1/2 bg-[#070708] border border-amber-500/40 p-1.5 rounded-full shadow-lg text-amber-400 text-[10px] animate-bounce z-20">
                          🛵
                        </div>
                      )}

                      {/* Customer Node */}
                      <div className="text-center relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-[#070708] border border-white/5 flex items-center justify-center text-zinc-400 text-xs font-black shadow-sm">
                          🏠
                        </div>
                        <span className="text-[8px] text-zinc-500 font-bold uppercase mt-1">You</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assigned Delivery Boy Profile Details */}
                {activeTrackingOrder.deliveryBoyId && (
                  <div className="bg-[#070708] p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-amber-500">
                      <Truck size={18} />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Assigned Delivery Partner</p>
                      <p className="font-extrabold text-zinc-200 mt-0.5">{activeTrackingOrder.deliveryBoyName}</p>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5 font-mono">
                        <Phone size={10} className="text-zinc-600" />
                        <span>Available for Delivery Checks</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Customer cancellation button (Only for pending) */}
                {activeTrackingOrder.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(activeTrackingOrder.id, 'cancelled', 'Order cancelled by customer.')}
                    className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 text-xs rounded-xl font-extrabold transition-all cursor-pointer active:scale-95"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-8 text-center text-zinc-500 py-6">
                <Truck size={28} className="mx-auto text-zinc-700 mb-2" />
                <p className="text-xs">No active orders placed yet.</p>
                <p className="text-[10px] text-zinc-600 mt-1">Order delicious snacks and watch their real-time live progress here!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-over Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={onCloseCart}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            ></motion.div>

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 right-0 max-w-md w-full bg-[#0a0a0b]/98 border-l border-white/10 z-50 shadow-2xl flex flex-col justify-between backdrop-blur-md"
            >
              {/* Cart Drawer Header */}
              <div className="p-4 border-b border-white/5 bg-[#0e0e11] flex items-center justify-between">
                <h3 className="font-sans font-extrabold text-sm text-white flex items-center gap-2">
                  <ShoppingBag size={18} className="text-amber-500" />
                  Your Snack Tray ({cartItemsCount})
                </h3>
                <button
                  onClick={onCloseCart}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Cart Items List / Checkout Form Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!isCheckingOut ? (
                  // CART LIST VIEW
                  cart.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500 space-y-3">
                      <ShoppingBag size={48} className="mx-auto text-zinc-800" />
                      <div>
                        <p className="font-extrabold text-zinc-400 text-sm">Your snack tray is empty.</p>
                        <p className="text-[11px] text-zinc-600 mt-1 max-w-[250px] mx-auto leading-relaxed">Fill it with samosas, peri peri fries, and fresh beverages!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div
                          key={item.snack.id}
                          className="bg-[#0e0e11] p-3 rounded-xl border border-white/5 flex gap-3 items-center justify-between hover:border-white/10 transition-colors"
                        >
                          <img
                            src={item.snack.image}
                            alt={item.snack.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 object-cover rounded-lg bg-[#070708]"
                          />
                          <div className="flex-1 text-xs">
                            <h4 className="font-extrabold text-zinc-200 line-clamp-1">{item.snack.name}</h4>
                            <p className="text-amber-400 font-bold mt-0.5">₹{item.snack.price.toFixed(2)} each</p>
                            
                            {/* Quantity Controllers */}
                            <div className="flex items-center gap-2.5 mt-2">
                              <button
                                onClick={() => updateCartQuantity(item.snack.id, item.quantity - 1)}
                                className="w-5 h-5 bg-[#121214] hover:bg-white/5 text-zinc-300 rounded-md flex items-center justify-center font-bold text-xs cursor-pointer transition-colors border border-white/5"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="font-bold text-zinc-100 font-mono text-xs">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.snack.id, item.quantity + 1)}
                                className="w-5 h-5 bg-[#121214] hover:bg-white/5 text-zinc-300 rounded-md flex items-center justify-center font-bold text-xs cursor-pointer transition-colors border border-white/5"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </div>
                          
                          {/* Trash Delete */}
                          <div className="text-right flex flex-col justify-between items-end h-full">
                            <button
                              onClick={() => removeFromCart(item.snack.id)}
                              className="text-[10px] text-zinc-500 hover:text-red-400 font-bold cursor-pointer transition-colors"
                            >
                              Remove
                            </button>
                            <span className="text-xs font-black text-zinc-100 font-mono mt-4">
                              ₹{(item.snack.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  // CHECKOUT FORM VIEW
                  <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex gap-2.5 text-amber-400">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold block text-[11px] tracking-tight">Cash on Delivery Only (COD)</span>
                        <span className="text-[10px] text-zinc-400 leading-relaxed block mt-0.5">We currently support cash on delivery. Please pay the delivery boy in cash when they arrive with your warm snacks.</span>
                      </div>
                    </div>

                    {checkoutError && (
                      <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 font-semibold">
                        {checkoutError}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Peter Parker"
                          className="w-full bg-[#070708] text-white placeholder-zinc-600 p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none text-xs transition-all shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="e.g. +1 (555) 123-4567"
                          className="w-full bg-[#070708] text-white placeholder-zinc-600 p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none text-xs transition-all shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Delivery Address *</label>
                        <textarea
                          required
                          rows={3}
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="e.g. Apt 4B, 20 Ingram Street, Forest Hills"
                          className="w-full bg-[#070708] text-white placeholder-zinc-600 p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none text-xs resize-none transition-all shadow-inner"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Delivery Instructions (Optional)</label>
                        <input
                          type="text"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          placeholder="e.g. Leave with guard, ring doorbell"
                          className="w-full bg-[#070708] text-white placeholder-zinc-600 p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none text-xs transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Cart Drawer Footer */}
              {cart.length > 0 && (
                <div className="p-4 bg-[#0e0e11] border-t border-white/5 space-y-3.5">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-zinc-400 font-medium">
                      <span>Subtotal</span>
                      <span className="font-mono">₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 font-medium">
                      <span>Delivery Fee</span>
                      <span className="text-emerald-400 font-extrabold uppercase text-[9px] tracking-wide bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25">FREE PROMO</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-white pt-2.5 border-t border-white/5">
                      <span>Total (COD)</span>
                      <span className="font-mono text-amber-400">₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {!isCheckingOut ? (
                    <button
                      onClick={() => setIsCheckingOut(true)}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-lg shadow-amber-500/15"
                    >
                      Proceed to Checkout
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsCheckingOut(false)}
                        className="py-3 bg-[#121214] hover:bg-white/5 text-zinc-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer border border-white/5"
                      >
                        Back to Tray
                      </button>
                      <button
                        type="button"
                        onClick={handlePlaceOrder}
                        className="py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20"
                      >
                        Place COD Order
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
