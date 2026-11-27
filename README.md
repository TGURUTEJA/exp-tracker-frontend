# Expense Tracker Frontend

Next.js, React, and TypeScript UI for the Expense Tracker. The shared UI shell and dashboard filters live under `src/app/(UI)/`, `src/components/NavBar/`, and `src/components/TopBar/`. Account summary, type dashboards, and forms live under `src/components/Account/`.

## Getting Started

Install dependencies if needed, then start the development server through the repo script:

```bash
npm install
bash ./run.sh
```

`run.sh` loads `../.env`, which supplies the app-service URL/port and `UI_PORT`. The default local UI address is [http://localhost:3031](http://localhost:3031); a bare `npm run dev` may miss those values and break API routing.

Frontend actions in `src/app/actions.ts` call the app-service; coordinate API changes with that service and the DB GraphQL contract.

## Current UI shell

- The top bar shows a custom calendar date button (selecting a date sets the daily filter), the search/type/period controls, and the current page name at the far right; the app name is not repeated there.
- The home page uses accessible icon-only actions in card headings; the page name is visible only in the top bar.
- The sidebar and top bar stay in place. At desktop widths, the home-only Net Worth status card, account carousel (about 3.5 equal-width cards visible), and Category activity share one row and the same height. Category activity shows the top four spending categories for the selected period as a list, with more horizontal space than Recent transactions. The Net Worth card shows an assets/liabilities pie and bar plus the period start/end comparison. The carousel scrollbar is hidden while horizontal scrolling remains available. In the lower dashboard, Budget progress is on the left, Recent transactions occupies the center, and the future placeholders are stacked vertically on the right. Narrower screens and other pages remain scrollable.
- Two future cards, “Spending insights” and “Savings goals”, are reserved on the dashboard.
- The UI shell requires first name, last name, and date of birth before other app features can be used; missing profile details are saved through the authenticated app-service API.

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
