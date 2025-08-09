# mohammadifaizulhasan_fdtest

This is a monorepo project containing:
- **Next.js frontend** (TypeScript, Tailwind, App Router): `apps/nextjs-app`
- **Express.js backend** (TypeScript): `apps/express-api`

## Getting Started

### Next.js Frontend
```
cd apps/nextjs-app
npm run dev
```

### Express.js Backend
```
cd apps/express-api
npx ts-node src/index.ts
```

## Monorepo Structure
- All apps are inside the `apps` folder.
- Use the root `package.json` for workspace management if needed.

---
For more details, see each app's README.
