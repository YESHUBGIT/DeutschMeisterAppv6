# AGENTS.md

This repository is a Next.js 16 + React 19 + TypeScript app using Tailwind CSS.
No Cursor or Copilot instruction files were found in `.cursor/rules/`,
`.cursorrules`, or `.github/copilot-instructions.md`.

## Quick facts

- Package manager: pnpm (see `pnpm-lock.yaml`)
- App router: `app/` directory with `layout.tsx` and `page.tsx`
- UI primitives live in `components/ui/`
- Tab content lives in `components/tabs/`
- Shared helpers live in `lib/`
- Styling is Tailwind + CSS variables in `app/globals.css`
- Prisma is installed; `postinstall` runs `prisma generate || true`

## Build, lint, test

### Install

- `pnpm install`

### Develop

- `pnpm dev` (Next dev server)

### Build and run

- `pnpm build` (Next production build)
- `pnpm start` (serves `.next` output)

### Lint

- `pnpm lint` (runs `eslint .`)

### Tests

- No test runner is configured in `package.json`.
- If you add one, prefer a `test` script in `package.json` and document a
  single-test pattern such as `pnpm test -- <pattern>` or
  `pnpm test -- --runTestsByPath <file>` depending on the runner.

### Prisma

- `pnpm prisma generate` (manual generate if needed)

## Code style guidelines

Follow existing file style and conventions; keep changes consistent within each
file. Use ASCII unless a file already contains non-ASCII content.

### TypeScript + React

- Use functional components and hooks; avoid class components.
- Prefer `interface` for component props and `type` for unions.
- Use `React.ComponentProps<"tag">` for DOM prop typing when needed.
- Keep `"use client"` at the top of client components; default to server
  components in `app/` when possible.
- Preserve strict typing (`tsconfig.json` has `strict: true`).
- Avoid `any`; use generics or `unknown` with narrowing.
- Return early for conditional branches; avoid nested conditionals in JSX.

### App router conventions

- Treat files under `app/` as server components by default.
- Add `"use client"` only when hooks, browser APIs, or client libraries are
  required.
- Keep `app/layout.tsx` focused on layout and metadata.
- Keep `app/page.tsx` focused on tab navigation and page composition.

### Imports and module boundaries

- Import order (with blank lines between groups):
  - React/Next built-ins and framework imports
  - Third-party packages
  - Internal modules via path alias (`@/`)
  - Relative imports (same folder)
- Use the path alias defined in `tsconfig.json` (`@/*`) for app-level imports.
- Prefer `@/lib/*` helpers instead of duplicating utilities.
- Keep file names in kebab-case (e.g., `lessons-tab.tsx`, `button-group.tsx`).

### Formatting

- Indentation: 2 spaces, no tabs.
- Semicolons are omitted in existing files; keep that style.
- Quote style is mixed (single/double). Follow the file you edit and keep it
  consistent within that file.
- Use trailing commas where existing patterns already do so.
- Keep JSX attributes on multiple lines when they are long or complex.
- Keep Tailwind class lists readable; group related classes consistently.

### Naming conventions

- Components: `PascalCase` (`Header`, `LessonsTab`).
- Hooks: `useX` (`useMobile`, `useToast`).
- Props: `camelCase` and descriptive (`onTabChange`, `activeTab`).
- Constants and data structures: `camelCase` unless a semantic name suggests
  otherwise (e.g., `verbTree`).
- Files and folders: `kebab-case`.

### Styling

- Use Tailwind classes in JSX.
- Prefer the `cn` helper from `lib/utils.ts` for conditional class names.
- Theme tokens are CSS variables in `app/globals.css`; use Tailwind token
  classes (e.g., `bg-background`, `text-foreground`).
- Use `class-variance-authority` patterns in UI components (see
  `components/ui/button.tsx`).
- Avoid inline styles unless a value cannot be expressed with Tailwind.

### State and logic

- Keep component state local with `useState` unless shared.
- Derive UI from data and minimize imperative DOM manipulation.
- Use early returns for conditional rendering.
- Keep data transformations close to where data is rendered.

### Error handling

- For async actions, use `try/catch` and surface errors via UI feedback when
  applicable (toasts, inline messages).
- Avoid swallowing errors; log with context if user-facing feedback is not
  available.
- Keep error messages concise and actionable.

### Data and content

- Large content objects (lesson data) live inline in the tab components; keep
  them organized and grouped by section.
- When adding content tables, maintain the structure used in existing lesson
  objects (`headers`, `rows`, `examples`, `tip`).

### File-specific notes

- `app/layout.tsx` defines root layout and metadata; keep it minimal.
- `app/page.tsx` controls the main tab navigation and renders tab content.
- `components/ui/*` follow shadcn-style component conventions; avoid breaking
  exported APIs.
- `components/tabs/*` are client components and manage interactive content.

### Linting expectations

- Run `pnpm lint` before finalizing changes.
- If ESLint warnings appear, fix them in the edited files.

### When adding new files

- Use `@/` imports instead of relative paths from root-level modules.
- Add `"use client"` only when hooks or browser APIs are required.
- Keep new UI components in `components/ui/` when they are reusable.
- Co-locate tab-specific UI in `components/tabs/`.

## Suggested local workflow

- `pnpm install`
- `pnpm dev`
- `pnpm lint` before PR or handoff
