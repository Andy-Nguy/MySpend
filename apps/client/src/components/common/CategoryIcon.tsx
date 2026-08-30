import React from 'react';
import {
  Car,
  DollarSign,
  HeartPulse,
  Home,
  Layers,
  ShoppingBag,
  TrendingUp,
  Tv,
  Utensils,
  Wallet,
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  className = 'w-5 h-5',
  size,
}) => {
  switch (iconName?.toLowerCase()) {
    case 'utensils':
    case 'food':
      return <Utensils className={className} size={size} />;
    case 'home':
    case 'housing':
      return <Home className={className} size={size} />;
    case 'car':
    case 'transport':
      return <Car className={className} size={size} />;
    case 'shoppingbag':
    case 'shopping':
      return <ShoppingBag className={className} size={size} />;
    case 'tv':
    case 'entertainment':
      return <Tv className={className} size={size} />;
    case 'heartpulse':
    case 'health':
      return <HeartPulse className={className} size={size} />;
    case 'dollarsign':
    case 'salary':
      return <DollarSign className={className} size={size} />;
    case 'trendingup':
    case 'freelance':
      return <TrendingUp className={className} size={size} />;
    case 'wallet':
      return <Wallet className={className} size={size} />;
    default:
      return <Layers className={className} size={size} />;
  }
};
