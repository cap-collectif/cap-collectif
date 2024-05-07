import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import MockProviders, { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import ProposalsList from './ProposalsList'
import { VoteStepContext } from '~/components/VoteStep/Context/VoteStepContext'

describe('<ProposalsList />', () => {
  let environment: any
  let testComponentTree: any
  let TestProposalsList: any
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = ({ showImages }) => <ProposalsList stepId="<default>" showImages={showImages} />

    const setFilters = jest.fn()
    const setView = jest.fn()

    TestProposalsList = ({ showImages }) => (
      <RelaySuspensFragmentTest environment={environment}>
        <MockProviders useCapUIProvider>
          <VoteStepContext.Provider
            value={{
              filters: {
                sort: null,
                userType: null,
                theme: null,
                category: null,
                district: null,
                status: null,
                latlng: null,
                term: null,
                latlngBounds: null,
                address: null,
              },
              view: 'map',
              setFilters,
              setView,
            }}
          >
            <TestRenderer showImages={showImages} />
          </VoteStepContext.Provider>
        </MockProviders>
      </RelaySuspensFragmentTest>
    )
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  describe('<TestProposalsList />', () => {
    it('should render correctly without images', () => {
      environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation))
      testComponentTree = ReactTestRenderer.create(<TestProposalsList />)
      expect(testComponentTree).toMatchSnapshot()
    })
    it('should render correctly with images', () => {
      environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation))
      testComponentTree = ReactTestRenderer.create(<TestProposalsList showImages />)
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
