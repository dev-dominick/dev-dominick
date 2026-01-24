import {
  LayoutDashboard,
  Zap,
  TrendingUp,
  Package,
  Calendar,
  FileText,
  Settings,
  ShoppingCart,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
  exact?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export function getNavItemsForUser(isAdmin: boolean = false): NavSection[] {
  if (!isAdmin) {
    return [
      {
        title: "Account",
        items: [
          {
            href: "/",
            label: "Home",
            icon: LayoutDashboard,
            exact: true,
          },
        ],
      },
    ];
  }

  return [
    {
      title: "Main",
      items: [
        {
          href: "/app",
          label: "Dashboard",
          icon: LayoutDashboard,
          exact: true,
        },
      ],
    },
    {
      title: "Business",
      items: [
        {
          href: "/app/analytics",
          label: "Analytics",
          icon: TrendingUp,
        },
        {
          href: "/app/business-ops",
          label: "Operations",
          icon: Package,
        },
        {
          href: "/app/invoices",
          label: "Invoices",
          icon: FileText,
        },
      ],
    },
    {
      title: "Services",
      items: [
        {
          href: "/app/appointments",
          label: "Appointments",
          icon: Calendar,
        },
        {
          href: "/app/scheduler",
          label: "Scheduler",
          icon: Calendar,
        },
      ],
    },
    {
      title: "Ecommerce",
      items: [
          {
            href: "/app/orders",
            label: "Orders",
            icon: ShoppingCart,
          },
        {
          href: "/app/cart",
          label: "Cart",
          icon: ShoppingCart,
        },
        {
          href: "/app/checkout",
          label: "Checkout",
          icon: ShoppingCart,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          href: "/app/settings",
          label: "Settings",
          icon: Settings,
        },
      ],
    },
  ];
}

// Backward compatibility - create navConfig object
export const navConfig = {
  sections: getNavItemsForUser(false),
};
