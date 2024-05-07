import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import MockProviders, { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import VotesList from './VotesList'

describe('<VotesList />', () => {
  let environment: any
  let testComponentTree: any
  let TestVotesList: any

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = ({ showImages }) => {
      return <VotesList stepId="<default>" showImages={showImages} />
    }

    TestVotesList = ({ showImages }) => (
      <RelaySuspensFragmentTest environment={environment}>
        <MockProviders useCapUIProvider>
          <TestRenderer showImages={showImages} />
        </MockProviders>
      </RelaySuspensFragmentTest>
    )
  })

  beforeEach(() => clearSupportForPortals())

  describe('<TestVotesList />', () => {
    it('should render correctly', () => {
      environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation))
      testComponentTree = ReactTestRenderer.create(<TestVotesList showImages />)
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
