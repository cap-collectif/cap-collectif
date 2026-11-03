import { CapUIProvider } from '@cap-collectif/ui'
import * as React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { RelayEnvironmentProvider, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import type { OperationDescriptor } from 'relay-runtime'
import query, { VoteStepWebLayoutQuery } from '@relay/VoteStepWebLayoutQuery.graphql'
import VoteStepProposalsList from './VoteStepProposalsList'

jest.mock('nuqs', () => ({ useQueryState: () => [null] }))
jest.mock(
  '@components/FrontOffice/ProposalCard/ProposalCard',
  () =>
    function ProposalCard({ proposal }) {
      return <div>{proposal.id}</div>
    },
)
jest.mock('./VoteStepEmptyList', () => () => null)

const variables = { id: 'step', stepId: 'step', count: 50, isAuthenticated: false, term: 'park' }

function List() {
  const { node } = useLazyLoadQuery<VoteStepWebLayoutQuery>(query, variables)
  if (!node) return null

  return (
    <VoteStepProposalsList
      step={node}
      templateColumns={{ base: '1fr', tablet: '1fr', desktop: '1fr' }}
      triggerRequirementModal={jest.fn()}
      selectedId="proposal-1"
      onSelectedIdChange={jest.fn()}
    />
  )
}

function proposalPage(
  operation: OperationDescriptor,
  stepType: string,
  start: number,
  end: number,
  hasNextPage: boolean,
) {
  return MockPayloadGenerator.generate(operation, {
    Query: () => ({
      node: {
        id: 'step',
        __typename: stepType,
        proposals: {
          pageInfo: { endCursor: String(end), hasNextPage },
          edges: Array.from({ length: end - start + 1 }, (_, index) => ({
            cursor: String(start + index),
            node: { id: `proposal-${start + index}` },
          })),
        },
      },
    }),
  })
}

/**
 * @jest-status compliant
 * @jest-reason Exercises scrolling and Relay pagination through the rendered proposal list.
 */
it.each(['CollectStep', 'SelectionStep'])('appends the next page of %s proposals on scroll', async stepType => {
  const environment = createMockEnvironment()
  environment.mock.queueOperationResolver(operation => proposalPage(operation, stepType, 1, 50, true))
  // jsdom has no layout. Give visible elements a scroll parent at the bottom of the viewport.
  const offsetParent = jest.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockImplementation(function () {
    return this.parentElement
  })
  // jsdom does not implement scrollIntoView. Track scrolling to the selected map card.
  const originalScrollIntoView = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView')
  const scrollIntoView = jest.fn()
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView })
  try {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback={null}>
          <CapUIProvider>
            <List />
          </CapUIProvider>
        </React.Suspense>
      </RelayEnvironmentProvider>,
    )
    await screen.findByText('proposal-50')
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(environment.mock.getAllOperations()).toHaveLength(0)
    fireEvent.scroll(window)
    const nextPage = environment.mock.getMostRecentOperation()
    expect(nextPage.request.variables).toMatchObject({ ...variables, cursor: '50' })
    fireEvent.scroll(window)
    expect(environment.mock.getAllOperations()).toHaveLength(1)
    act(() => environment.mock.resolve(nextPage, proposalPage(nextPage, stepType, 51, 100, false)))

    await screen.findByText('proposal-100')
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(screen.getByText('proposal-1')).toBeDefined()
    fireEvent.scroll(window)
    expect(environment.mock.getAllOperations()).toHaveLength(0)
  } finally {
    if (originalScrollIntoView) Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalScrollIntoView)
    else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
    offsetParent.mockRestore()
  }
})
