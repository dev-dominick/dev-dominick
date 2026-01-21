# MUI-Free Templates

Clean, modern templates inspired by Material-UI but built with **zero MUI dependencies**. Just pure React, Next.js 16, and Tailwind CSS v4.

## 🎨 Available Templates

### 1. **Dashboard**

`components/templates/Dashboard.tsx`

- Full-featured admin dashboard
- Responsive sidebar navigation
- Stats cards with icons
- Data visualization (charts & tables)
- Dark mode support
- Mobile-friendly

### 2. **Sign In**

`components/templates/SignIn.tsx`

- Clean authentication form
- Social login buttons (Google, GitHub)
- Password visibility toggle
- "Remember me" checkbox
- Forgot password link
- Dark mode support

### 3. **Sign In Side**

`components/templates/SignInSide.tsx`

- Two-column layout
- Hero section on right side
- Form with icons
- Social authentication
- Responsive design
- Dark mode support

### 4. **Sign Up**

`components/templates/SignUp.tsx`

- User registration form
- Password strength indicator
- Real-time validation feedback
- Terms & conditions checkbox
- Social sign-up options
- Dark mode support

### 5. **Checkout**

`components/templates/Checkout.tsx`

- Multi-step checkout flow
- Progress stepper
- Shipping & payment forms
- Order summary sidebar
- Multiple payment methods
- Dark mode support

### 6. **Marketing Page**

`components/templates/MarketingPage.tsx`

- Complete landing page
- Hero section
- Features grid
- Pricing tables (monthly/yearly toggle)
- Testimonials
- Newsletter signup
- Full footer
- Dark mode support

### 7. **Blog**

`components/templates/Blog.tsx`

- Blog homepage layout
- Featured post section
- Article grid
- Category filters
- Search functionality
- Newsletter signup
- Dark mode support

### 8. **CRUD Dashboard**

`components/templates/CRUDDashboard.tsx`

- Full CRUD operations (Create, Read, Update, Delete)
- Data table with actions
- Search & filter
- Modal forms
- Pagination
- Responsive sidebar
- Dark mode support

## 🚀 Usage

### Import any template:

```tsx
import Dashboard from "@/components/templates/Dashboard";
import SignIn from "@/components/templates/SignIn";
import Checkout from "@/components/templates/Checkout";
// ... etc

export default function Page() {
  return <Dashboard />;
}
```

### Or use as pages:

Create a new route in your Next.js app:

```tsx
// app/dashboard/page.tsx
import Dashboard from "@/components/templates/Dashboard";

export default function DashboardPage() {
  return <Dashboard />;
}
```

## ✨ Features

- ✅ **Zero MUI bloat** - No Material-UI dependencies
- ✅ **Tailwind CSS v4** - Modern utility-first styling
- ✅ **Dark mode** - Built-in toggle for all templates
- ✅ **Fully responsive** - Mobile, tablet, and desktop
- ✅ **TypeScript** - Type-safe components
- ✅ **Next.js 16** - Client components with `'use client'`
- ✅ **Lucide Icons** - Beautiful, consistent icons
- ✅ **Form handling** - State management examples
- ✅ **Animations** - Smooth transitions and hover effects

## 🎯 Why These Templates?

MUI templates are great, but they come with:

- Heavy bundle sizes
- Complex theme systems
- Opinionated styling
- Breaking changes between versions

These templates give you the **same beautiful designs** with:

- Lightweight code
- Full control over styling
- Easy customization
- No dependency headaches

## 🛠️ Customization

All templates use Tailwind CSS, so customization is simple:

```tsx
// Change colors
<div className="bg-blue-600">  // Change to bg-purple-600, bg-green-600, etc.

// Adjust spacing
<div className="p-6">  // Change to p-4, p-8, p-12, etc.

// Modify typography
<h1 className="text-3xl">  // Change to text-2xl, text-4xl, etc.
```

## 📦 Dependencies

Only uses what you already have:

- `react` / `react-dom`
- `next`
- `tailwindcss`
- `lucide-react` (for icons)

No Material-UI, no theme providers, no complex setup!

## 🚨 Note

These are **starting templates** - customize them to fit your brand, add your own API calls, connect to your backend, etc. They're designed to be modified!

---

Built with ❤️ using Next.js 16 + Tailwind CSS v4
