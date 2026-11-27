# Expense Tracker Frontend

Next.js, React, and TypeScript UI for the Expense Tracker. The shared UI shell and dashboard filters live under `src/app/(UI)/`, `src/components/NavBar/`, and `src/components/TopBar/`. Account summary, type dashboards, and forms live under `src/components/Account/`.

## Getting Started

Install dependencies if needed, then run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3030](http://localhost:3030) with your browser to see the result.

Frontend actions in `src/app/actions.ts` call the app-service; coordinate API changes with that service and the DB GraphQL contract.

## Workspace notes

- [Project map](../project-structure.md) — service ownership and important paths.
- [Account feature notes](../account-change.md) — current account behavior and design decisions.
- [Workspace change log](../change-log.md) — dated reasons and validation for changes.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
