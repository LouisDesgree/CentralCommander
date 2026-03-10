import { Home, Mail, Bot, Settings } from 'lucide-react';

export const navigationItems = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Email', href: '/email', icon: Mail },
  { label: 'Agent', href: '/agent', icon: Bot },
  { label: 'Settings', href: '/settings', icon: Settings },
] as const;
