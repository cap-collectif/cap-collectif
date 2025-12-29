---
name: react-nextjs
description: Crée des composants React et pages Next.js avec Relay GraphQL dans admin-next/. Couvre fragments, queries, pages dynamiques, hooks et patterns du projet.
---

# React / Next.js / Relay

Guide pour créer des composants React et pages Next.js dans `admin-next/` avec les patterns du projet.

## Structure du projet

```
admin-next/
├── pages/admin-next/           # Route back office (Pages Router)
│   ├── my-feature.tsx          # Page simple
│   └── entity/
│       ├── [entityId].tsx      # Page dynamique
│       └── [entityId]/
│           └── settings.tsx    # Sous-page
├── components/
│   ├── BackOffice/             # Composants admin
│   └── FrontOffice/            # Composants front-end
├── shared/                     # Composants réutilisables
├── hooks/                      # Custom hooks
├── mutations/                  # Mutations GraphQL
└── __generated__/              # Types Relay générés
```

## Créer un composant avec fragment Relay

```typescript
// components/BackOffice/MyFeature/MyFeatureCard.tsx
import { graphql, useFragment } from 'react-relay'
import type { MyFeatureCard_entity$key } from '@relay/MyFeatureCard_entity.graphql'
import { Card, CardContent, Text } from '@cap-collectif/ui'

const FRAGMENT = graphql`
  fragment MyFeatureCard_entity on Entity {
    id
    title
    description
    createdAt
  }
`

type Props = {
  entity: MyFeatureCard_entity$key
}

export const MyFeatureCard: React.FC<Props> = ({ entity: entityRef }) => {
  const entity = useFragment(FRAGMENT, entityRef)

  return (
    <Card>
      <CardContent primaryInfo={entity.title}>
        <Text>{entity.description}</Text>
      </CardContent>
    </Card>
  )
}
```

### Conventions de nommage fragments

| Element | Pattern | Exemple |
|---------|---------|---------|
| Fragment | `ComponentName_fieldName` | `ProposalCard_proposal` |
| Type data | `FragmentName$data` | `ProposalCard_proposal$data` |
| Type key | `FragmentName$key` | `ProposalCard_proposal$key` |
| Variable | `FRAGMENT` | `const FRAGMENT = graphql...` |

### Fragment avec arguments

```typescript
const FRAGMENT = graphql`
  fragment MyList_query on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 10 }
    cursor: { type: "String" }
    orderBy: { type: "[EntityOrder]" }
  )
  @refetchable(queryName: "MyListPaginationQuery") {
    entities(first: $count, after: $cursor, orderBy: $orderBy)
      @connection(key: "MyList_entities") {
      edges {
        node {
          id
          ...MyFeatureCard_entity
        }
      }
      totalCount
    }
  }
`
```

### Composition de fragments

```typescript
const FRAGMENT = graphql`
  fragment ParentComponent_data on Query {
    viewer {
      ...ChildComponent_viewer
    }
    node(id: $id) {
      ...AnotherChild_node
    }
  }
`
```

## Créer une page Next.js

### Pattern useQueryLoader (recommandé)

```typescript
// pages/admin-next/my-feature.tsx
import * as React from 'react'
import { Suspense } from 'react'
import type { NextPage } from 'next'
import { graphql, useQueryLoader, usePreloadedQuery } from 'react-relay'
import type { PreloadedQuery } from 'react-relay'
import { useIntl } from 'react-intl'
import { Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import { withPageAuthRequired } from '@utils/withPageAuthRequired'
import type { PageProps } from '@utils/types'
import type { myFeatureQuery as QueryType } from '@relay/myFeatureQuery.graphql'

// 1. Query au niveau module
export const myFeatureQuery = graphql`
  query myFeatureQuery {
    viewer {
      id
      username
      isAdmin
    }
    # ... other fields
  }
