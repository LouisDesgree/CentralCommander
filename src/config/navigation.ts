import { Home, Mail, FolderKanban, TrendingUp, Bot, Settings, CheckSquare } from 'lucide-react';

export const navigationItems = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Email', href: '/email', icon: Mail },
  { label: 'Spaces', href: '/workspaces', icon: FolderKanban },
  { label: 'Invest', href: '/invest', icon: TrendingUp },
  { label: 'Agent', href: '/agent', icon: Bot },
  { label: 'Settings', href: '/settings', icon: Settings },
] as const;
