This is our [Next.js](https://nextjs.org/) administration.

## Getting Started

### Requirements

First, make sure your `/etc/host` contains:

```
127.0.0.1 admin-next.capco.dev
```

Then check all docker containers are running (`fab local.infrastructures.up`), because `admin-next` is using Redis from `platform`.

### Daily commands

Start the development Admin Next SSL proxy (you will need to keep it running, it adds HTTPS support):

```bash
yarn start-ssl-proxy
```

Then in an other tab you can start the NextJS development server:

```bash
yarn dev
```

Open [https://admin-next.capco.dev:3001/](https://admin-next.capco.dev:3001/) with your browser to see the result.

The `pages/*` directory is mapped to `/*` with auto reloading. 

## How to install deps

We use a workspace, so use something like :

```bash
yarn workspace admin-next add next@10 react@16.14.0 react-dom@16.14.0 babel-plugin-relay @babel/preset-flow @babel/preset-react
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
