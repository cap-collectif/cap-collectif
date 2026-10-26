/* eslint-env jest */

import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useFragment } from 'react-relay'
import CookieMonster from '@shared/utils/CookieMonster'
import AddProposalSmsVoteMutation from '@mutations/AddProposalSmsVoteMutation'
import AddProposalVoteMutation from '@mutations/AddProposalVoteMutation'
import RemoveProposalSmsVoteMutation from '@mutations/RemoveProposalSmsVoteMutation'
import VoteButton from './VoteButton'

jest.mock('@cap-collectif/ui', () => ({
  Button: ({ children, isLoading, onClick, ...props }) => (
    <button onClick={onClick} data-loading={isLoading} {...props}>
      {children}
    </button>
  ),
  Icon: () => null,
  Tag: ({ children }) => <div>{children}</div>,
  Text: ({ children }) => <span>{children}</span>,
  Tooltip: ({ children }) => <>{children}</>,
  CapUIIcon: { ThumbUp: 'ThumbUp' },
  CapUIFontWeight: { Semibold: 'Semibold' },
}))
jest.mock('react-intl', () => ({ useIntl: () => ({ formatMessage: ({ id }) => id }) }))
jest.mock('react-relay', () => ({ graphql: jest.fn(), useFragment: jest.fn() }))
jest.mock('@components/BackOffice/AppProvider/App.context', () => ({ useAppContext: () => ({ viewerSession: null }) }))
jest.mock('@mutations/AddProposalVoteMutation', () => ({ __esModule: true, default: { commit: jest.fn() } }))
jest.mock('@mutations/AddProposalSmsVoteMutation', () => ({ __esModule: true, default: { commit: jest.fn() } }))
jest.mock('@mutations/RemoveProposalSmsVoteMutation', () => ({ __esModule: true, default: { commit: jest.fn() } }))
jest.mock('@shared/utils/CookieMonster', () => ({
  __esModule: true,
  default: { addParticipantCookie: jest.fn(), getParticipantCookie: jest.fn() },
}))
jest.mock('@shared/utils/toasts', () => ({ mutationErrorToast: jest.fn() }))

describe('VoteButton', () => {
  it('votes through the participant mutation when the viewer is anonymous', async () => {
    const dispatchEvent = jest.spyOn(window, 'dispatchEvent')
    const step = {
      id: 'step-id',
      votesMin: null,
      votesLimit: null,
      viewerVotes: { totalCount: 0, creditsLeft: null },
      actionButtonLabel: null,
      canDisplayBallot: false,
      open: true,
    }
    const proposal = {
      id: 'proposal-id',
      estimation: null,
      viewerHasVote: false,
      viewerVote: null,
      votes: { totalCount: 0 },
      paperVotesTotalCount: 0,
    }
    ;(useFragment as jest.Mock).mockImplementation(() =>
      (useFragment as jest.Mock).mock.calls.length % 2 ? step : proposal,
    )
    ;(AddProposalSmsVoteMutation.commit as jest.Mock).mockResolvedValue({
      addProposalSmsVote: {
        errorCode: null,
        participantToken: 'participant-token',
        vote: { id: 'vote-id', completionStatus: 'COMPLETED' },
      },
    })
    ;(RemoveProposalSmsVoteMutation.commit as jest.Mock).mockResolvedValue({
      removeProposalSmsVote: { errorCode: null },
    })
    ;(CookieMonster.getParticipantCookie as jest.Mock)
      .mockReturnValueOnce(undefined)
      .mockReturnValue('participant-token')

    render(<VoteButton proposal={{} as any} step={{} as any} triggerRequirementModal={jest.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'global.add' }))

    await waitFor(() =>
      expect(AddProposalSmsVoteMutation.commit).toHaveBeenCalledWith({
        input: { proposalId: 'proposal-id', stepId: 'step-id', token: undefined },
        stepId: 'step-id',
      }),
    )

    expect(AddProposalVoteMutation.commit).not.toHaveBeenCalled()
    expect(CookieMonster.addParticipantCookie).toHaveBeenCalledWith('participant-token')
    expect(dispatchEvent).not.toHaveBeenCalled()

    fireEvent.click(await screen.findByRole('button', { name: 'global.delete' }))

    await waitFor(() =>
      expect(RemoveProposalSmsVoteMutation.commit).toHaveBeenCalledWith({
        input: { proposalId: 'proposal-id', stepId: 'step-id', token: 'participant-token' },
        stepId: 'step-id',
      }),
    )
    await screen.findByRole('button', { name: 'global.add' })
  })

  it('restores a participant vote from the step votes', () => {
    const step = {
      id: 'step-id',
      votesMin: null,
      votesLimit: null,
      viewerVotes: {
        totalCount: 1,
        creditsLeft: null,
        edges: [{ node: { id: 'vote-id', completionStatus: 'COMPLETED', proposal: { id: 'proposal-id' } } }],
      },
      actionButtonLabel: null,
      canDisplayBallot: false,
      open: true,
    }
    const proposal = {
      id: 'proposal-id',
      estimation: null,
      viewerHasVote: false,
      viewerVote: null,
      votes: { totalCount: 1 },
      paperVotesTotalCount: 0,
    }
    ;(useFragment as jest.Mock).mockImplementation(() =>
      (useFragment as jest.Mock).mock.calls.length % 2 ? step : proposal,
    )

    render(<VoteButton proposal={{} as any} step={{} as any} triggerRequirementModal={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'global.delete' })).toBeTruthy()
  })

  it('locks the button while the mutation is pending', async () => {
    const step = {
      id: 'step-id',
      votesMin: null,
      votesLimit: 2,
      viewerVotes: { totalCount: 0, creditsLeft: null },
      actionButtonLabel: null,
      canDisplayBallot: true,
      open: true,
    }
    const proposal = {
      id: 'proposal-id',
      estimation: null,
      viewerHasVote: false,
      viewerVote: null,
      votes: { totalCount: 0 },
      paperVotesTotalCount: 0,
    }
    let rejectMutation: (error: Error) => void
    ;(useFragment as jest.Mock).mockImplementation(() =>
      (useFragment as jest.Mock).mock.calls.length % 2 ? step : proposal,
    )
    ;(AddProposalSmsVoteMutation.commit as jest.Mock).mockReturnValue(
      new Promise((_, reject) => {
        rejectMutation = reject
      }),
    )

    render(<VoteButton proposal={{} as any} step={{} as any} triggerRequirementModal={jest.fn()} />)
    const button = screen.getByRole('button', { name: 'global.add' })
    fireEvent.click(button)

    expect(button.disabled).toBe(true)
    expect(button.getAttribute('data-loading')).toBe('true')

    await act(async () => rejectMutation(new Error('network error')))
    expect(screen.getByRole('button').textContent).toBe('0')
    expect(screen.getByRole('button').disabled).toBe(false)
  })
})
