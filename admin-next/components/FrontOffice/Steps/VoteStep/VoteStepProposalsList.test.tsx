import React from 'react'
import { render, screen } from '@testing-library/react'
import { usePaginationFragment } from 'react-relay'
import VoteStepProposalsList from './VoteStepProposalsList'

jest.mock('@cap-collectif/ui', () => ({ Box: ({ children }) => <div>{children}</div>, Grid: ({ children }) => <div>{children}</div> }))
jest.mock('react-relay', () => ({ graphql: jest.fn(), usePaginationFragment: jest.fn() }))
jest.mock('nuqs', () => ({ useQueryState: jest.fn(() => [null]) }))
jest.mock('@shared/projectCard/ProjectsListSkeleton', () => () => <div data-testid="proposals-skeleton" />)
jest.mock('@components/FrontOffice/ProposalCard/ProposalCard', () => ({ proposal }) => (
  <div data-testid="proposal-card">{proposal.id}</div>
))
jest.mock('./VoteStepEmptyList', () => () => <div data-testid="empty-list" />)

describe('VoteStepProposalsList', () => {
  it('keeps the list skeleton while the proposals connection is unavailable', () => {
    ;(usePaginationFragment as jest.Mock).mockReturnValue({
      data: { __typename: 'CollectStep', mainView: 'GRID', proposals: undefined },
      refetch: jest.fn(),
    })

    render(
      <VoteStepProposalsList
        step={{} as any}
        templateColumns={{ base: '1fr', tablet: 'repeat(2, 1fr)', desktop: 'repeat(3, 1fr)' }}
        triggerRequirementModal={jest.fn()}
      />,
    )

    expect(screen.getByTestId('proposals-skeleton')).toBeTruthy()
    expect(screen.queryByTestId('empty-list')).toBeNull()
  })

  it('reorders the cards when optimistic vote counters change', () => {
    const data = {
      __typename: 'CollectStep',
      mainView: 'GRID',
      defaultSort: 'VOTES',
      form: { objectType: 'PROPOSAL' },
      proposals: {
        edges: [
          { node: { id: 'proposal-a', votes: { totalCount: 1, totalPointsCount: 1 } } },
          { node: { id: 'proposal-b', votes: { totalCount: 2, totalPointsCount: 2 } } },
        ],
      },
    }
    ;(usePaginationFragment as jest.Mock).mockReturnValue({ data, refetch: jest.fn() })

    const { rerender } = render(
      <VoteStepProposalsList
        step={{} as any}
        templateColumns={{ base: '1fr', tablet: 'repeat(2, 1fr)', desktop: 'repeat(3, 1fr)' }}
        triggerRequirementModal={jest.fn()}
      />,
    )

    expect(screen.getAllByTestId('proposal-card').map(card => card.textContent)).toEqual(['proposal-b', 'proposal-a'])

    data.proposals = {
      ...data.proposals,
      edges: [
        { node: { id: 'proposal-a', votes: { totalCount: 3, totalPointsCount: 1 } } },
        data.proposals.edges[1],
      ],
    }
    rerender(
      <VoteStepProposalsList
        step={{} as any}
        templateColumns={{ base: '1fr', tablet: 'repeat(2, 1fr)', desktop: 'repeat(3, 1fr)' }}
        triggerRequirementModal={jest.fn()}
      />,
    )

    expect(screen.getAllByTestId('proposal-card').map(card => card.textContent)).toEqual(['proposal-a', 'proposal-b'])

    const { useQueryState } = jest.requireMock('nuqs')
    useQueryState.mockImplementation((name: string) => [name === 'sort' ? 'points' : null])
    data.proposals = {
      ...data.proposals,
      edges: [
        { node: { id: 'proposal-a', votes: { totalCount: 3, totalPointsCount: 1 } } },
        { node: { id: 'proposal-b', votes: { totalCount: 2, totalPointsCount: 4 } } },
      ],
    }
    rerender(
      <VoteStepProposalsList
        step={{} as any}
        templateColumns={{ base: '1fr', tablet: 'repeat(2, 1fr)', desktop: 'repeat(3, 1fr)' }}
        triggerRequirementModal={jest.fn()}
      />,
    )

    expect(screen.getAllByTestId('proposal-card').map(card => card.textContent)).toEqual(['proposal-b', 'proposal-a'])
  })

})
