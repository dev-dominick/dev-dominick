# Sellable Components Library

This document outlines reusable, production-ready components that can be packaged and sold as part of website/template bundles.

## 1. FeatureCard Component

**File**: `src/components/templates/feature-card.tsx`

**Purpose**: Showcase a service, product feature, or offering with icon, description, bullet points, and CTA.

**Features**:
- Icon support (via Icon system wrapper)
- Title, description, and 3-4 feature bullets
- Gradient background options (blue, cyan, green, purple)
- CTA button (link or onClick handler)
- Dark mode support
- Responsive hover effects
- Accessibility-focused

**Usage**:
```tsx
import { FeatureCard } from '@/components/templates/feature-card'

<FeatureCard
  icon="ShoppingCart"
  title="Shop Templates"
  description="Production-ready website & commerce kits."
  features={[
    { text: "Professional Business Website" },
    { text: "E-Commerce Store" },
    { text: "Appointment Booking Platform" },
  ]}
  cta={{ label: "Browse Shop", href: "/shop" }}
  gradient="blue"
/>
```

**Sell As**: Landing page hero sections, product showcases, service cards, feature blocks

**Estimated Price**: $15-25 per template using this component

---

## 2. PricingCard Component

**File**: `src/components/templates/pricing-card.tsx`

**Purpose**: Display pricing tiers with features, highlight recommended plan.

**Features**:
- Flexible pricing with period (monthly, yearly, one-time)
- Feature list with checkmark/X icons for included/excluded
- "Most Popular" badge for highlighted tier
- Optional description text
- Dark mode support
- Responsive grid layout
- CTA button per tier
- Disabled feature strikethrough styling

**Usage**:
```tsx
import { PricingCard } from '@/components/templates/pricing-card'

<PricingCard
  name="Pro"
  price={99}
  period="/month"
  features={[
    { text: "Unlimited projects", included: true },
    { text: "Priority support", included: true },
    { text: "Custom domain", included: false },
  ]}
  cta={{ label: "Get Started", onClick: () => {} }}
  highlighted={true}
/>
```

**Sell As**: SaaS pricing pages, tiered product pages, feature comparison sections

**Estimated Price**: $20-35 per template (high-conversion component)

---

## 3. FAQAccordion Component

**File**: `src/components/templates/faq-accordion.tsx`

**Purpose**: Display frequently asked questions with smooth expand/collapse.

**Features**:
- Accordion expand/collapse interaction
- Smooth slide-down animation
- Chevron icon rotation
- Dark mode support
- Optional multi-expand support
- Accessible keyboard navigation (Radix UI compatible)
- Clean, minimal design

**Usage**:
```tsx
import { FAQAccordion } from '@/components/templates/faq-accordion'

<FAQAccordion
  items={[
    {
      question: "How do I get started?",
      answer: "Sign up, choose a plan, and start building..."
    },
    {
      question: "Do you offer support?",
      answer: "Yes, we offer 24/7 email and chat support..."
    },
  ]}
  allowMultiple={false}
/>
```

**Sell As**: Help sections, product FAQs, support pages, footer expandable content

**Estimated Price**: $10-15 per template

---

## 4. Icon System Component

**File**: `src/components/ui/icon.tsx`

**Purpose**: Unified icon interface wrapping Lucide icons with theme awareness.

**Features**:
- 40+ pre-registered icons (ShoppingCart, Calendar, BookOpen, etc.)
- Size variants (xs, sm, md, lg, xl)
- Color variants (primary, secondary, success, warning, danger, muted, white, black)
- Animated prop for loading spinners
- Type-safe icon names via TypeScript
- Automatic dark mode color adjustment
- Easy to extend with more icons

**Usage**:
```tsx
import { Icon } from '@/components/ui/icon'

<Icon name="ShoppingCart" size="lg" color="primary" />
<Icon name="Loader2" size="md" animated />
```

**Sell As**: Icon libraries for developers, base component for UI kits

**Estimated Price**: $5-10 per template (enhancer component)

---

## 5. DarkModeToggle Component

**File**: `src/components/ui/dark-mode-toggle.tsx`

**Purpose**: One-click dark/light mode switcher with persistent localStorage.

**Features**:
- Sun/Moon icons for visual indicator
- Persistent theme preference (localStorage)
- Smooth transitions
- Optional label
- Size variants
- Keyboard accessible
- System preference detection fallback

**Usage**:
```tsx
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle'

<DarkModeToggle showLabel={true} size="md" />
```

**Sell As**: Navigation enhancement, header component, settings page

**Estimated Price**: $5-8 per template (utility component)

---

## 6. Design Token System

**Files**: `tailwind.config.ts`, `src/app/globals.css`

**Purpose**: Centralized color, spacing, and typography system for brand consistency.

**Features**:
- Light/dark mode CSS custom properties
- Unified color palette (primary, secondary, accent, success, warning, danger)
- Spacing scale (xs=8px to 3xl=96px)
- Typography scale (xs to 5xl)
- Shadow system (soft, base, md, lg)
- Animation keyframes
- Easy brand customization

**Why Sellable**: 
- Teams can rebrand by changing CSS variables
- Scalable to any design system
- Works with all components
- Reduces design debt

**Sell As**: Design system foundation, brand kit, UI kit base layer

**Estimated Price**: $25-50 per template (core infrastructure)

---

## 7. Refactored Core Components

**Files**: 
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`

**Purpose**: Production-ready button, card, and input components with dark mode.

**Features**:
- Multiple variants and sizes
- Dark mode support via Tailwind
- Consistent styling across components
- Accessibility (focus rings, disabled states)
- TypeScript prop interfaces
- forwardRef for DOM access

**Sell As**: Base UI component library, form builder kits, dashboard templates

**Estimated Price**: $10-20 per template (fundamental components)

---

## Sales Bundle Recommendations

### Starter Template ($29)
- FeatureCard
- Design Token System
- Core Components (Button, Card, Input)
- DarkModeToggle

### Business Template ($49)
- FeatureCard
- PricingCard
- Design Token System
- Core Components
- Icon System
- DarkModeToggle
- Navigation component

### SaaS Template ($79)
- All of above
- FAQAccordion
- Dark mode provider hooks
- Form validation patterns
- Complete landing page example

---

## Component Usage Across Current Pages

- **Landing Page** (`/page.tsx`): FeatureCard, DarkModeToggle, Icon
- **Explore Page** (`/explore/page.tsx`): FeatureCard, Icon
- **Shop Page** (`/shop/page.tsx`): PricingCard equivalent (can use component)
- **Admin Pages** (`/app/*`): Core components, Icon system
- **Navigation** (All pages): DarkModeToggle, Icon

---

## Next Steps for Monetization

1. ✅ Create component documentation with code examples
2. ✅ Add Figma design files for each component (for designer teams)
3. ✅ Create Storybook for interactive component showcase
4. ⏳ Package as npm library or template bundle
5. ⏳ Create video tutorials for each component
6. ⏳ Build marketplace listing with before/after examples
7. ⏳ Create customization guide for colors/branding

---

**Total Component Value**: ~$160-245 if sold individually
**Bundle Value**: $29-79 depending on package tier
**Profit Margin**: 70-80% (low cost, high value)
