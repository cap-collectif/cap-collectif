import { render, screen } from '@testing-library/react'
import { useFragment } from 'react-relay'
import VotesPopup from './VotesPopup'

jest.mock('@cap-collectif/ui', () => ({
  Box: ({ children }) => <div>{children}</div>,
  Flex: ({ children }) => <div>{children}</div>,
  CapUIFontSize: { BodyLarge: 'BodyLarge' },
}))
jest.mock('react-relay', () => ({ graphql: jest.fn(), useFragment: jest.fn() }))
jest.mock('react-intl', () => ({ useIntl: () => ({ formatMessage: ({ id }) => id }) }))
jest.mock('@shared/constants/proposalStepObjectType', () => ({ getContributionObjectTypeTranslationKey: () => 'proposal' }))
jest.mock('./VotesPopupCard', () => ({
  __esModule: true,
  default: function MockVotesPopupCard({ vote }) {
    return <div>{vote.id}</div>
  },
}))

const defaultViewerVotes = { edges: [{ node: { id: 'default-vote', ranking: 0, proposal: { id: 'proposal-1' } } }] }
const rankedViewerVotes = { edges: [{ node: { id: 'ranked-vote', ranking: 0, proposal: { id: 'proposal-1' } } }] }

describe('VotesPopup', () => {
  it('uses the position-ordered connection for ranked votes only', () => {
    ;(useFragment as jest.Mock).mockReturnValue({
      actionButtonLabel: 'VOTE',
      form: { objectType: 'PROPOSAL' },
      votesRanking: true,
      defaultViewerVotes,
      rankedViewerVotes,
    })

    render(<VotesPopup step={{} as any} />)

    expect(screen.getByText('ranked-vote')).toBeTruthy()
    expect(screen.queryByText('default-vote')).toBeNull()
  })

  it('keeps the default connection for non-ranked votes', () => {
    ;(useFragment as jest.Mock).mockReturnValue({
      actionButtonLabel: 'VOTE',
      form: { objectType: 'PROPOSAL' },
      votesRanking: false,
      defaultViewerVotes,
      rankedViewerVotes,
    })

    render(<VotesPopup step={{} as any} />)

    expect(screen.getByText('default-vote')).toBeTruthy()
    expect(screen.queryByText('ranked-vote')).toBeNull()
  })
})
