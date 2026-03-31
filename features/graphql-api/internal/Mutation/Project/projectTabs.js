/* eslint-env jest */
import '../../../_setupDB'

const ProjectTabFields = `
  __typename
  title
  slug
  enabled
  type
  position
  ... on ProjectTabPresentation {
    body
  }
  ... on ProjectTabCustom {
    body
  }
  ... on ProjectTabNews {
    news {
      id
      title
    }
  }
  ... on ProjectTabEvents {
    events {
      id
      title
    }
  }
`

const CreateCustomProjectTabMutation = /* GraphQL */ `
  mutation CreateCustomProjectTab($input: CreateCustomProjectTabInput!) {
    createCustomProjectTab(input: $input) {
      projectTab {
        ${ProjectTabFields}
      }
      errorCode
    }
  }
`

const CreatePresentationProjectTabMutation = /* GraphQL */ `
  mutation CreatePresentationProjectTab($input: CreatePresentationProjectTabInput!) {
    createPresentationProjectTab(input: $input) {
      projectTab {
        ${ProjectTabFields}
      }
      errorCode
    }
  }
`

const CreateNewsProjectTabMutation = /* GraphQL */ `
  mutation CreateNewsProjectTab($input: CreateNewsProjectTabInput!) {
    createNewsProjectTab(input: $input) {
      projectTab {
        ${ProjectTabFields}
      }
      errorCode
    }
  }
`

const UpdateCustomProjectTabMutation = /* GraphQL */ `
  mutation UpdateCustomProjectTab($input: UpdateCustomProjectTabInput!) {
    updateCustomProjectTab(input: $input) {
      projectTab {
        ${ProjectTabFields}
      }
      errorCode
    }
  }
`

const UpdatePresentationProjectTabMutation = /* GraphQL */ `
  mutation UpdatePresentationProjectTab($input: UpdatePresentationProjectTabInput!) {
    updatePresentationProjectTab(input: $input) {
      projectTab {
        ${ProjectTabFields}
      }
      errorCode
    }
  }
`

const UpdateNewsProjectTabMutation = /* GraphQL */ `
  mutation UpdateNewsProjectTab($input: UpdateNewsProjectTabInput!) {
    updateNewsProjectTab(input: $input) {
      projectTab {
        ${ProjectTabFields}
      }
      errorCode
    }
  }
`

const UpdateEventsProjectTabMutation = /* GraphQL */ `
  mutation UpdateEventsProjectTab($input: UpdateEventsProjectTabInput!) {
    updateEventsProjectTab(input: $input) {
      projectTab {
        ${ProjectTabFields}
      }
      errorCode
    }
  }
`

const DeleteProjectTabMutation = /* GraphQL */ `
  mutation DeleteProjectTab($input: DeleteProjectTabInput!) {
    deleteProjectTab(input: $input) {
      deletedProjectTabId
      errorCode
    }
  }
`

const ReorderProjectTabsMutation = /* GraphQL */ `
  mutation ReorderProjectTabs($input: ReorderProjectTabsInput!) {
    reorderProjectTabs(input: $input) {
      project {
        tabs {
          slug
          position
        }
      }
      errorCode
    }
  }
`

const projectId = toGlobalId('Project', 'project1')
const presentationTabId = toGlobalId('ProjectTab', 'projectTabPresentationP1')
const newsTabId = toGlobalId('ProjectTab', 'projectTabNewsP1')
const eventsTabId = toGlobalId('ProjectTab', 'projectTabEventsP1')
const customTabId = toGlobalId('ProjectTab', 'projectTabCustomP1')
const post1Id = toGlobalId('Post', 'post1')
const post2Id = toGlobalId('Post', 'post2')
const event1Id = toGlobalId('Event', 'event1')
const event2Id = toGlobalId('Event', 'event2')

