---
slug: quality-tooling
title: Configure the Quality Tooling
moduleSlug: validate-and-ship
moduleTitle: "Validate and Ship the Site"
moduleOrder: 9
lessonOrder: 1
published: true
duration: "18 minutes"
summary: Configure formatting, linting, jsdom component tests, Playwright browser projects, and one validation command.
resources:
  - https://docs.astro.build/en/guides/testing/
  - https://vitest.dev/guide/environment.html
  - https://playwright.dev/docs/test-configuration
---

# Configure the Quality Tooling

## Outcome

You will configure the same quality tools as the reference app: Prettier, ESLint, Astro Check, Vitest, Testing Library, Playwright, and axe. One `pnpm validate` command will run the complete local gate.

Each tool answers a different question. Formatting keeps source consistent. Linting catches suspicious patterns. Astro Check validates Astro and TypeScript. Vitest covers functions and components. Playwright covers generated routes and browser behavior. Axe checks rules that can be detected automatically.

## Install development dependencies

Run:

```sh
pnpm add -D @astrojs/check@^0.9.10 typescript@^6.0.3 vitest@^4.1.11 jsdom@^30.0.1 @testing-library/react@^16.3.3 @testing-library/jest-dom@^7.0.1 @testing-library/user-event@^14.6.6 @playwright/test@^1.62.1 @axe-core/playwright@^4.13.0 eslint@^9.39.5 @eslint/js@^9.39.5 eslint-plugin-astro@^1.7.0 eslint-plugin-react-hooks@^7.1.1 globals@^17.11.0 typescript-eslint@^8.68.0 prettier@^3.9.6 prettier-plugin-astro@^0.14.1 prettier-plugin-tailwindcss@^0.8.1
pnpm exec playwright install chromium
```

The browser install is separate from the Playwright package. It downloads the Chromium binary used by both configured projects.

## Complete the package scripts

Make the `scripts` object in `package.json` contain:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "check": "astro check",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "pnpm build && playwright test",
    "validate": "pnpm format:check && pnpm lint && pnpm check && pnpm test && pnpm test:e2e"
  }
}
```

`test:e2e` builds before starting Playwright because the Playwright server runs `pnpm preview`, which serves `dist/`. The full validation order stops on the first failure and avoids spending browser-test time on code that does not type-check.

## Configure formatting

Create `prettier.config.mjs`:

```js
/** @type {import('prettier').Config} */
export default {
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  overrides: [
    {
      files: "*.astro",
      options: { parser: "astro" },
    },
  ],
  singleQuote: true,
  trailingComma: "all",
};
```

The Astro plugin parses component syntax. The Tailwind plugin applies a stable utility-class order. Run `pnpm format` once after creating the remaining tests, then use `format:check` in validation so the gate reports drift without rewriting files.

## Configure ESLint

Create `eslint.config.js`:

```js
import eslint from "@eslint/js";
import astro from "eslint-plugin-astro";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".astro/**",
      "dist/**",
      "node_modules/**",
      "playwright-report/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: reactHooks.configs.flat.recommended.rules,
  }
);
```

The flat config includes JavaScript, TypeScript, Astro, and React Hooks rules. Browser and Node globals are both required because source spans components, configuration, tests, and endpoint code.

## Upgrade Vitest for components

Replace `vitest.config.ts`:

```ts
/// <reference types="vitest/config" />

import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    environmentOptions: {
      jsdom: {
        url: "http://localhost/",
        pretendToBeVisual: true,
      },
    },
    setupFiles: ["./tests/setup/vitest.ts"],
  },
});
```

Pure tests also run in jsdom. One environment keeps the suite simple and gives React tests a document, history, and browser event APIs. `pretendToBeVisual: true` makes jsdom expose visual-browser behavior such as `requestAnimationFrame`, which the SavedPlan focus helper uses after React commits a removal.

Create `tests/setup/vitest.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

class MemoryStorage implements Storage {
  #values = new Map<string, string>();

  get length() {
    return this.#values.size;
  }

  clear() {
    this.#values.clear();
  }

  getItem(key: string) {
    return this.#values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.#values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.#values.delete(key);
  }

  setItem(key: string, value: string) {
    this.#values.set(key, value);
  }
}

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: new MemoryStorage(),
  });
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.history.replaceState({}, "", "/");
});
```

A fresh storage object per test isolates both data and the storage module's unavailable-object `WeakSet`. Cleanup removes rendered React trees and resets browser history.

## Configure desktop and mobile browsers

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "pnpm preview --host 127.0.0.1",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
  },
});
```

Every ordinary browser test now runs in desktop and mobile Chromium. `webServer` starts the built artifact and waits until it responds.

## Runnable checkpoint

Run:

```sh
pnpm format
SITE_URL=https://events.example.com pnpm lint
SITE_URL=https://events.example.com pnpm check
SITE_URL=https://events.example.com pnpm test
SITE_URL=https://events.example.com pnpm build
```

All commands should pass with the existing filter and storage tests. `pnpm exec playwright --version` should report the installed Playwright version. Do not run `pnpm validate` yet because the E2E directory is created in lesson 9.3.
