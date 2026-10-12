# Admin-next

This is our [Next.js](https://nextjs.org/) implementation for our new administration.
## Getting Started

### Requirements

Follow the [local installation guide](../doc/installation-locale.md), then
check that the Docker stack is running:

```bash
castor local:infrastructures:up
```

`admin-next` uses Redis to access the user's session.

### Daily commands

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
