/* eslint-env jest */
import { render, screen } from '@testing-library/react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { RelaySuspensFragmentTest } from 'tests/testUtils'
import PostItem from './PostItem'
import { PostItemTestQuery } from '@relay/PostItemTestQuery.graphql'

/**
 * @jest-status compliant
 * @jest-reason Checks visible post titles and author links with explicit Relay states and real portals.
 */
describe('<PostItem />', () => {
  let environment: any
  let TestComponent: any

  const defaultMockResolvers = {
    Post: () => ({
      id: 'UG9zdDpwb3N0MTI=',
      title: 'Post FR 12',
      adminUrl: 'https://localhost:8000/admin/capco/app/post/post12/edit?_locale=fr-FR',
      url: 'https://localhost/blog/post-fr-12',
      authors: [
        {
          id: 'VXNlcjp1c2VyMQ==',
          url: 'https://localhost/profile/lbrunet',
          username: 'lbrunet',
        },
      ],
      isPublished: true,
      updatedAt: '2021-08-04 17:50:27',
      relatedContent: [
        {
          __typename: 'Theme',
          title: 'Immobilier',
          url: 'https://localhost:8000/themes/immobilier?_locale=fr-FR',
        },
        {
          __typename: 'Theme',
          title: 'Justice',
          url: 'https://localhost:8000/themes/justice?_locale=fr-FR',
        },
      ],
    }),
    User: () => ({
      isAdmin: true,
      isAdminOrganization: false,
      organizations: null,
    }),
  }
  const query = graphql`
    query PostItemTestQuery($id: ID = "<default>") @relay_test_operation {
      post: node(id: $id) {
        ...PostItem_post
      }
      viewer {
        ...PostItem_viewer
      }
    }
  `
  beforeEach(() => {
    environment = createMockEnvironment()
    const queryVariables = {}
    const TestRenderer = props => {
      const data = useLazyLoadQuery<PostItemTestQuery>(query, queryVariables)
      if (!data.post) return null
      return (
        <PostItem
          post={data.post}
          viewer={data.viewer}
          connectionName="client:VXNlcjp1c2VyMQ==:__PostList_posts_connection"
          isAdmin
          {...props}
        />
      )
    }
    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )
  })

  it('links the title to the post editor', () => {
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
    render(<TestComponent />)
    expect(screen.getByRole('link', { name: 'Post FR 12' }).getAttribute('href')).toBe(
      'https://localhost:8000/admin/capco/app/post/post12/edit?_locale=fr-FR',
    )
  })
  it('keeps the post visible without an author link when authors are empty', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        Post: () => ({
          id: 'UG9zdDpwb3N0MTI=',
          title: 'Post FR 12',
          adminUrl: 'https://localhost:8000/admin/capco/app/post/post12/edit?_locale=fr-FR',
          url: 'https://localhost/blog/post-fr-12',
          authors: [],
          isPublished: true,
          updatedAt: '2021-08-04 17:50:27',
          relatedContent: [
            {
              __typename: 'Theme',
              title: 'Immobilier',
              url: 'https://localhost:8000/themes/immobilier?_locale=fr-FR',
            },
            {
              __typename: 'Theme',
              title: 'Justice',
              url: 'https://localhost:8000/themes/justice?_locale=fr-FR',
            },
          ],
        }),
      }),
    )
    render(<TestComponent />)
    expect(screen.getByRole('link', { name: 'Post FR 12' }).getAttribute('href')).toBe(
      'https://localhost:8000/admin/capco/app/post/post12/edit?_locale=fr-FR',
    )
    expect(screen.queryByRole('link', { name: 'lbrunet' })).toBeNull()
  })

  /**
   * @jest-status compliant
   * @jest-reason Observes author text and profile links from explicit Relay author states in the DOM.
   */
  test.each([
    { name: 'anonymized user with a URL', type: 'User', isAnonymized: true, url: '/profile/author', linked: false },
    { name: 'active user', type: 'User', isAnonymized: false, url: '/profile/author', linked: true },
    {
      name: 'organization',
      type: 'Organization',
      isAnonymized: false,
      url: '/profile/organization/team',
      linked: true,
    },
    { name: 'author without a URL', type: 'User', isAnonymized: false, url: '', linked: false },
  ])('renders the profile link correctly for $name', ({ type, isAnonymized, url, linked }) => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        Post: () => ({
          ...defaultMockResolvers.Post(),
          authors: [{ __typename: type, username: 'Test author', url }],
        }),
        Author: () => ({ __typename: type, username: 'Test author', url }),
        User: () => ({ ...defaultMockResolvers.User(), isAdmin: true, isAnonymized }),
      }),
    )

    render(<TestComponent />)

    expect(screen.getByText('Test author').textContent).toBe('Test author')
    const link = screen.queryByRole('link', { name: 'Test author' })
    if (linked) {
      expect(link?.getAttribute('href')).toBe(url)
    } else {
      expect(link).toBeNull()
    }
  })
})
