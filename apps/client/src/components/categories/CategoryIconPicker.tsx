import React from 'react';
import * as LucideIcons from 'lucide-react';
import { HelpCircle } from 'lucide-react';

export const CATEGORY_ICON_OPTIONS = [
  { slug: 'utensils', label: 'Ăn uống', icon: LucideIcons.Utensils },
  { slug: 'car', label: 'Đi lại', icon: LucideIcons.Car },
  { slug: 'shopping-bag', label: 'Mua sắm', icon: LucideIcons.ShoppingBag },
  { slug: 'banknote', label: 'Thu nhập / Lương', icon: LucideIcons.Banknote },
  { slug: 'home', label: 'Nhà cửa', icon: LucideIcons.Home },
  { slug: 'coffee', label: 'Cà phê / Giải trí', icon: LucideIcons.Coffee },
  { slug: 'heart-pulse', label: 'Sức khỏe', icon: LucideIcons.HeartPulse },
  { slug: 'book-open', label: 'Học tập', icon: LucideIcons.BookOpen },
  { slug: 'plane', label: 'Du lịch', icon: LucideIcons.Plane },
  { slug: 'gift', label: 'Quà tặng', icon: LucideIcons.Gift },
  { slug: 'wrench', label: 'Sửa chữa', icon: LucideIcons.Wrench },
  { slug: 'circle-dollar-sign', label: 'Đầu tư', icon: LucideIcons.CircleDollarSign },
];

export interface ICategoryIconProps {
  slug: string;
  className?: string;
}

export const CategoryIcon: React.FC<ICategoryIconProps> = ({ slug, className = 'w-5 h-5' }) => {
  const iconOption = CATEGORY_ICON_OPTIONS.find((opt) => opt.slug === slug);
  if (iconOption) {
    const IconComp = iconOption.icon;
    return <IconComp className={className} />;
  }

  // Fallback map for alternative icon slugs
  switch (slug) {
    case 'food':
    case 'Utensils':
      return <LucideIcons.Utensils className={className} />;
    case 'transport':
    case 'Car':
      return <LucideIcons.Car className={className} />;
    case 'shopping':
    case 'ShoppingBag':
      return <LucideIcons.ShoppingBag className={className} />;
    case 'salary':
    case 'DollarSign':
      return <LucideIcons.Banknote className={className} />;
    case 'housing':
    case 'Home':
      return <LucideIcons.Home className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};
