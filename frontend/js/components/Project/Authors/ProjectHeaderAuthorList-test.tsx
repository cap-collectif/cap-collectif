/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import ProjectHeaderAuthorList from '~/components/Project/Authors/ProjectHeaderAuthorList'
import MockProviders, { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import type { ProjectHeaderAuthorListTestQuery } from '~relay/ProjectHeaderAuthorListTestQuery.graphql'

describe('<ProjectHeaderAuthorList />', () => {
  let environment
  let TestComponent
  const defaultMockResolvers = {
    Project: () => ({
      authors: [
        {
          id: 'VXNlcjp1c2VyQWRtaW4=',
          username: 'admin',
          avatarUrl: null,
          url: 'https://capco.dev/profile/admin',
          userType: {
            name: 'Cioyen',
          },
          media: null,
        },
        {
          id: 'VXNlcjp1c2VyV2VsY29tYXR0aWM=',
          username: 'welcomattic',
          avatarUrl: 'https://assets.cap.co/media/default/0001/01/providerReference12.jpg',
          url: 'https://capco.dev/profile/welcomattic',
          userType: {
            name: 'Citoyen',
          },
          media: {
            url: 'https://assets.cap.co/media/default/0001/01/providerReference12.jpg',
          },
        },
      ],
    }),
  }
  const query = graphql`
    query ProjectHeaderAuthorListTestQuery($id: ID = "<default>") @relay_test_operation {
      project: node(id: $id) {
        ...ProjectHeaderAuthorList_project
      }
    }
  `
  afterEach(() => {
    clearSupportForPortals()
  })
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = props => {
      const data = useLazyLoadQuery<ProjectHeaderAuthorListTestQuery>(query, {})
      if (!data.project) return null
      return <ProjectHeaderAuthorList project={data.project} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  it('should render correctly', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly with one author', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        project: () => ({
          authors: [
            {
              id: 'VXNlcjp1c2VyQWRtaW4=',
              username: 'admin',
              avatarUrl: null,
              url: 'https://capco.dev/profile/admin',
              userType: {
                name: 'Citoyen',
              },
              media: null,
            },
          ],
        }),
      }),
    )
    const wrapper = ReactTestRenderer.create(<TestComponent />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly without authors', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        project: () => ({
          authors: [],
        }),
      }),
    )
    const wrapper = ReactTestRenderer.create(<TestComponent />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly with two authors but profiles are disabled', () => {
    const wrapper = ReactTestRenderer.create(
      <MockProviders
        store={{
          project: {
            default: {
              features: {
                profiles: false,
              },
            },
          },
        }}
      >
        <TestComponent />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
