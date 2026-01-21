# Freelance Portfolio / Lib

## Import Policy

This directory contains app-specific utilities, API adapters, and configuration for the freelance-portfolio application.

### Import Guidelines

- **Shared primitives & components**: Import from `@dev-dominick/ui`, `@dev-dominick/hooks`, `@dev-dominick/utils`

  ```typescript
  import { Button, Card, InputWithIcon, cn } from "@dev-dominick/ui";
  import { useFormState } from "@dev-dominick/hooks";
  import { getErrorMessage } from "@dev-dominick/utils";
  ```

- **App-specific templates & layouts**: Import from `apps/freelance-portfolio/components/layouts`

  ```typescript
  import { AuthLayout } from "@/components/layouts/AuthLayout";
  import { DashboardLayout } from "@/components/layouts/DashboardLayout";
  ```

- **App business logic**: Use `apps/freelance-portfolio/lib/*` for utilities, API adapters, config

  ```typescript
  import { apiClient } from "@/lib/api/client";
  import { formatCurrency } from "@/lib/utils/formatting";
  ```

- **Root-level code** (`/components`, `/lib`, `/types`): Legacy app-shell code (active for `/app/*` routes, but not recommended for new auth/landing page features)

### Directory Structure

```
apps/freelance-portfolio/
├── components/
│   ├── layouts/          # Reusable page layouts (AuthLayout, DashboardLayout)
│   ├── auth/             # Auth-specific presentational components
│   └── [feature]/        # Feature-specific components
├── lib/
│   ├── api/              # API clients and adapters
│   ├── utils/            # App-specific utilities
│   └── config/           # App configuration
└── app/                  # Next.js 16 App Router pages
```

### Best Practices

1. **Prefer shared packages** for primitives that could be reused across multiple apps
2. **Use app-specific components/lib** for domain logic tied to freelance-portfolio features
3. **Avoid importing from root-level directories** (`/components`, `/lib`, `/types`) in new code - these support the app shell only

### Future Cleanup

- Phase 5 (future): Migrate admin forms to use `@dev-dominick/ui` primitives (InputWithIcon, Alert)
- Consider consolidating duplicated utilities across apps into shared packages
