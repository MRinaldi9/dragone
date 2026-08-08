# Dragone

An independent [Angular](https://angular.dev) design system inspired by the [Sirio](https://www.inps.design/3e7e2b0f5/p/37c451-ciao-italia) design system (INPS), built on [ng-primitives](https://angularprimitives.com) for behavior and accessibility. Targeted at Italian public-sector digital services, released as open source.

The [CONTEXT.md](./CONTEXT.md) defines the project's domain vocabulary. Architectural decisions are recorded in [docs/adr/](./docs/adr/).

## 🚀 Getting Started

### Prerequisites

- [pnpm](https://pnpm.io) >= 11.0.0 (install globally via `npm install -g pnpm`)
- Node.js >= 24.15.0

### Install

```bash
git clone <repository-url>
cd dragone
pnpm install
```

## 💻 Development Workflow

This project uses **Storybook** as the primary environment for developing, previewing, and testing components in isolation.

### Storybook

```bash
pnpm storybook
```

Opens Storybook in your browser with all `@dragone/ui` components, autodocs, and an a11y panel.

### Build the Library

```bash
pnpm build @dragone/ui
```

Output is written to `dist/projects/dragone/ui`.

### Run Tests

```bash
pnpm test
```

Unit tests run via [Vitest](https://vitest.dev) in browser mode (Playwright).

## ✨ Code Quality & Conventions

### Linting & Formatting

- Lint: `pnpm lint`
- Format: `pnpm format`

Both run automatically on staged files before every commit via [lefthook](https://github.com/evilmartians/lefthook).

### Commit Messages

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/). Use `pnpm commit` to create a commit via the interactive prompt (commitizen); the `commit-msg` hook validates your message with commitlint. Versioning is managed natively by pnpm — record a change intent with `pnpm change` in each PR that changes the published API, then apply the release plan with `pnpm version -r`.
