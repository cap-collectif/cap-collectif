/* eslint-env jest */
import { render } from '@testing-library/react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import ProjectModalExportSteps from './ProjectModalExportSteps'
import type { ProjectModalExportStepsTestQuery } from '@relay/ProjectModalExportStepsTestQuery.graphql'
import { Menu } from '@cap-collectif/ui'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'

describe('<ProjectModalExportSteps />', () => {
  let environment: any
  let TestProjectModalExportSteps: any

  const query = graphql`
    query ProjectModalExportStepsTestQuery($id: ID = "<default>") @relay_test_operation {
      project: node(id: $id) {
        ...ProjectModalExportSteps_project
      }
    }
  `

  const defaultMockResolvers = {
    Project: () => ({
      id: 'UHJvamVjdDpwcm9qZWN0SWRmMw==',
      title: 'Budget Participatif IdF 3',
      contributions: {
        totalCount: 5,
      },
    }),
    viewer: () => ({
      isAdmin: true,
      isOnlyProjectAdmin: false,
      organizations: null,
    }),
  }

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    const queryVariables = {}

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<ProjectModalExportStepsTestQuery>(query, variables)

      if (data?.project) {
        return <ProjectModalExportSteps project={data?.project} {...componentProps} />
      }

      return null
    }

    TestProjectModalExportSteps = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <Menu disclosure={<button>disclosure</button>}>
          <Menu.List>
            <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
          </Menu.List>
        </Menu>
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  describe('<TestProjectModalExportSteps />', () => {
    it('should render correctly', () => {
      const { asFragment } = render(<TestProjectModalExportSteps />)
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
