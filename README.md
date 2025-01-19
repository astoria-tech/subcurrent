# Subcurrent

A content aggregator for the Astoria Tech Meetup.

## Stack

- TypeScript
- Next.js with App Router
- React
- Tailwind CSS
- Prisma
- Sqlite

## Setup

1. Clone the repo
2. Run `npm install`
3. Run `npm run dev`
4. Open [http://localhost:3000/community-blogs](http://localhost:3000/community-blogs) with your browser.

## Development

This project attempts to follow Next.js w/ App Router conventions:

- All pages are in `src/app/<PAGE_NAME>/page.tsx`
- All API routes are in `src/app/api/<ROUTE_NAME>/route.ts`

The tree structure is as follows:

```txt
.
├── README.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── prisma
│   ├── migrations
│   │   ├── 20250118205732_init
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   ├── schema.prisma
│   └── subcurrent.db
├── public
│   ├── ...
├── src
│   ├── app
│   │   ├── admin
│   │   │   └── page.tsx
│   │   ├── api
│   │   │   ├── get-posts
│   │   │   │   └── route.ts
│   │   │   ├── register-feed
│   │   │   │   └── route.ts
│   │   │   └── update-feeds
│   │   │       └── route.ts
│   │   ├── community-blogs
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib
│       └── db.js
├── tailwind.config.ts
└── tsconfig.json
```

## Database

This project uses Prisma with Sqlite. The database is stored in `prisma/subcurrent.db`.

The database schema is defined in `prisma/schema.prisma`. If you make changes to the schema, you will need to run `npx prisma migrate dev --name <MIGRATION_NAME>` to create a new migration.

For an interactive database explorer, run `npm run prisma:studio`.

## User experience

This is going to change rapidly, but at time of writing, the user experience is as follows:

1. See a list of community blogs at http://localhost:3000/community-blogs
2. Add a new blog to the list by visiting http://localhost:3000/admin

Other actions will require you to open the interactive database explorer and manually manipulate data. See the "Database" section above.

## Boilterplate Next.js readme below

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