describe('mutations.projectTabs', () => {
  it('rejects duplicate slug on create', async () => {
    const response = await graphql(
      CreateCustomProjectTabMutation,
      {
        input: {
          projectId,
          title: 'Un onglet',
          slug: 'presentation',
          enabled: false,
          body: '<p>Body</p>',
        },
      },
      'internal_admin',
    )

    expect(response.createCustomProjectTab.projectTab).toBe(null)
    expect(response.createCustomProjectTab.errorCode).toBe('SLUG_ALREADY_EXISTS')
  })

  it('rejects a second presentation tab', async () => {
    const response = await graphql(
      CreatePresentationProjectTabMutation,
      {
        input: {
          projectId,
          title: 'Présentation bis',
          slug: 'presentation-bis',
          enabled: true,
          body: '<p>Body</p>',
        },
      },
      'internal_admin',
    )

    expect(response.createPresentationProjectTab.projectTab).toBe(null)
    expect(response.createPresentationProjectTab.errorCode).toBe('PRESENTATION_ALREADY_EXISTS')
  })

  it('creates a custom tab', async () => {
    await expect(
      graphql(
        CreateCustomProjectTabMutation,
        {
          input: {
            projectId,
            title: 'Nouveau bloc',
            slug: 'Nouveau bloc',
            enabled: false,
            body: '<p>Contenu de bloc</p>',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('requires news items for news tabs', async () => {
    const response = await graphql(
      CreateNewsProjectTabMutation,
      {
        input: {
          projectId,
          title: 'Actus 2',
          slug: 'actus-2',
          enabled: true,
        },
      },
      'internal_admin',
    )

    expect(response.createNewsProjectTab.projectTab).toBe(null)
    expect(response.createNewsProjectTab.errorCode).toBe('NEWS_ITEMS_REQUIRED')
  })

  it('updates a custom tab', async () => {
    await expect(
      graphql(
        UpdateCustomProjectTabMutation,
        {
          input: {
            tabId: customTabId,
            title: 'Infos utiles',
            slug: 'Infos Utiles',
            enabled: true,
            body: '<p>Contenu mis à jour</p>',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('rejects update when the mutation type does not match the tab type', async () => {
    const response = await graphql(
      UpdatePresentationProjectTabMutation,
      {
        input: {
          tabId: customTabId,
          title: 'Titre',
          slug: 'titre',
          enabled: true,
          body: '<p>Body</p>',
        },
      },
      'internal_admin',
    )

    expect(response.updatePresentationProjectTab.projectTab).toBe(null)
    expect(response.updatePresentationProjectTab.errorCode).toBe('INVALID_TAB_TYPE')
  })

  it('updates news items with the provided order', async () => {
    const response = await graphql(
      UpdateNewsProjectTabMutation,
      {
        input: {
          tabId: newsTabId,
          title: 'Actualités',
          slug: 'actualites',
          enabled: true,
          newsItems: [
            { id: post1Id, position: 1 },
            { id: post2Id, position: 2 },
          ],
        },
      },
      'internal_admin',
    )

    expect(response.updateNewsProjectTab.errorCode).toBe(null)
    expect(response.updateNewsProjectTab.projectTab.news.map(({ id }) => id)).toEqual([post1Id, post2Id])
  })

  it('rejects duplicated news item positions', async () => {
    const response = await graphql(
      UpdateNewsProjectTabMutation,
      {
        input: {
          tabId: newsTabId,
          title: 'Actualités',
          slug: 'actualites',
          enabled: true,
          newsItems: [
            { id: post1Id, position: 1 },
            { id: post2Id, position: 1 },
          ],
        },
      },
      'internal_admin',
    )

    expect(response.updateNewsProjectTab.projectTab).toBe(null)
    expect(response.updateNewsProjectTab.errorCode).toBe('INVALID_NEWS_ITEMS')
  })

  it('rejects duplicated event items', async () => {
    const response = await graphql(
      UpdateEventsProjectTabMutation,
      {
        input: {
          tabId: eventsTabId,
          title: 'Événements',
          slug: 'evenements',
          enabled: true,
          eventItems: [
            { id: event1Id, position: 1 },
            { id: event1Id, position: 2 },
          ],
        },
      },
      'internal_admin',
    )

    expect(response.updateEventsProjectTab.projectTab).toBe(null)
    expect(response.updateEventsProjectTab.errorCode).toBe('INVALID_EVENT_ITEMS')
  })

  it('rejects duplicated event item positions', async () => {
    const response = await graphql(
      UpdateEventsProjectTabMutation,
      {
        input: {
          tabId: eventsTabId,
          title: 'Événements',
          slug: 'evenements',
          enabled: true,
          eventItems: [
            { id: event1Id, position: 1 },
            { id: event2Id, position: 1 },
          ],
        },
      },
      'internal_admin',
    )

    expect(response.updateEventsProjectTab.projectTab).toBe(null)
    expect(response.updateEventsProjectTab.errorCode).toBe('INVALID_EVENT_ITEMS')
  })

  it('deletes a tab', async () => {
    const response = await graphql(
      DeleteProjectTabMutation,
      {
        input: {
          tabId: customTabId,
        },
      },
      'internal_admin',
    )

    expect(response.deleteProjectTab.deletedProjectTabId).toBe(customTabId)
    expect(response.deleteProjectTab.errorCode).toBe(null)
  })

  it('rejects invalid reorder payloads', async () => {
    const response = await graphql(
      ReorderProjectTabsMutation,
      {
        input: {
          projectId,
          tabIds: [presentationTabId, newsTabId],
        },
      },
      'internal_admin',
    )

    expect(response.reorderProjectTabs.project).toBe(null)
    expect(response.reorderProjectTabs.errorCode).toBe('INVALID_REORDER')
  })

  it('reorders tabs', async () => {
    await expect(
      graphql(
        ReorderProjectTabsMutation,
        {
          input: {
            projectId,
            tabIds: [newsTabId, presentationTabId, eventsTabId, customTabId],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
