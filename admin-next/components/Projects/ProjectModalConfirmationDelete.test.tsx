/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'
import ProjectModalConfirmationDelete from './ProjectModalConfirmationDelete'
import type { ProjectModalConfirmationDeleteTestQuery } from '@relay/ProjectModalConfirmationDeleteTestQuery.graphql'
import { Menu } from '@cap-collectif/ui'

describe('<ProjectModalConfirmationDelete />', () => {
  let environment: any
  let testComponentTree: any
  let TestModalConfirmationDelete: any

  const query = graphql`
    query ProjectModalConfirmationDeleteTestQuery($id: ID = "<default>") @relay_test_operation {
      project: node(id: $id) {
        ...ProjectModalConfirmationDelete_project
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
  }

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    const queryVariables = {}

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<ProjectModalConfirmationDeleteTestQuery>(query, variables)

      if (data?.project) {
        return <ProjectModalConfirmationDelete project={data?.project} {...componentProps} />
      }

      return null
    }

    TestModalConfirmationDelete = componentProps => (
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

  describe('<TestModalConfirmationDelete />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestModalConfirmationDelete connectionName="client:VXNlcjp1c2VyMQ==:__ProjectList_projects_connection" />,
      )
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
