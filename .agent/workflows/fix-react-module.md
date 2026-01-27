---
description: Fix missing React module and type declarations
---

This workflow resolves the TypeScript error `Cannot find module 'react' or its corresponding type declarations` by ensuring that the required packages and type definitions are installed.

1. Install project dependencies (including React).
```bash
npm install
```
// turbo
2. Install TypeScript type definitions for React and ReactDOM.
```bash
npm install -D @types/react @types/react-dom
```
// turbo
3. Verify that `node_modules` now contains `react`, `react-dom`, and the `@types` packages.
4. Restart the development server to ensure the changes take effect.
```bash
npm run dev
```
// turbo
5. If the error persists, ensure your `tsconfig.json` has the appropriate `jsx` setting (`"react-jsx"`) and that the `types` array includes `react` and `react-dom`.

After completing these steps, the TypeScript compiler should locate the React module and its type declarations, and the application should compile and run without the mentioned error.
