/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { RelaySuspensFragmentTest, enableFeatureFlags, disableFeatureFlags } from '~/testUtils'
import type { ProjectAdminParticipantTestQuery } from '~relay/ProjectAdminParticipantTestQuery.graphql'
import type { OwnProps } from './ProjectAdminParticipant'
import ProjectAdminParticipant from './ProjectAdminParticipant'

describe('<ProjectAdminParticipant />', () => {
  let environment
  let testComponentTree
  let TestComponent
  const defaultMockResolvers = {
    User: () => ({
      lastLogin: '2021-04-02 10:15:34',
    }),
  }
  const query = graphql`
    query ProjectAdminParticipantTestQuery($id: ID = "<default>") @relay_test_operation {
      participant: node(id: $id) {
        ...ProjectAdminParticipant_participant @arguments(viewerIsAdmin: true)
      }
    }
  `
  afterEach(() => {
    disableFeatureFlags()
  })
  beforeEach(() => {
    environment = createMockEnvironment()

    const TestRenderer = (props: OwnProps) => {
      const data = useLazyLoadQuery<ProjectAdminParticipantTestQuery>(query, {})
      if (!data.participant) return null
      return <ProjectAdminParticipant participant={data.participant} {...props} />
    }

    TestComponent = (props: OwnProps) => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  it('should render a non-selectable list when "beta__emailing" is disabled', async () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent rowId="1" selected={false} />)
    expect(testComponentTree).toMatchSnapshot()
    expect(testComponentTree.root.findAllByType('input').length).toBe(0)
  })
  it('should render a selectable list when "beta__emailing" is enabled', async () => {
    enableFeatureFlags(['beta__emailing'])
    testComponentTree = ReactTestRenderer.create(<TestComponent rowId="1" selected={false} />)
    expect(testComponentTree).toMatchSnapshot()
    expect(testComponentTree.root.findAllByType('input').length).toBe(1)
  })
})
