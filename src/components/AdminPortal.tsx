import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, SnackItem, OrderStatus, DeliveryBoy } from '../types';
import { CATEGORIES } from '../data';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend } from 'recharts';
import { DollarSign, ShoppingBag, Box, TrendingUp, AlertTriangle, ShieldCheck, Edit3, Trash2, Plus, X, ListOrdered, CheckCircle, Truck, Package, Clock, Eye, ShieldAlert } from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    snacks,
    orders,
    updateOrderStatus,
    assignDeliveryBoy,
    updateSnackStock,
    addSnackItem,
    updateSnackItem,
    deleteSnackItem,
    addNotification,
    deliveryBoys,
    addDeliveryBoy,
    updateDeliveryBoy,
    deleteDeliveryBoy
  } = useApp();

  // Authentication State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'inventory' | 'delivery_boys'>('analytics');
  
  // Delivery Boys Management State
  const [showAddBoyForm, setShowAddBoyForm] = useState(false);
  const [editingBoy, setEditingBoy] = useState<DeliveryBoy | null>(null);
  const [newBoyName, setNewBoyName] = useState('');
  const [newBoyPhone, setNewBoyPhone] = useState('');
  const [newBoyPin, setNewBoyPin] = useState('1234');
  const [newBoyAvailable, setNewBoyAvailable] = useState(true);

  // Handlers for Delivery Boys
  const handleAddBoySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoyName.trim() || !newBoyPhone.trim() || !newBoyPin.trim()) {
      addNotification('All fields are required to register a driver!', 'warning');
      return;
    }
    addDeliveryBoy({
      name: newBoyName.trim(),
      phone: newBoyPhone.trim(),
      pin: newBoyPin.trim(),
      available: newBoyAvailable
    });
    setNewBoyName('');
    setNewBoyPhone('');
    setNewBoyPin('1234');
    setNewBoyAvailable(true);
    setShowAddBoyForm(false);
  };

  const handleEditBoySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoy || !editingBoy.name.trim() || !editingBoy.phone.trim() || !editingBoy.pin.trim()) {
      addNotification('Please fill in all fields!', 'warning');
      return;
    }
    updateDeliveryBoy(editingBoy);
    setEditingBoy(null);
  };
  
  // Order list status filter
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all');

  // Inventory forms state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSnack, setEditingSnack] = useState<SnackItem | null>(null);

  // Drag and drop states for image upload
  const [isDraggingAdd, setIsDraggingAdd] = useState(false);
  const [isDraggingEdit, setIsDraggingEdit] = useState(false);
  const fileInputAddRef = React.useRef<HTMLInputElement>(null);
  const fileInputEditRef = React.useRef<HTMLInputElement>(null);

  const processImageFile = (file: File, callback: (base64: string) => void) => {
    if (!file.type.startsWith('image/')) {
      addNotification('Please select a valid image file (PNG, JPG, SVG, WEBP, etc.).', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
        addNotification('Image uploaded and processed successfully!', 'success');
      }
    };
    reader.onerror = () => {
      addNotification('Failed to read image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // New Snack State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Savory');
  const [newPrice, setNewPrice] = useState('4.99');
  const [newStock, setNewStock] = useState('20');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500&auto=format&fit=crop&q=80');
  const [newPrep, setNewPrep] = useState('10');
  const [newPopular, setNewPopular] = useState(false);

  // Quick autofill for demo
  const handleAutofill = () => {
    setEmail('snackswoorld@gmail.com');
    setPassword('Snacksworld2026');
    setAuthError('');
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === 'snackswoorld@gmail.com' && password === 'Snacksworld2026') {
      setIsAuthenticated(true);
      setAuthError('');
      addNotification('Admin authenticated successfully!', 'success');
    } else {
      setAuthError('Invalid admin email or password. Please use correct credentials.');
    }
  };

  // Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  // --- STATS COMPUTATION ---
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const averageOrderValue = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;
  const lowStockItemsCount = snacks.filter(s => s.stock <= 5 && s.stock > 0).length;
  const outOfStockItemsCount = snacks.filter(s => s.stock === 0).length;

  // --- CHART 1: REVENUE TIMELINE ---
  // Create sales chart data based on order history
  const getRevenueTimelineData = () => {
    const datesMap: Record<string, number> = {};
    
    // Seed standard dummy history if empty
    datesMap['Jul 08'] = 34.50;
    datesMap['Jul 09'] = 52.80;
    datesMap['Jul 10'] = 45.10;
    datesMap['Jul 11'] = 78.90;

    // Add current orders
    orders.forEach(order => {
      if (order.status === 'delivered') {
        const date = new Date(order.timestamp);
        const formattedDate = date.toLocaleDateString([], { month: 'short', day: '2-digit' });
        datesMap[formattedDate] = (datesMap[formattedDate] || 0) + order.totalAmount;
      }
    });

    return Object.keys(datesMap).map(key => ({
      date: key,
      Revenue: parseFloat(datesMap[key].toFixed(2))
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // --- CHART 2: POPULAR SNACKS BAR ---
  // Count product occurrences in orders
  const getTopSnackSalesData = () => {
    const counts: Record<string, number> = {};
    
    // Parse order items
    orders.forEach(order => {
      if (order.status === 'delivered') {
        order.items.forEach(item => {
          counts[item.snack.name] = (counts[item.snack.name] || 0) + item.quantity;
        });
      }
    });

    // If zero sales, seed with default catalog
    const data = Object.keys(counts).map(name => ({
      name: name.split(' (')[0], // Shorten name
      Sold: counts[name]
    })).sort((a, b) => b.Sold - a.Sold);

    if (data.length === 0) {
      return snacks.slice(0, 5).map(s => ({
        name: s.name.split(' (')[0],
        Sold: Math.floor(Math.random() * 8) + 2
      }));
    }
    return data.slice(0, 5);
  };

  // Filter orders for Management view
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  // Handle Add Snack Submission
  const handleAddSnack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice || !newStock) return;

    addSnackItem({
      name: newName,
      description: newDesc,
      category: newCategory,
      price: parseFloat(newPrice),
      stock: parseInt(newStock),
      image: newImage,
      prepTime: parseInt(newPrep),
      popular: newPopular
    });

    // Reset Form
    setShowAddForm(false);
    setNewName('');
    setNewDesc('');
    setNewPrice('4.99');
    setNewStock('20');
    setNewPrep('10');
    setNewPopular(false);
  };

  // Handle Edit Snack Submission
  const handleEditSnackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSnack) return;

    updateSnackItem(editingSnack);
    setEditingSnack(null);
  };

  const handleStockReplenish = (snackId: string, current: number, addition: number) => {
    updateSnackStock(snackId, current + addition);
  };

  // ADMIN SIGN IN VIEW
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-[#0e0e11] border border-white/5 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center font-black border border-amber-500/20">
            🔐
          </div>
          <h2 className="font-sans font-extrabold text-xl text-white">Administrator Portal</h2>
          <p className="text-xs text-zinc-400 font-sans">Please authenticate with secure credentials to manage sales, inventory, and orders.</p>
        </div>

        {authError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg font-bold">
            {authError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full bg-[#070708] text-white placeholder-zinc-700 p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Secure Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#070708] text-white placeholder-zinc-700 p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/15"
          >
            Authenticate Admin Role
          </button>
        </form>

        <div className="border-t border-white/5 pt-4 flex flex-col items-center gap-2">
          <p className="text-[10px] text-zinc-500">Testing credentials provided by user:</p>
          <button
            onClick={handleAutofill}
            className="px-4 py-2 bg-[#121214] hover:bg-white/5 text-zinc-300 text-[10px] font-bold rounded-xl border border-white/5 cursor-pointer transition-all"
          >
            Autofill Authorized Demo Credentials
          </button>
        </div>
      </div>
    );
  }

  // AUTHENTICATED PORTAL VIEW
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header Panel */}
      <div className="bg-[#0e0e11] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 p-2.5 rounded-xl">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="font-sans font-extrabold text-lg text-white tracking-tight">Store Control Dashboard</h2>
            <p className="text-[11px] text-zinc-500">Authenticated: <span className="font-mono text-amber-400 font-bold">snackswoorld@gmail.com</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-[#070708] rounded-xl p-1 border border-white/5 flex flex-wrap gap-1">
            {[
              { id: 'analytics', label: 'Sales & Analytics', icon: TrendingUp },
              { id: 'orders', label: `Orders (${orders.length})`, icon: ListOrdered },
              { id: 'inventory', label: 'Snack Inventory', icon: Box },
              { id: 'delivery_boys', label: 'Drivers Fleet', icon: Truck }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <TabIcon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl border border-white/5 hover:border-red-500/10 cursor-pointer transition-all"
            title="Log Out"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {(lowStockItemsCount > 0 || outOfStockItemsCount > 0) && (
        <div className="bg-amber-500/5 border border-amber-500/25 rounded-2xl p-4 flex gap-3 text-xs text-amber-500 items-start">
          <AlertTriangle className="shrink-0 mt-0.5 animate-bounce" size={16} />
          <div className="flex-1 font-sans">
            <span className="font-extrabold block">Action Required: Inventory Shortage Warning</span>
            <span className="text-zinc-400 text-[11px] leading-relaxed">
              You have <span className="text-red-500 font-black">{outOfStockItemsCount} out-of-stock</span> and <span className="text-amber-400 font-black">{lowStockItemsCount} low-stock</span> snack items. Replenish their stock directly in the "Snack Inventory" tab below to allow customers to order them.
            </span>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: SALES ANALYTICS --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Key Metrics Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Store Net Revenue', value: `₹${totalRevenue.toFixed(2)}`, desc: 'From completed COD sales', icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10' },
                { label: 'Total Orders Placed', value: totalOrdersCount, desc: 'Across all time states', icon: ShoppingBag, color: 'text-amber-400 bg-amber-500/10' },
                { label: 'Active Process', value: activeOrdersCount, desc: 'Preparing or out on delivery', icon: Clock, color: 'text-sky-400 bg-sky-500/10' },
                { label: 'Avg Order Value', value: `₹${averageOrderValue.toFixed(2)}`, desc: 'Average ticket per receipt', icon: TrendingUp, color: 'text-violet-400 bg-violet-500/10' }
              ].map((stat, i) => {
              const StatIcon = stat.icon;
              return (
                <div key={i} className="bg-[#0e0e11] border border-white/5 rounded-2xl p-4.5 space-y-3.5 shadow-xl hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">{stat.label}</span>
                    <span className={`p-2 rounded-xl border border-white/5 ${stat.color}`}>
                      <StatIcon size={16} />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-xl text-white tracking-tight">{stat.value}</h3>
                    <p className="text-[10px] text-zinc-400 font-sans mt-0.5">{stat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recharts Graphical Visuals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Volume over Time (Area Chart) */}
            <div className="bg-[#0e0e11] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider">Revenue Timeline</h3>
                <p className="text-[10px] text-zinc-500 font-sans">Total COD revenue collected daily (INR)</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getRevenueTimelineData()}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} tickLine={false} />
                    <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#070708', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                    <Area type="monotone" dataKey="Revenue" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Product Quantities (Bar Chart) */}
            <div className="bg-[#0e0e11] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider">Top-Selling Snacks</h3>
                <p className="text-[10px] text-zinc-500 font-sans">Most requested menu items by quantities (Units)</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTopSnackSalesData()}>
                    <XAxis dataKey="name" stroke="#3f3f46" fontSize={9} tickLine={false} />
                    <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#070708', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                    <Bar dataKey="Sold" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                      {getTopSnackSalesData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#d97706'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: ORDER MANAGEMENT --- */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Status Sub-Filters Toolbar */}
          <div className="flex flex-wrap items-center gap-1 bg-[#070708] p-1.5 rounded-xl border border-white/5">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'pending', label: 'Pending Acceptance' },
              { id: 'accepted', label: 'Accepted' },
              { id: 'preparing', label: 'Kitchen Prep' },
              { id: 'out_for_delivery', label: 'Out Delivering' },
              { id: 'delivered', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setOrderFilter(filter.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  orderFilter === filter.id
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Orders Grid */}
          {filteredOrders.length === 0 ? (
            <div className="bg-[#0e0e11] border border-white/5 rounded-2xl p-16 text-center text-zinc-500 space-y-3 shadow-xl">
              <ShoppingBag size={32} className="mx-auto text-zinc-700 animate-pulse" />
              <div>
                <p className="text-sm font-extrabold text-zinc-400">No orders currently match this filter.</p>
                <p className="text-[11px] text-zinc-600 mt-1 max-w-[280px] mx-auto font-sans leading-relaxed">New orders placed by customers will stream in automatically here.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-[#0e0e11] border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-white/10 transition-all shadow-xl"
                >
                  {/* Card Header Row */}
                  <div className="flex justify-between items-start border-b border-white/5 pb-3">
                    <div>
                      <span className="font-mono text-xs font-black text-amber-500">{order.id}</span>
                      <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                        {new Date(order.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div>
                      <span className="inline-block text-[9px] font-black uppercase bg-[#070708] text-amber-400 px-2.5 py-1 rounded-lg border border-white/5">
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information Block */}
                  <div className="text-xs space-y-1 bg-[#070708] p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-zinc-500 font-extrabold uppercase mb-1 tracking-wider">Customer Details</p>
                    <p className="font-extrabold text-zinc-200">{order.customerName}</p>
                    <p className="text-zinc-400 font-mono text-[11px]">{order.customerPhone}</p>
                    <p className="text-zinc-400 leading-relaxed mt-1"><span className="text-zinc-500 font-bold font-sans">Address:</span> {order.address}</p>
                    {order.deliveryNotes && (
                      <p className="text-[11px] text-amber-400 bg-amber-400/5 px-2.5 py-1.5 rounded-lg border border-amber-400/10 mt-1.5 italic font-sans">
                        " {order.deliveryNotes} "
                      </p>
                    )}
                  </div>

                  {/* Ordered Snack items Summary */}
                  <div className="text-xs space-y-2 pt-1">
                    <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Snack Tray Receipt</p>
                    <div className="divide-y divide-white/5 bg-[#070708]/30 px-3 py-1.5 rounded-xl border border-white/5">
                      {order.items.map(item => (
                        <div key={item.snack.id} className="py-2 flex justify-between text-zinc-300">
                          <span className="font-medium">{item.snack.name} <span className="text-amber-400 font-black font-mono ml-1">x{item.quantity}</span></span>
                          <span className="font-mono text-zinc-400">₹{(item.snack.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-extrabold text-white pt-2.5 border-t border-white/5">
                      <span>Total Amount (COD)</span>
                      <span className="text-amber-400 font-mono text-sm font-black">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Contextual Action Buttons */}
                  <div className="pt-3 border-t border-white/5 flex flex-wrap gap-2 justify-end">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled', 'Order declined by administrator.')}
                          className="px-4 py-2 bg-red-950/20 text-red-400 font-extrabold text-[11px] rounded-xl border border-red-500/15 hover:bg-red-950/40 cursor-pointer transition-colors"
                        >
                          Decline Order
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'accepted', 'Your snack order has been accepted and sent to the kitchen!')}
                          className="px-4 py-2 bg-amber-500 text-zinc-950 font-black text-[11px] rounded-xl hover:bg-amber-600 cursor-pointer transition-colors"
                        >
                          Accept Order
                        </button>
                      </>
                    )}

                    {order.status === 'accepted' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing', 'Chef is now frying and prepping your snacks. Watch out!')}
                        className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-black text-[11px] rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 border border-amber-500/25"
                      >
                        <Package size={13} />
                        Start Kitchen Preparation
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <div className="w-full flex flex-col gap-2.5">
                        <label className="text-[10px] text-zinc-500 font-black uppercase block tracking-wider">Assign Delivery Boy & Dispatch:</label>
                        <div className="flex gap-2">
                          <select
                            id={`rider-select-${order.id}`}
                            className="bg-[#070708] text-white text-[11px] p-2.5 rounded-xl border border-white/5 flex-1 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                assignDeliveryBoy(order.id, e.target.value);
                              }
                            }}
                          >
                            <option value="" disabled>Select Delivery Rider...</option>
                            {deliveryBoys.map(db => (
                              <option key={db.id} value={db.id}>
                                {db.name} ({db.available ? 'Online' : 'Offline'})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              if (!order.deliveryBoyId) {
                                alert('Please select and assign a delivery partner first!');
                                return;
                              }
                              updateOrderStatus(
                                order.id,
                                'out_for_delivery',
                                `Snacks are packed hot! Rider ${order.deliveryBoyName} is heading towards you.`
                              );
                            }}
                            className="px-4 py-2 bg-amber-500 text-zinc-950 font-black text-[11px] rounded-xl hover:bg-amber-600 cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                          >
                            <Truck size={13} />
                            Dispatch Order
                          </button>
                        </div>
                      </div>
                    )}

                    {order.status === 'out_for_delivery' && (
                      <div className="w-full bg-[#070708] p-2.5 rounded-xl border border-white/5 text-[11px] text-zinc-400 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
                          In Transit: <span className="font-extrabold text-zinc-200">{order.deliveryBoyName}</span>
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">ETA 7 mins</span>
                      </div>
                    )}

                    {order.status === 'delivered' && (
                      <div className="w-full bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center gap-2">
                        <CheckCircle size={14} />
                        <span className="font-medium">Completed: Payment Collected on Delivery.</span>
                      </div>
                    )}

                    {order.status === 'cancelled' && (
                      <div className="w-full bg-red-500/5 p-2.5 rounded-xl border border-red-500/20 text-[11px] text-red-400 flex items-center gap-2">
                        <X size={14} />
                        <span className="font-medium">Cancelled / Order Voided.</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT: INVENTORY & STOCK --- */}
      {activeTab === 'inventory' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center bg-[#070708] p-3 rounded-xl border border-white/5">
            <div>
              <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider">Snacks Menu Listing</h3>
              <p className="text-[10px] text-zinc-500 font-sans">Configure prices, catalog listings, and update stock directly</p>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingSnack(null);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all hover:shadow-lg shadow-amber-500/10"
            >
              <Plus size={14} strokeWidth={3} />
              Add New Snack
            </button>
          </div>

          {/* Add Snack Inline Form */}
          {showAddForm && (
            <form onSubmit={handleAddSnack} className="bg-[#0e0e11] border border-white/5 rounded-2xl p-5 text-xs space-y-4 relative shadow-2xl">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
              <h4 className="font-extrabold text-white text-sm">Add New Snack to Digital Menu</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Snack Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Garlic Cheese Bread"
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    required
                    value={newPrep}
                    onChange={(e) => setNewPrep(e.target.value)}
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Upload Snack Image *</label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingAdd(true);
                      }}
                      onDragLeave={() => setIsDraggingAdd(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingAdd(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          processImageFile(e.dataTransfer.files[0], setNewImage);
                        }
                      }}
                      onClick={() => fileInputAddRef.current?.click()}
                      className={`h-[42px] border border-dashed rounded-xl flex items-center justify-center px-3 cursor-pointer transition-all ${
                        isDraggingAdd
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-white/10 bg-[#070708] hover:border-amber-500/30 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputAddRef}
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            processImageFile(e.target.files[0], setNewImage);
                          }
                        }}
                        className="hidden"
                      />
                      {newImage.startsWith('data:') ? (
                        <div className="flex items-center gap-2 w-full h-full overflow-hidden">
                          <img src={newImage} className="w-7 h-7 object-cover rounded-lg border border-white/10 shrink-0" alt="Preview" />
                          <div className="text-left text-[10px] truncate">
                            <span className="font-extrabold text-emerald-400 block leading-tight">✓ Image Loaded</span>
                            <span className="text-zinc-500 block truncate">Click to replace</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-[10px] font-bold block">Drag & Drop or Click to Upload</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Or Paste Image URL</label>
                    <input
                      type="text"
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none text-[11px] font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-300">
                    <input
                      type="checkbox"
                      checked={newPopular}
                      onChange={(e) => setNewPopular(e.target.checked)}
                      className="w-4 h-4 rounded border-white/5 bg-[#070708] accent-amber-500"
                    />
                    Feature as Popular Item
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Crispy outside, cheesy inside..."
                  rows={2}
                  className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 text-zinc-950 font-black rounded-xl hover:bg-amber-600 transition-all cursor-pointer shadow-md shadow-amber-500/10"
              >
                Save New Snack
              </button>
            </form>
          )}

          {/* Edit Snack Inline Form */}
          {editingSnack && (
            <form onSubmit={handleEditSnackSubmit} className="bg-[#0e0e11] border border-white/5 rounded-2xl p-5 text-xs space-y-4 relative shadow-2xl">
              <button
                type="button"
                onClick={() => setEditingSnack(null)}
                className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
              <h4 className="font-extrabold text-amber-500 text-sm flex items-center gap-1.5">
                <Edit3 size={15} /> Edit Snack: {editingSnack.name}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Snack Name *</label>
                  <input
                    type="text"
                    required
                    value={editingSnack.name}
                    onChange={(e) => setEditingSnack({ ...editingSnack, name: e.target.value })}
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={editingSnack.price}
                    onChange={(e) => setEditingSnack({ ...editingSnack, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Current Stock *</label>
                  <input
                    type="number"
                    required
                    value={editingSnack.stock}
                    onChange={(e) => setEditingSnack({ ...editingSnack, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={editingSnack.category}
                    onChange={(e) => setEditingSnack({ ...editingSnack, category: e.target.value })}
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    required
                    value={editingSnack.prepTime}
                    onChange={(e) => setEditingSnack({ ...editingSnack, prepTime: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-300">
                    <input
                      type="checkbox"
                      checked={editingSnack.popular}
                      onChange={(e) => setEditingSnack({ ...editingSnack, popular: e.target.checked })}
                      className="w-4 h-4 rounded border-white/5 bg-[#070708] accent-amber-500"
                    />
                    Feature as Popular Item
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Upload Snack Image</label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingEdit(true);
                    }}
                    onDragLeave={() => setIsDraggingEdit(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingEdit(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        processImageFile(e.dataTransfer.files[0], (base64) => {
                          setEditingSnack({ ...editingSnack, image: base64 });
                        });
                      }
                    }}
                    onClick={() => fileInputEditRef.current?.click()}
                    className={`h-[42px] border border-dashed rounded-xl flex items-center justify-center px-3 cursor-pointer transition-all ${
                      isDraggingEdit
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-white/10 bg-[#070708] hover:border-amber-500/30 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputEditRef}
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          processImageFile(e.target.files[0], (base64) => {
                            setEditingSnack({ ...editingSnack, image: base64 });
                          });
                        }
                      }}
                      className="hidden"
                    />
                    {editingSnack.image.startsWith('data:') ? (
                      <div className="flex items-center gap-2 w-full h-full overflow-hidden">
                        <img src={editingSnack.image} className="w-7 h-7 object-cover rounded-lg border border-white/10 shrink-0" alt="Preview" />
                        <div className="text-left text-[10px] truncate">
                          <span className="font-extrabold text-emerald-400 block leading-tight">✓ Image Loaded</span>
                          <span className="text-zinc-500 block truncate">Click to replace</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 w-full h-full overflow-hidden">
                        <img src={editingSnack.image} className="w-7 h-7 object-cover rounded-lg border border-white/10 shrink-0" alt="Preview" />
                        <div className="text-left text-[10px] truncate">
                          <span className="font-extrabold text-amber-500 block leading-tight">✓ Preset URL Image</span>
                          <span className="text-zinc-500 block truncate">Click to replace</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Or Edit Image URL</label>
                  <input
                    type="text"
                    value={editingSnack.image}
                    onChange={(e) => setEditingSnack({ ...editingSnack, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none text-[11px] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  value={editingSnack.description}
                  onChange={(e) => setEditingSnack({ ...editingSnack, description: e.target.value })}
                  rows={2}
                  className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 text-zinc-950 font-black rounded-xl hover:bg-amber-600 transition-all cursor-pointer shadow-md shadow-amber-500/10"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSnack(null)}
                  className="px-5 py-2.5 bg-[#121214] text-zinc-300 font-bold rounded-xl hover:bg-white/5 border border-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Snacks Table */}
          <div className="bg-[#0e0e11] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#070708] text-zinc-400 border-b border-white/5 font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="p-3.5">Snack Item</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Prep Time</th>
                    <th className="p-3.5">Stock Level</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {snacks.map(snack => {
                    const isOut = snack.stock === 0;
                    const isLow = snack.stock > 0 && snack.stock <= 5;
                    return (
                      <tr key={snack.id} className="hover:bg-white/2 transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={snack.image}
                            alt={snack.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-cover rounded-lg bg-[#070708]"
                          />
                          <div>
                            <span className="font-extrabold text-zinc-200 block text-xs">{snack.name}</span>
                            <span className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{snack.description}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-zinc-400 font-sans">{snack.category}</td>
                        <td className="p-3.5 font-mono font-black text-amber-400 text-xs">₹{snack.price.toFixed(2)}</td>
                        <td className="p-3.5 text-zinc-400 font-mono">{snack.prepTime} mins</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            {isOut ? (
                              <span className="text-[9px] font-black text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded">
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded animate-pulse">
                                Low Stock: {snack.stock}
                              </span>
                            ) : (
                              <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                                Surplus: {snack.stock}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-3.5">
                            {/* Stock Quick replenishment */}
                            <div className="flex items-center gap-1.5 bg-[#070708] px-1.5 py-1 rounded-lg border border-white/5">
                              <span className="text-[9px] text-zinc-500 font-extrabold uppercase font-sans">Quick Add:</span>
                              <button
                                onClick={() => handleStockReplenish(snack.id, snack.stock, 5)}
                                className="px-1.5 py-0.5 bg-[#121214] hover:bg-white/5 text-emerald-400 rounded text-[9px] font-extrabold cursor-pointer border border-white/5"
                                title="Replenish stock (+5 units)"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleStockReplenish(snack.id, snack.stock, 15)}
                                className="px-1.5 py-0.5 bg-[#121214] hover:bg-white/5 text-emerald-400 rounded text-[9px] font-extrabold cursor-pointer border border-white/5"
                                title="Replenish stock (+15 units)"
                              >
                                +15
                              </button>
                            </div>

                            {/* Edit Button */}
                            <button
                              onClick={() => {
                                setEditingSnack(snack);
                                setShowAddForm(false);
                              }}
                              className="p-1.5 bg-[#121214] hover:bg-white/5 text-zinc-300 rounded-lg cursor-pointer border border-white/5"
                              title="Edit Details"
                            >
                              <Edit3 size={13} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${snack.name}?`)) {
                                  deleteSnackItem(snack.id);
                                }
                              }}
                              className="p-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-lg cursor-pointer border border-red-500/10"
                              title="Delete Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: DELIVERY DRIVERS FLEET --- */}
      {activeTab === 'delivery_boys' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center bg-[#070708] p-3 rounded-xl border border-white/5">
            <div>
              <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider">Registered Drivers Fleet</h3>
              <p className="text-[10px] text-zinc-500 font-sans">Create and manage delivery driver accounts, login credentials, and status</p>
            </div>
            <button
              onClick={() => {
                setShowAddBoyForm(true);
                setEditingBoy(null);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all hover:shadow-lg shadow-amber-500/10"
            >
              <Plus size={14} strokeWidth={3} />
              Register New Driver
            </button>
          </div>

          {/* Add Driver Inline Form */}
          {showAddBoyForm && (
            <form onSubmit={handleAddBoySubmit} className="bg-[#0e0e11] border border-white/5 rounded-2xl p-5 text-xs space-y-4 relative shadow-2xl animate-in slide-in-from-top-4 duration-200">
              <button
                type="button"
                onClick={() => setShowAddBoyForm(false)}
                className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
              <h4 className="font-extrabold text-white text-sm">Register New Delivery Driver</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Driver Name *</label>
                  <input
                    type="text"
                    required
                    value={newBoyName}
                    onChange={(e) => setNewBoyName(e.target.value)}
                    placeholder="e.g. John Doe (Bike #402)"
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newBoyPhone}
                    onChange={(e) => setNewBoyPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 321-4567"
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Secure Sign-In PIN *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={newBoyPin}
                    onChange={(e) => setNewBoyPin(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Initial Status</label>
                  <select
                    value={newBoyAvailable ? 'online' : 'offline'}
                    onChange={(e) => setNewBoyAvailable(e.target.value === 'online')}
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none cursor-pointer"
                  >
                    <option value="online">Online / Available</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 text-zinc-950 font-black rounded-xl hover:bg-amber-600 transition-all cursor-pointer shadow-md shadow-amber-500/10"
                >
                  Register Driver
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBoyForm(false)}
                  className="px-5 py-2.5 bg-[#121214] text-zinc-300 font-bold rounded-xl hover:bg-white/5 border border-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Edit Driver Inline Form */}
          {editingBoy && (
            <form onSubmit={handleEditBoySubmit} className="bg-[#0e0e11] border border-white/5 rounded-2xl p-5 text-xs space-y-4 relative shadow-2xl animate-in slide-in-from-top-4 duration-200">
              <button
                type="button"
                onClick={() => setEditingBoy(null)}
                className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
              <h4 className="font-extrabold text-amber-500 text-sm flex items-center gap-1.5">
                <Edit3 size={15} /> Edit Driver: {editingBoy.name}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Driver Name *</label>
                  <input
                    type="text"
                    required
                    value={editingBoy.name}
                    onChange={(e) => setEditingBoy({ ...editingBoy, name: e.target.value })}
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={editingBoy.phone}
                    onChange={(e) => setEditingBoy({ ...editingBoy, phone: e.target.value })}
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Secure Sign-In PIN *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={editingBoy.pin}
                    onChange={(e) => setEditingBoy({ ...editingBoy, pin: e.target.value })}
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={editingBoy.available ? 'online' : 'offline'}
                    onChange={(e) => setEditingBoy({ ...editingBoy, available: e.target.value === 'online' })}
                    className="w-full bg-[#070708] text-white p-2.5 rounded-xl border border-white/5 focus:border-amber-500/50 focus:outline-none cursor-pointer"
                  >
                    <option value="online">Online / Available</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 text-zinc-950 font-black rounded-xl hover:bg-amber-600 transition-all cursor-pointer shadow-md shadow-amber-500/10"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBoy(null)}
                  className="px-5 py-2.5 bg-[#121214] text-zinc-300 font-bold rounded-xl hover:bg-white/5 border border-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Drivers Table */}
          <div className="bg-[#0e0e11] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#070708] text-zinc-400 border-b border-white/5 font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="p-3.5">Driver ID</th>
                    <th className="p-3.5">Driver Name</th>
                    <th className="p-3.5">Phone Number</th>
                    <th className="p-3.5">Sign-In PIN</th>
                    <th className="p-3.5">Available Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {deliveryBoys.map(db => {
                    return (
                      <tr key={db.id} className="hover:bg-white/2 transition-colors">
                        <td className="p-3.5 font-mono text-zinc-500 font-bold">{db.id}</td>
                        <td className="p-3.5 font-extrabold text-zinc-200">{db.name}</td>
                        <td className="p-3.5 text-zinc-400 font-mono">{db.phone}</td>
                        <td className="p-3.5">
                          <span className="font-mono bg-white/5 px-2.5 py-1 rounded border border-white/5 text-amber-400 font-black tracking-widest">
                            {db.pin}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            {db.available ? (
                              <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                Available
                              </span>
                            ) : (
                              <span className="text-[9px] font-black text-zinc-400 bg-zinc-500/10 border border-white/5 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></span>
                                Offline
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {/* Toggle Availability Quick Action */}
                            <button
                              onClick={() => {
                                updateDeliveryBoy({
                                  ...db,
                                  available: !db.available
                                });
                              }}
                              className="px-2 py-1 bg-[#121214] hover:bg-white/5 text-zinc-400 hover:text-white rounded-lg text-[9px] font-extrabold cursor-pointer border border-white/5"
                            >
                              Toggle Status
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => {
                                setEditingBoy(db);
                                setShowAddBoyForm(false);
                              }}
                              className="p-1.5 bg-[#121214] hover:bg-white/5 text-zinc-300 rounded-lg cursor-pointer border border-white/5"
                              title="Edit Driver"
                            >
                              <Edit3 size={13} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove driver ${db.name} from the fleet?`)) {
                                  deleteDeliveryBoy(db.id);
                                }
                              }}
                              className="p-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-lg cursor-pointer border border-red-500/10"
                              title="Delete Driver"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
