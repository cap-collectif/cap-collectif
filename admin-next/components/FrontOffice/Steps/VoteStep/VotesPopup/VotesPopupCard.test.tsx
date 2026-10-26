import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useFragment } from 'react-relay'
import RemoveProposalSmsVoteMutation from '@mutations/RemoveProposalSmsVoteMutation'
import RemoveProposalVoteMutation from '@mutations/RemoveProposalVoteMutation'
import CookieMonster from '@shared/utils/CookieMonster'
import VotesPopupCard from './VotesPopupCard'

jest.mock('@cap-collectif/ui', () => ({
  Button: ({ children, onClick, isLoading, ...props }) => (
    <button onClick={onClick} data-loading={isLoading} {...props}>
      {children}
    </button>
  ),
  Card: ({ children }) => <div>{children}</div>,
  CardContent: () => null,
  CardCover: ({ children }) => <div>{children}</div>,
  CardCoverImage: () => null,
  CardCoverPlaceholder: () => null,
  Flex: ({ children }) => <div>{children}</div>,
  Icon: () => null,
  useTheme: () => ({ colors: { danger: { base: 'red' } } }),
  CapUIIcon: { TrashO: 'TrashO' },
}))
jest.mock('react-relay', () => ({ graphql: jest.fn(), useFragment: jest.fn() }))
jest.mock('./VotesPopupCardRanking', () => () => null)
jest.mock('@components/BackOffice/AppProvider/App.context', () => ({ useAppContext: jest.fn() }))
jest.mock('@mutations/RemoveProposalVoteMutation', () => ({ __esModule: true, default: { commit: jest.fn() } }))
jest.mock('@mutations/RemoveProposalSmsVoteMutation', () => ({ __esModule: true, default: { commit: jest.fn() } }))
jest.mock('@shared/utils/CookieMonster', () => ({ __esModule: true, default: { getParticipantCookie: jest.fn() } }))

const step = { id: 'step-id', votesRanking: false }
const vote = {
  id: 'vote-id',
  proposal: { id: 'proposal-id', title: 'A proposal', estimation: null, media: null, category: null, form: null },
}

describe('VotesPopupCard', () => {
  beforeEach(() => {
    ;(useFragment as jest.Mock).mockImplementation(() =>
      (useFragment as jest.Mock).mock.calls.length % 2 ? vote : step,
    )
    ;(RemoveProposalVoteMutation.commit as jest.Mock).mockResolvedValue({})
    ;(RemoveProposalSmsVoteMutation.commit as jest.Mock).mockResolvedValue({})
  })

  it('removes a participant vote through the SMS mutation', async () => {
    const { useAppContext } = jest.requireMock('@components/BackOffice/AppProvider/App.context')
    useAppContext.mockReturnValue({ viewerSession: null })
    ;(CookieMonster.getParticipantCookie as jest.Mock).mockReturnValue('participant-token')

    render(<VotesPopupCard step={{} as any} vote={{} as any} />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() =>
      expect(RemoveProposalSmsVoteMutation.commit).toHaveBeenCalledWith(
        {
          input: { proposalId: 'proposal-id', stepId: 'step-id', token: 'participant-token' },
          stepId: 'step-id',
        },
        false,
      ),
    )
    expect(RemoveProposalVoteMutation.commit).not.toHaveBeenCalled()
  })

  it('removes an authenticated vote through the standard mutation', async () => {
    const { useAppContext } = jest.requireMock('@components/BackOffice/AppProvider/App.context')
    useAppContext.mockReturnValue({ viewerSession: { id: 'user-id' } })

    render(<VotesPopupCard step={{} as any} vote={{} as any} />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() =>
      expect(RemoveProposalVoteMutation.commit).toHaveBeenCalledWith(
        { input: { proposalId: 'proposal-id', stepId: 'step-id' }, stepId: 'step-id' },
        { proposalId: 'proposal-id', stepId: 'step-id', voteId: 'vote-id' },
        false,
      ),
    )
    expect(RemoveProposalSmsVoteMutation.commit).not.toHaveBeenCalled()
  })

  it('locks the removal while the mutation is pending', async () => {
    const { useAppContext } = jest.requireMock('@components/BackOffice/AppProvider/App.context')
    useAppContext.mockReturnValue({ viewerSession: { id: 'user-id' } })
    let resolveMutation: () => void
    ;(RemoveProposalVoteMutation.commit as jest.Mock).mockReturnValue(
      new Promise<void>(resolve => {
        resolveMutation = resolve
      }),
    )

    render(<VotesPopupCard step={{} as any} vote={{} as any} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)

    expect(RemoveProposalVoteMutation.commit).toHaveBeenCalledTimes(1)
    expect(button.disabled).toBe(true)
    expect(button.getAttribute('data-loading')).toBe('true')

    resolveMutation!()
    await waitFor(() => expect(button.disabled).toBe(false))
  })
})
