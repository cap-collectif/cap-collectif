/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import ProjectHeader from '~/components/Project/ProjectHeader'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import type { ProjectHeaderTestQuery } from '~relay/ProjectHeaderTestQuery.graphql'

describe('<ProjectHeader />', () => {
  let environment
  let TestComponent
  const defaultMockResolvers = {
    Project: () => ({
      id: 'UHJvamVjdDpwcm9qZWN0Rm9vZA==',
      title: 'Food project',
      url: 'https://127.0.0.1/project/food-project/questionnaire/questionnaire-food',
      hasParticipativeStep: true,
      cover: {
        url: 'https://127.0.0.1/media/default/0001/01/providerReference58.jpg',
        name: 'Media Food',
      },
      authors: [
        {
          id: 'VXNlcjp1c2VyVmluY2VudA==',
          username: 'Vince',
          avatarUrl: 'https://127.0.0.1/media/default/0001/01/providerReference46.jpg',
        },
      ],
      themes: [],
      districts: {
        totalCount: 0,
      },
      steps: [
        {
          id: 'questionnairestepFood1',
        },
      ],
    }),
  }
  const query = graphql`
    query ProjectHeaderTestQuery($id: ID = "<default>", $count: Int, $cursor: String) @relay_test_operation {
      project: node(id: $id) {
        ...ProjectHeader_project @arguments(count: $count, cursor: $cursor)
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
      const data = useLazyLoadQuery<ProjectHeaderTestQuery>(query, {})
      if (!data.project) return null
      return <ProjectHeader project={data.project} {...props} platformLocale="fr-FR" />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment} useCapUIProvider>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  it('should render correctly', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent />)
    expect(wrapper).toMatchSnapshot()
  })
})
