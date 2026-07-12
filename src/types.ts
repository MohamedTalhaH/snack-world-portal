export interface SnackItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  popular: boolean;
  prepTime: number; // in minutes
}

export interface CartItem {
  snack: SnackItem;
  quantity: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderUpdate {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  timestamp: string;
  deliveryBoyId?: string;
  deliveryBoyName?: string;
  deliveryNotes?: string;
  paymentMethod: 'COD';
  orderUpdates: OrderUpdate[];
  notificationSent: boolean;
}

export interface Notification {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export type UserRole = 'customer' | 'admin' | 'delivery';

export interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  pin: string; // Secure passcode (e.g., "1234")
  available: boolean;
}
