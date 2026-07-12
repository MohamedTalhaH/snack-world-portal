import React, { createContext, useContext, useState, useEffect } from 'react';
import { SnackItem, CartItem, Order, OrderStatus, Notification, UserRole, DeliveryBoy } from '../types';
import { INITIAL_SNACK_ITEMS, DELIVERY_BOYS } from '../data';

interface AppContextProps {
  snacks: SnackItem[];
  orders: Order[];
  cart: CartItem[];
  notifications: Notification[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  // Delivery Boys
  deliveryBoys: DeliveryBoy[];
  addDeliveryBoy: (boy: Omit<DeliveryBoy, 'id'>) => void;
  updateDeliveryBoy: (boy: DeliveryBoy) => void;
  deleteDeliveryBoy: (boyId: string) => void;
  // Cart Actions
  addToCart: (snack: SnackItem) => void;
  removeFromCart: (snackId: string) => void;
  updateCartQuantity: (snackId: string, quantity: number) => void;
  clearCart: () => void;
  // Order Actions
  placeOrder: (customerName: string, customerPhone: string, address: string, notes?: string) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus, note: string, deliveryBoyId?: string) => void;
  assignDeliveryBoy: (orderId: string, deliveryBoyId: string) => void;
  // Inventory Actions
  updateSnackStock: (snackId: string, newStock: number) => void;
  addSnackItem: (snack: Omit<SnackItem, 'id'>) => void;
  updateSnackItem: (snack: SnackItem) => void;
  deleteSnackItem: (snackId: string) => void;
  // Notifications
  addNotification: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snacks, setSnacks] = useState<SnackItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);

  // Load state from localStorage on mount
  useEffect(() => {
    // Delivery Boys
    const storedBoys = localStorage.getItem('snack_delivery_boys');
    if (storedBoys) {
      setDeliveryBoys(JSON.parse(storedBoys));
    } else {
      const initialBoys = DELIVERY_BOYS.map(db => ({ ...db, pin: '1234' }));
      localStorage.setItem('snack_delivery_boys', JSON.stringify(initialBoys));
      setDeliveryBoys(initialBoys);
    }

    // Snacks
    const storedSnacks = localStorage.getItem('snack_inventory');
    if (storedSnacks) {
      setSnacks(JSON.parse(storedSnacks));
    } else {
      localStorage.setItem('snack_inventory', JSON.stringify(INITIAL_SNACK_ITEMS));
      setSnacks(INITIAL_SNACK_ITEMS);
    }

    // Orders pre-population
    const storedOrders = localStorage.getItem('snack_orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      // Setup default mock orders representing various statuses for high-fidelity preview
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const defaultOrders: Order[] = [
        {
          id: 'ORD-5489',
          customerName: 'Sarah Connor',
          customerPhone: '+1 (555) 019-9112',
          address: '742 Evergreen Terrace, Sector 4',
          items: [
            { snack: INITIAL_SNACK_ITEMS[0], quantity: 2 }, // Punjabi Samosa
            { snack: INITIAL_SNACK_ITEMS[7], quantity: 1 }  // Bubble Milk Tea
          ],
          totalAmount: 15.47,
          status: 'delivered',
          timestamp: yesterday,
          deliveryBoyId: 'db-1',
          deliveryBoyName: 'John Doe (Bike #402)',
          paymentMethod: 'COD',
          orderUpdates: [
            { status: 'pending', timestamp: yesterday, note: 'Order placed via COD.' },
            { status: 'accepted', timestamp: yesterday, note: 'Order accepted by Snacksworld admin.' },
            { status: 'preparing', timestamp: yesterday, note: 'Snacks are hot and being packed.' },
            { status: 'out_for_delivery', timestamp: yesterday, note: 'Out for delivery with John Doe.' },
            { status: 'delivered', timestamp: yesterday, note: 'Delivered successfully. Cash collected.' }
          ],
          notificationSent: true
        },
        {
          id: 'ORD-9302',
          customerName: 'Bruce Wayne',
          customerPhone: '+1 (555) 100-1939',
          address: '1007 Mountain Drive, Gotham Heights',
          items: [
            { snack: INITIAL_SNACK_ITEMS[3], quantity: 1 }, // Loaded Nachos
            { snack: INITIAL_SNACK_ITEMS[1], quantity: 2 }  // Masala Chips
          ],
          totalAmount: 14.97,
          status: 'preparing',
          timestamp: thirtyMinsAgo,
          paymentMethod: 'COD',
          orderUpdates: [
            { status: 'pending', timestamp: thirtyMinsAgo, note: 'Order placed via COD.' },
            { status: 'accepted', timestamp: thirtyMinsAgo, note: 'Order accepted. Handed over to kitchen.' },
            { status: 'preparing', timestamp: thirtyMinsAgo, note: 'Chef is baking fresh nachos & tossing fresh masala chips.' }
          ],
          notificationSent: false
        },
        {
          id: 'ORD-4491',
          customerName: 'Peter Parker',
          customerPhone: '+1 (555) 438-9273',
          address: '20 Ingram Street, Forest Hills',
          items: [
            { snack: INITIAL_SNACK_ITEMS[2], quantity: 2 }, // Chocolate Fudge Cookies
            { snack: INITIAL_SNACK_ITEMS[8], quantity: 2 }  // Peri Peri Fries
          ],
          totalAmount: 20.96,
          status: 'pending',
          timestamp: fiveMinsAgo,
          paymentMethod: 'COD',
          orderUpdates: [
            { status: 'pending', timestamp: fiveMinsAgo, note: 'Order placed. Awaiting admin acceptance.' }
          ],
          notificationSent: false
        },
        {
          id: 'ORD-7712',
          customerName: 'Clark Kent',
          customerPhone: '+1 (555) 881-2345',
          address: 'Daily Planet Apartments, Metropolis',
          items: [
            { snack: INITIAL_SNACK_ITEMS[5], quantity: 1 }, // Red Velvet Cupcake
            { snack: INITIAL_SNACK_ITEMS[6], quantity: 1 }  // Mixed Nuts
          ],
          totalAmount: 10.98,
          status: 'out_for_delivery',
          timestamp: fifteenMinsAgo,
          deliveryBoyId: 'db-2',
          deliveryBoyName: 'Alex Smith (E-Scooter #19)',
          paymentMethod: 'COD',
          orderUpdates: [
            { status: 'pending', timestamp: fifteenMinsAgo, note: 'Order placed.' },
            { status: 'accepted', timestamp: fifteenMinsAgo, note: 'Accepted by admin.' },
            { status: 'preparing', timestamp: fifteenMinsAgo, note: 'Packed & ready.' },
            { status: 'out_for_delivery', timestamp: fifteenMinsAgo, note: 'Rider Alex Smith has picked up your snack package!' }
          ],
          notificationSent: false
        }
      ];
      localStorage.setItem('snack_orders', JSON.stringify(defaultOrders));
      setOrders(defaultOrders);
    }

    // Notifications pre-population
    const storedNotifs = localStorage.getItem('snack_notifications');
    if (storedNotifs) {
      setNotifications(JSON.parse(storedNotifs));
    } else {
      const defaultNotifs: Notification[] = [
        {
          id: 'notif-1',
          text: 'Welcome to Snacksworld! Enjoy hot, crispy snacks delivered in minutes.',
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false
        }
      ];
      localStorage.setItem('snack_notifications', JSON.stringify(defaultNotifs));
      setNotifications(defaultNotifs);
    }
  }, []);

  // Save changes helper
  const saveOrders = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    localStorage.setItem('snack_orders', JSON.stringify(updatedOrders));
  };

  const saveSnacks = (updatedSnacks: SnackItem[]) => {
    setSnacks(updatedSnacks);
    localStorage.setItem('snack_inventory', JSON.stringify(updatedSnacks));
  };

  const saveNotifications = (updatedNotifs: Notification[]) => {
    setNotifications(updatedNotifs);
    localStorage.setItem('snack_notifications', JSON.stringify(updatedNotifs));
  };

  const saveDeliveryBoys = (updatedBoys: DeliveryBoy[]) => {
    setDeliveryBoys(updatedBoys);
    localStorage.setItem('snack_delivery_boys', JSON.stringify(updatedBoys));
  };

  // Add Notification
  const addNotification = (text: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      text,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    saveNotifications([newNotif, ...notifications]);
  };

  const markNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const clearNotifications = () => {
    saveNotifications([]);
  };

  // Cart Management
  const addToCart = (snack: SnackItem) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.snack.id === snack.id);
      if (existing) {
        if (existing.quantity >= snack.stock) {
          addNotification(`Cannot add more of ${snack.name}. Only ${snack.stock} left in stock.`, 'warning');
          return prevCart;
        }
        addNotification(`Added another ${snack.name} to cart.`, 'success');
        return prevCart.map(item =>
          item.snack.id === snack.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      addNotification(`${snack.name} added to cart!`, 'success');
      return [...prevCart, { snack, quantity: 1 }];
    });
  };

  const removeFromCart = (snackId: string) => {
    setCart(prevCart => prevCart.filter(item => item.snack.id !== snackId));
    addNotification('Item removed from cart.', 'info');
  };

  const updateCartQuantity = (snackId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(snackId);
      return;
    }
    const snackItem = snacks.find(s => s.id === snackId);
    if (snackItem && quantity > snackItem.stock) {
      addNotification(`Only ${snackItem.stock} items are available in stock.`, 'warning');
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.snack.id === snackId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Placing an Order (Customer)
  const placeOrder = (customerName: string, customerPhone: string, address: string, notes?: string) => {
    if (cart.length === 0) return null;

    // Check stock first
    for (const item of cart) {
      const originalSnack = snacks.find(s => s.id === item.snack.id);
      if (!originalSnack || originalSnack.stock < item.quantity) {
        addNotification(`Sorry, ${item.snack.name} has run out of stock or does not have enough quantities.`, 'error');
        return null;
      }
    }

    // Deduct stock
    const updatedSnacks = snacks.map(s => {
      const cartItem = cart.find(item => item.snack.id === s.id);
      if (cartItem) {
        const newStock = s.stock - cartItem.quantity;
        return { ...s, stock: newStock < 0 ? 0 : newStock };
      }
      return s;
    });
    saveSnacks(updatedSnacks);

    // Calculate total
    const totalAmount = cart.reduce((total, item) => total + (item.snack.price * item.quantity), 0);

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerPhone,
      address,
      items: [...cart],
      totalAmount: parseFloat((totalAmount).toFixed(2)),
      status: 'pending',
      timestamp: new Date().toISOString(),
      paymentMethod: 'COD',
      deliveryNotes: notes || '',
      orderUpdates: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Order placed successfully. Waiting for store confirmation.'
        }
      ],
      notificationSent: false
    };

    saveOrders([newOrder, ...orders]);
    setCart([]); // Clear cart
    addNotification(`Order placed successfully! Please pay on delivery (COD).`, 'success');

    // Notify administrator role
    addNotification(`New COD order received: ${newOrder.id} for $${newOrder.totalAmount}`, 'info');

    return newOrder;
  };

  // Update Order Status (Admin / Delivery Boy)
  const updateOrderStatus = (orderId: string, status: OrderStatus, note: string, deliveryBoyId?: string) => {
    const updated = orders.map(order => {
      if (order.id === orderId) {
        const newUpdates = [
          ...order.orderUpdates,
          { status, timestamp: new Date().toISOString(), note }
        ];

        let deliveryBoyName = order.deliveryBoyName;
        if (deliveryBoyId) {
          const matchedBoy = deliveryBoys.find(db => db.id === deliveryBoyId);
          if (matchedBoy) {
            deliveryBoyName = matchedBoy.name;
          }
        }

        const updatedOrder: Order = {
          ...order,
          status,
          orderUpdates: newUpdates,
          ...(deliveryBoyId ? { deliveryBoyId, deliveryBoyName } : {})
        };

        return updatedOrder;
      }
      return order;
    });

    saveOrders(updated);
    addNotification(`Order ${orderId} updated to ${status.toUpperCase()}`, 'success');
  };

  // Assign Delivery Boy to Order (Admin)
  const assignDeliveryBoy = (orderId: string, deliveryBoyId: string) => {
    const matchedBoy = deliveryBoys.find(db => db.id === deliveryBoyId);
    if (!matchedBoy) return;

    const updated = orders.map(order => {
      if (order.id === orderId) {
        const noteText = `Rider ${matchedBoy.name} has been assigned and is heading to the kitchen.`;
        const newUpdates = [
          ...order.orderUpdates,
          { status: order.status, timestamp: new Date().toISOString(), note: noteText }
        ];

        return {
          ...order,
          deliveryBoyId,
          deliveryBoyName: matchedBoy.name,
          orderUpdates: newUpdates
        };
      }
      return order;
    });

    saveOrders(updated);
    addNotification(`Assigned ${matchedBoy.name} to order ${orderId}.`, 'success');
  };

  // Update Inventory Item Stock
  const updateSnackStock = (snackId: string, newStock: number) => {
    const updated = snacks.map(s => {
      if (s.id === snackId) {
        const validatedStock = newStock < 0 ? 0 : newStock;
        if (validatedStock === 0) {
          addNotification(`${s.name} is now OUT OF STOCK!`, 'warning');
        }
        return { ...s, stock: validatedStock };
      }
      return s;
    });
    saveSnacks(updated);
  };

  // Add New Snack (Admin)
  const addSnackItem = (newItem: Omit<SnackItem, 'id'>) => {
    const freshItem: SnackItem = {
      ...newItem,
      id: `snack-${Date.now()}`
    };
    const updated = [...snacks, freshItem];
    saveSnacks(updated);
    addNotification(`Added ${freshItem.name} to snack menu!`, 'success');
  };

  // Update Snack Details (Admin)
  const updateSnackItem = (updatedItem: SnackItem) => {
    const updated = snacks.map(s => (s.id === updatedItem.id ? updatedItem : s));
    saveSnacks(updated);
    addNotification(`Updated snack item: ${updatedItem.name}`, 'success');
  };

  // Delete Snack (Admin)
  const deleteSnackItem = (snackId: string) => {
    const snackName = snacks.find(s => s.id === snackId)?.name || 'Snack';
    const updated = snacks.filter(s => s.id !== snackId);
    saveSnacks(updated);
    addNotification(`Deleted ${snackName} from menu.`, 'info');
  };

  // Add Delivery Boy (Admin)
  const addDeliveryBoy = (newItem: Omit<DeliveryBoy, 'id'>) => {
    const freshItem: DeliveryBoy = {
      ...newItem,
      id: `db-${Date.now()}`
    };
    const updated = [...deliveryBoys, freshItem];
    saveDeliveryBoys(updated);
    addNotification(`Registered delivery driver ${freshItem.name} successfully.`, 'success');
  };

  // Update Delivery Boy
  const updateDeliveryBoy = (updatedItem: DeliveryBoy) => {
    const updated = deliveryBoys.map(db => (db.id === updatedItem.id ? updatedItem : db));
    saveDeliveryBoys(updated);
    addNotification(`Updated driver profile: ${updatedItem.name}`, 'success');
  };

  // Delete Delivery Boy (Admin)
  const deleteDeliveryBoy = (boyId: string) => {
    const boyName = deliveryBoys.find(db => db.id === boyId)?.name || 'Driver';
    const updated = deliveryBoys.filter(db => db.id !== boyId);
    saveDeliveryBoys(updated);
    addNotification(`Removed driver ${boyName} from registered fleet.`, 'info');
  };

  return (
    <AppContext.Provider value={{
      snacks,
      orders,
      cart,
      notifications,
      currentRole,
      setCurrentRole,
      deliveryBoys,
      addDeliveryBoy,
      updateDeliveryBoy,
      deleteDeliveryBoy,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      placeOrder,
      updateOrderStatus,
      assignDeliveryBoy,
      updateSnackStock,
      addSnackItem,
      updateSnackItem,
      deleteSnackItem,
      addNotification,
      markNotificationsAsRead,
      clearNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
