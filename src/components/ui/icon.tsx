'use client'

import {
  ShoppingCart,
  Calendar,
  BookOpen,
  Briefcase,
  Mail,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus,
  Clock,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Home,
  Settings,
  LogOut,
  User,
  Heart,
  Share2,
  Download,
  Upload,
  FileText,
  BarChart3,
  TrendingUp,
  DollarSign,
  Eye,
  EyeOff,
  Loader2,
  Check,
  MessageSquare,
  Phone,
  MapPin,
  Sun,
  Moon,
  Sparkles,
  Shield,
  Filter,
  type LucideIcon,
} from 'lucide-react'

const ICON_REGISTRY: Record<string, LucideIcon> = {
  ShoppingCart,
  Calendar,
  BookOpen,
  Briefcase,
  Mail,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus,
  Clock,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Home,
  Settings,
  LogOut,
  User,
  Heart,
  Share2,
  Download,
  Upload,
  FileText,
  BarChart3,
  TrendingUp,
  DollarSign,
  Eye,
  EyeOff,
  Loader2,
  Check,
  MessageSquare,
  Phone,
  MapPin,
  Sun,
  Moon,
  Sparkles,
  Shield,
  Filter,
}

interface IconProps {
  name: keyof typeof ICON_REGISTRY
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted' | 'white' | 'black'
  animated?: boolean
  className?: string
}

const SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
} as const

const COLORS = {
  primary: 'text-blue-500 dark:text-blue-400',
  secondary: 'text-gray-500 dark:text-gray-400',
  success: 'text-green-500 dark:text-green-400',
  warning: 'text-amber-500 dark:text-amber-400',
  danger: 'text-red-500 dark:text-red-400',
  muted: 'text-gray-400 dark:text-gray-500',
  white: 'text-white',
  black: 'text-black',
} as const

export function Icon({
  name,
  size = 'md',
  color = 'primary',
  animated = false,
  className = '',
}: IconProps) {
  const LucideIcon = ICON_REGISTRY[name] || ShoppingCart
  const sizePixels = SIZES[size]
  const colorClass = COLORS[color]
  const animationClass = animated ? 'animate-spin' : ''

  return (
    <LucideIcon
      size={sizePixels}
      className={`${colorClass} ${animationClass} ${className}`}
      strokeWidth={2}
    />
  )
}

export type { IconProps }
