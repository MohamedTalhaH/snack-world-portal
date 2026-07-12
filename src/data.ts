import { SnackItem } from './types';

export const INITIAL_SNACK_ITEMS: SnackItem[] = [
  {
    id: 'snack-1',
    name: 'Crispy Punjabi Samosa (2 pcs)',
    description: 'Golden-fried pastry pockets filled with a spiced, savory potato and pea mixture. Served with sweet tamarind and spicy mint chutneys.',
    category: 'Savory',
    price: 80.00,
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=80',
    stock: 25,
    popular: true,
    prepTime: 12
  },
  {
    id: 'snack-2',
    name: 'Signature Masala Potato Chips',
    description: 'Thin-cut, extra-crisp potato chips hand-tossed in our secret blend of roasted spices, chili powder, and black salt.',
    category: 'Spicy',
    price: 60.00,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d20?w=500&auto=format&fit=crop&q=80',
    stock: 40,
    popular: true,
    prepTime: 5
  },
  {
    id: 'snack-3',
    name: 'Gourmet Chocolate Fudge Cookies (3 pcs)',
    description: 'Soft-baked, chewy cookies loaded with premium dark chocolate chunks and a pinch of sea salt. Baked fresh daily.',
    category: 'Sweet',
    price: 150.00,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop&q=80',
    stock: 15,
    popular: true,
    prepTime: 8
  },
  {
    id: 'snack-4',
    name: 'Loaded Cheese & Jalapeño Nachos',
    description: 'Crisp corn tortilla chips smothered in hot nacho cheese, pickled jalapeño slices, fresh salsa, and dynamic sour cream.',
    category: 'Savory',
    price: 220.00,
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop&q=80',
    stock: 20,
    popular: false,
    prepTime: 10
  },
  {
    id: 'snack-5',
    name: 'Crispy Veggie Spring Rolls (4 pcs)',
    description: 'Light, crunchy wrappers filled with julienned cabbage, carrots, bell peppers, and scallions. Served with sweet chili dipping sauce.',
    category: 'Savory',
    price: 180.00,
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&auto=format&fit=crop&q=80',
    stock: 18,
    popular: false,
    prepTime: 15
  },
  {
    id: 'snack-6',
    name: 'Red Velvet Delight Cupcake',
    description: 'Fluffy red velvet sponge topped with a rich, velvety swirl of cream cheese frosting and sweet sprinkles.',
    category: 'Sweet',
    price: 120.00,
    image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=80',
    stock: 12,
    popular: true,
    prepTime: 4
  },
  {
    id: 'snack-7',
    name: 'Roasted Rosemary & Chili Mixed Nuts',
    description: 'A premium mix of almonds, cashews, and walnuts slow-roasted with fresh rosemary, olive oil, and a kick of cayenne pepper.',
    category: 'Healthy',
    price: 240.00,
    image: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500&auto=format&fit=crop&q=80',
    stock: 35,
    popular: false,
    prepTime: 3
  },
  {
    id: 'snack-8',
    name: 'Classic Brown Sugar Bubble Milk Tea',
    description: 'Rich, caramelized brown sugar syrup swirled with organic milk and fresh black tea, served over ice with chewy, slow-cooked tapioca boba.',
    category: 'Drinks',
    price: 180.00,
    image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500&auto=format&fit=crop&q=80',
    stock: 30,
    popular: true,
    prepTime: 6
  },
  {
    id: 'snack-9',
    name: 'Spicy Peri Peri Crinkle Cut Fries',
    description: 'Thick, crinkle-cut golden potatoes tossed in an ultra-zesty peri peri seasoning, served with creamy herb garlic mayo.',
    category: 'Spicy',
    price: 110.00,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
    stock: 22,
    popular: true,
    prepTime: 9
  },
  {
    id: 'snack-10',
    name: 'Organic Baked Beetroot & Sweet Potato Chips',
    description: 'Vibrant, hand-selected vegetable crisps lightly baked with coconut oil and a sprinkle of natural Himalayan pink sea salt.',
    category: 'Healthy',
    price: 130.00,
    image: 'https://images.unsplash.com/photo-1621447504864-d8686e1d681c?w=500&auto=format&fit=crop&q=80',
    stock: 15,
    popular: false,
    prepTime: 5
  }
];

export const CATEGORIES = ['All', 'Savory', 'Sweet', 'Spicy', 'Drinks', 'Healthy'];

export const DELIVERY_BOYS = [
  { id: 'db-1', name: 'John Doe (Bike #402)', phone: '+1 (555) 321-4567', available: true },
  { id: 'db-2', name: 'Alex Smith (E-Scooter #19)', phone: '+1 (555) 765-4321', available: true },
  { id: 'db-3', name: 'David Lee (Cycle #88)', phone: '+1 (555) 987-6543', available: true }
];