`

// 2. Props du composant inner
type ContentProps = {
  queryReference: PreloadedQuery<QueryType>
}

// 3. Composant inner avec usePreloadedQuery
const MyFeatureContent: React.FC<ContentProps> = ({ queryReference }) => {
  const query = usePreloadedQuery<QueryType>(myFeatureQuery, queryReference)
  const intl = useIntl()

  return (
    <div>
      {/* Contenu de la page */}
    </div>
  )
}

// 4. Page principale avec useQueryLoader
const MyFeaturePage: NextPage<PageProps> = ({ viewerSession }) => {
  const intl = useIntl()
  const [queryReference, loadQuery, disposeQuery] =
    useQueryLoader<QueryType>(myFeatureQuery)

  React.useEffect(() => {
    loadQuery({})
    return () => disposeQuery()
  }, [loadQuery, disposeQuery])

  return (
    <Layout navTitle={intl.formatMessage({ id: 'my-feature.title' })}>
      <Suspense fallback={<Spinner />}>
        {queryReference && (
          <MyFeatureContent queryReference={queryReference} />
        )}
      </Suspense>
    </Layout>
  )
}

// 5. Guard d'authentification
export const getServerSideProps = withPageAuthRequired

export default MyFeaturePage
```

### Pattern useLazyLoadQuery (simplifie)

Pour les pages simples sans besoin de refetch :

```typescript
import { useLazyLoadQuery } from 'react-relay'

const SimpleContent: React.FC<{ entityId: string }> = ({ entityId }) => {
  const response = useLazyLoadQuery<QueryType>(QUERY, { id: entityId })
  const entity = response.node

  if (!entity) {
    return <NotFound />
  }

  return <EntityForm entity={entity} />
}

const SimplePage: NextPage<PageProps> = () => {
  const router = useRouter()
  const { entityId } = router.query as { entityId: string }

  return (
    <Layout navTitle="Entity">
      <Suspense fallback={<Spinner />}>
        <SimpleContent entityId={entityId} />
      </Suspense>
    </Layout>
  )
}
```

### Page avec route dynamique

```typescript
// pages/admin-next/entity/[entityId].tsx
import { useRouter } from 'next/router'

export const entityQuery = graphql`
  query entityQuery($id: ID!) {
    node(id: $id) {
      ... on Entity {
        id
        title
      }
    }
  }
`

const EntityPage: NextPage<PageProps> = () => {
  const router = useRouter()
  const { entityId } = router.query as { entityId: string }

  const [queryReference, loadQuery, disposeQuery] =
    useQueryLoader<entityQueryType>(entityQuery)

  React.useEffect(() => {
    if (entityId) {
      loadQuery({ id: entityId })
    }
    return () => disposeQuery()
  }, [entityId, loadQuery, disposeQuery])

  return (
    <Layout navTitle="Entity">
      <Suspense fallback={<Spinner />}>
        {queryReference && <EntityContent queryReference={queryReference} />}
      </Suspense>
    </Layout>
  )
}
```

## Hooks courants

### useDisclosure (modales, menus)

```typescript
import { useDisclosure } from '@liinkiing/react-hooks'

const { isOpen, onOpen, onClose, onToggle } = useDisclosure(false)

<Button onClick={onOpen}>Ouvrir</Button>
<Modal show={isOpen} onClose={onClose}>...</Modal>
```

### useIsMobile (responsive)

```typescript
import useIsMobile from '@hooks/useIsMobile'

const isMobile = useIsMobile()

return isMobile ? <MobileView /> : <DesktopView />
```

### useFeatureFlag

```typescript
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

const isEnabled = useFeatureFlag('feature_name')

if (!isEnabled) return null
```

### useQueryState / useQueryStates (URL state avec nuqs)

```typescript
import { parseAsString, parseAsInteger, useQueryState, useQueryStates } from 'nuqs'

// Single value
const [search, setSearch] = useQueryState('q')
const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

// Multiple values
const [filters, setFilters] = useQueryStates({
  sort: parseAsString.withDefault('date'),
  category: parseAsString.withDefault('ALL'),
  status: parseAsString,
}, { history: 'push' })
```

