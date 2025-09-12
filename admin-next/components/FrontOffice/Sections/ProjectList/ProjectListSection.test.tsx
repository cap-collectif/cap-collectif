/* eslint-env jest */
import { render } from '@testing-library/react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { MockPayloadGenerator, createMockEnvironment } from 'relay-test-utils'
import { RelaySuspensFragmentTest } from 'tests/testUtils'
import ProjectListSection from './ProjectListSection'
import { ProjectListSectionTestQuery } from '@relay/ProjectListSectionTestQuery.graphql'

describe('<ProjectListSection />', () => {
  let environment: any
  let TestModalConfirmationDelete: any

  const query = graphql`
    query ProjectListSectionTestQuery @relay_test_operation {
      ...ProjectListSection_query
    }
  `

  const defaultMockResolvers = {
    Query: () => ({
      projects: {
        totalCount: 1,
        edges: [{ node: { id: 'project1', externalLink: 'site.com/BPH', title: 'BPH' } }],
      },
    }),
  }

  beforeEach(() => {
    environment = createMockEnvironment()
    const queryVariables = {}

    const TestRenderer = ({ queryVariables: variables }) => {
      const data = useLazyLoadQuery<ProjectListSectionTestQuery>(query, variables)

      if (data) {
        return <ProjectListSection query={data} />
      }

      return null
    }

    TestModalConfirmationDelete = () => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    )
  })

  it('should render correctly', () => {
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
    const { asFragment } = render(<TestModalConfirmationDelete />)
    expect(asFragment()).toMatchSnapshot()
  })
})
