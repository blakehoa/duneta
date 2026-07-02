# Duneta UI components

Custom layer on [HeroUI v3](https://heroui.com/en/docs/react/components) (`@heroui/react` + `@heroui/styles`).

## Structure

```text
components/
  DunetaButton/           # HeroUI wrapper
  DunetaLink/             # React Router (not HeroUI Link → DunetaHrefLink)
  DunetaDataTable/        # TanStack Table + virtual rows + filters
  ...
```

## Usage

```tsx
import {
  DunetaButton,
  DunetaCard,
  DunetaLink,
} from 'duneta/client/ui';

import { DunetaModal } from 'duneta/client/ui/DunetaModal';
```

Load HeroUI styles once via `themes/globals.css` (`@import '@heroui/styles'`).