### useNavBarContext (breadcrumbs)

```typescript
import { useNavBarContext } from '@shared/navbar/NavBar.context'

const { setBreadCrumbItems } = useNavBarContext()

React.useEffect(() => {
  setBreadCrumbItems([
    { title: 'Projects', href: '/admin-next/projects' },
    { title: entity.title, href: '' },
  ])
  return () => setBreadCrumbItems([])
}, [entity])
```

## Pagination avec Relay

```typescript
import { usePaginationFragment } from 'react-relay'

const FRAGMENT = graphql`
  fragment MyList_query on Query
  @argumentDefinitions(
    count: { type: "Int!", defaultValue: 20 }
    cursor: { type: "String" }
  )
  @refetchable(queryName: "MyListPaginationQuery") {
    items(first: $count, after: $cursor)
      @connection(key: "MyList_items") {
      edges {
        node {
          id
          ...ItemCard_item
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`

const MyList: React.FC<Props> = ({ query: queryRef }) => {
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(
    FRAGMENT,
    queryRef
  )

  return (
    <>
      {data.items.edges.map(({ node }) => (
        <ItemCard key={node.id} item={node} />
      ))}
      {hasNext && (
        <Button
          onClick={() => loadNext(20)}
          isLoading={isLoadingNext}
        >
          Load more
        </Button>
      )}
    </>
  )
}
```

## Internationalisation

```typescript
import { useIntl, FormattedMessage } from 'react-intl'

const intl = useIntl()

// Via hook
const title = intl.formatMessage({ id: 'my-feature.title' })
const withParams = intl.formatMessage(
  { id: 'items.count' },
  { count: 42 }
)

// Via component
<FormattedMessage id="my-feature.description" />
```

## Error Boundary

```typescript
import { ErrorBoundary } from 'react-error-boundary'

const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <Flex direction="column" align="center" p="lg">
    <Text color="red.500">Une erreur est survenue</Text>
    <Button onClick={() => window.location.reload()}>
      Recharger
    </Button>
  </Flex>
)

const Page: NextPage = () => (
  <Layout navTitle="...">
    <Suspense fallback={<Spinner />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PageContent />
      </ErrorBoundary>
    </Suspense>
  </Layout>
)
```

## Apres creation

1. **Compiler Relay** :
   ```bash
   cd admin-next && yarn relay
   ```

2. **Verifier les types** :
   ```bash
   cd admin-next && yarn ts
   ```

3. **Tester** : `https://capco.dev/admin-next/my-feature`

## Exemples du projet

### Pages
- Liste : [projects.tsx](admin-next/pages/admin-next/projects.tsx)
- Dynamique : [project/[projectId].tsx](admin-next/pages/admin-next/project/[projectId].tsx)
- Avec tabs : [project/[projectId]/contributions.tsx](admin-next/pages/admin-next/project/[projectId]/contributions.tsx)

### Composants
- Card avec fragment : [ProjectCard.tsx](admin-next/shared/projectCard/ProjectCard.tsx)
- Liste paginee : [ProposalListViewContent.tsx](admin-next/components/FrontOffice/ProposalListView/ProposalListViewContent.tsx)
- Modal : [RegistrationModal.tsx](admin-next/shared/register/RegistrationModal.tsx)

## Checklist

### Composant
- [ ] Fragment nomme `ComponentName_fieldName`
- [ ] Props typees avec `$key`
- [ ] `useFragment` pour unwrap les donnees
- [ ] `yarn relay` execute

### Page
- [ ] Query GraphQL au niveau module
- [ ] `useQueryLoader` ou `useLazyLoadQuery`
- [ ] `Suspense` avec `<Spinner />` fallback
- [ ] `Layout` avec `navTitle`
- [ ] `getServerSideProps = withPageAuthRequired`
- [ ] Breadcrumbs si page imbriquee
- [ ] Types verifies avec `yarn ts`
