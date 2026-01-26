import {
  LayoutDashboard,
  Zap,
  TrendingUp,
  Package,
  Calendar,
  FileText,
  Settings,
  ShoppingCart,
  Mail,
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
          href: "/admin",
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
          href: "/admin/analytics",
          label: "Analytics",
          icon: TrendingUp,
        },
        {
          href: "/admin/business-ops",
          label: "Operations",
          icon: Package,
        },
        {
          href: "/admin/invoices",
          label: "Invoices",
          icon: FileText,
        },
        {
          href: "/admin/subscribers",
          label: "Subscribers",
          icon: Mail,
        },
      ],
    },
    {
      title: "Services",
      items: [
        {
          href: "/admin/appointments",
          label: "Appointments",
          icon: Calendar,
        },
        {
          href: "/scheduler",
          label: "Scheduler",
          icon: Calendar,
        },
      ],
    },
    {
      title: "Ecommerce",
      items: [
          {
            href: "/admin/orders",
            label: "Orders",
            icon: ShoppingCart,
          },
        {
          href: "/cart",
          label: "Cart",
          icon: ShoppingCart,
        },
        {
          href: "/checkout",
          label: "Checkout",
          icon: ShoppingCart,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          href: "/admin/settings",
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
