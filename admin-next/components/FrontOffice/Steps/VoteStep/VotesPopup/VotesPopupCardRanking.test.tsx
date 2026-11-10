import { Suspense } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { graphql, RelayEnvironmentProvider, useLazyLoadQuery } from 'react-relay'
import { IntlProvider } from 'react-intl'
import { toast } from '@cap-collectif/ui'
import type { ViewerSession } from 'types'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { VotesPopupCardRankingTestQuery } from '@relay/VotesPopupCardRankingTestQuery.graphql'
import { AppContext } from '@components/BackOffice/AppProvider/App.context'
import CookieMonster from '@shared/utils/CookieMonster'
import VotesPopupCardRanking from './VotesPopupCardRanking'

jest.mock('@cap-collectif/ui', () => ({
  Box: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Flex: ({ children }) => <div>{children}</div>,
  Text: ({ children }) => <span>{children}</span>,
  Icon: ({ name }) => <span>{name}</span>,
  CapUIIcon: { ArrowUpO: 'Move up', ArrowDownO: 'Move down' },
  toast: jest.fn(),
}))

const query = graphql`
  query VotesPopupCardRankingTestQuery($stepId: ID!) @relay_test_operation {
    node(id: $stepId) {
      ... on ProposalStep {
        ...VotesPopupCardRanking_step
        rankedViewerVotes: viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
          totalCount
          edges {
            node {
              id
              ...VotesPopupCardRanking_vote
            }
          }
        }
      }
    }
  }
`

const TestRanking = () => {
  const { node } = useLazyLoadQuery<VotesPopupCardRankingTestQuery>(query, { stepId: 'step-id' })
  return (
    <VotesPopupCardRanking
      step={node}
      vote={node.rankedViewerVotes.edges.find(edge => edge.node.id === 'vote-1').node}
    />
  )
}

const viewerSession: ViewerSession = {
  id: 'user-id',
  email: 'user@example.test',
  username: 'User',
  isAdmin: false,
  isSuperAdmin: false,
  isProjectAdmin: false,
  isAdminOrganization: false,
  isOrganizationMember: false,
  isMediator: false,
  organization: null,
}

const renderRanking = (stepType: string, authenticated = false, token: string | undefined = 'participant-token') => {
  jest.spyOn(CookieMonster, 'getParticipantCookie').mockReturnValue(token)
  const environment = createMockEnvironment()
  const step = {
    __typename: stepType,
    id: 'step-id',
    votesLimit: 3,
    votesMin: 1,
    rankedViewerVotes: {
      totalCount: 2,
      edges: [
        { node: { id: 'vote-1', anonymous: false, ranking: 0, proposal: { id: 'proposal-1' } } },
        { node: { id: 'vote-2', anonymous: true, ranking: 1, proposal: { id: 'proposal-2' } } },
      ],
    },
  }
  environment.mock.queueOperationResolver(operation =>
    MockPayloadGenerator.generate(operation, { Query: () => ({ node: step }) }),
  )
  render(
    <IntlProvider locale="fr" messages={{ 'global.error.server.form': 'Unable to save your changes.' }}>
      <AppContext.Provider
        value={{ viewerSession: authenticated ? viewerSession : null, appVersion: '', siteColors: null }}
      >
        <RelayEnvironmentProvider environment={environment}>
          <Suspense fallback="Loading">
            <TestRanking />
          </Suspense>
        </RelayEnvironmentProvider>
      </AppContext.Provider>
    </IntlProvider>,
  )
  return { environment, step }
}

const expectErrorToast = () =>
  expect(toast).toHaveBeenCalledWith({
    variant: 'danger',
    content: 'Unable to save your changes.',
  })

/**
 * @jest-status compliant
 * @jest-reason Exercises ranking clicks, identity, loading and failed mutations with a real Relay environment.
 */
describe.each(['SelectionStep', 'CollectStep'])('vote ranking on %s', stepType => {
  afterEach(() => jest.restoreAllMocks())

  it.each([false, true])('reorders votes with the correct identity when authenticated=%s', async authenticated => {
    const { environment, step } = renderRanking(stepType, authenticated)
    fireEvent.click(await screen.findByRole('button', { name: 'Move down' }))
    const operation = environment.mock.getMostRecentOperation()
    expect(operation.request.node.params.name).toBe(
      authenticated ? 'VotesPopupCardRankingUpdateVotesMutation' : 'VotesPopupCardRankingUpdateAnonymousVotesMutation',
    )
    expect(operation.request.variables).toEqual({
      input: {
        step: 'step-id',
        votes: [
          { id: 'vote-2', anonymous: true },
          { id: 'vote-1', anonymous: false },
        ],
        ...(authenticated ? {} : { token: 'participant-token' }),
      },
      stepId: 'step-id',
    })
    expect(screen.queryByText('+2pts')).not.toBeNull()
    expect((screen.getByRole('button', { name: 'Move up' }) as HTMLButtonElement).disabled).toBe(true)

    const confirmedStep = {
      ...step,
      rankedViewerVotes: {
        totalCount: 2,
        edges: [
          { node: { ...step.rankedViewerVotes.edges[1].node, ranking: 0 } },
          { node: { ...step.rankedViewerVotes.edges[0].node, ranking: 1 } },
        ],
      },
    }
    const field = authenticated ? 'updateProposalVotes' : 'updateAnonymousProposalVotes'
    act(() =>
      environment.mock.resolve(
        operation,
        MockPayloadGenerator.generate(operation, {
          Mutation: () => ({ [field]: { step: confirmedStep } }),
        }),
      ),
    )
    expect(screen.queryByText('+2pts')).not.toBeNull()
    expect((screen.getByRole('button', { name: 'Move up' }) as HTMLButtonElement).disabled).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Move up' }))
    const moveUp = environment.mock.getMostRecentOperation()
    expect(moveUp.request.variables.input.votes).toEqual([
      { id: 'vote-1', anonymous: false },
      { id: 'vote-2', anonymous: true },
    ])
    act(() =>
      environment.mock.resolve(
        moveUp,
        MockPayloadGenerator.generate(moveUp, { Mutation: () => ({ [field]: { step } }) }),
      ),
    )
    expect(screen.queryByText('+3pts')).not.toBeNull()
    expect((screen.getByRole('button', { name: 'Move up' }) as HTMLButtonElement).disabled).toBe(true)
    expect(toast).not.toHaveBeenCalled()
  })

  it('does not submit a ranking when the participant token is missing', async () => {
    const { environment } = renderRanking(stepType, false, '')
    fireEvent.click(await screen.findByRole('button', { name: 'Move down' }))
    expect(environment.mock.getAllOperations()).toHaveLength(0)
    expect(screen.queryByText('+3pts')).not.toBeNull()
    expectErrorToast()
  })

  it.each(['network', 'graphql'])('restores the ranking and reports a %s failure', async failure => {
    const { environment } = renderRanking(stepType)
    fireEvent.click(await screen.findByRole('button', { name: 'Move down' }))
    expect(screen.queryByText('+2pts')).not.toBeNull()
    const operation = environment.mock.getMostRecentOperation()
    act(() => {
      if (failure === 'network') {
        environment.mock.reject(operation, new Error('Network unavailable'))
      } else {
        environment.mock.resolve(operation, {
          data: { updateAnonymousProposalVotes: null },
          errors: [{ message: 'Access denied to this field.' }],
        })
      }
    })
    expect(screen.queryByText('+3pts')).not.toBeNull()
    expect((screen.getByRole('button', { name: 'Move down' }) as HTMLButtonElement).disabled).toBe(false)
    expectErrorToast()
  })
})
