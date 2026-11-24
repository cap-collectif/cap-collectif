/* eslint-env jest */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { useFragment } from 'react-relay'
import VoteButton from './VoteButton'

jest.mock('@cap-collectif/ui', () => {
  const { createElement } = jest.requireActual('react')
  // Renders a plain element, keeping only what the assertions rely on: role, ARIA attributes and inline style
  const passThrough =
    (tag: string) =>
    ({ children, role, style, ...props }) =>
      createElement(
        tag,
        { role, style, ...Object.fromEntries(Object.entries(props).filter(([key]) => key.startsWith('aria-'))) },
        children,
      )

  return {
    Box: passThrough('div'),
    Flex: passThrough('div'),
    Text: passThrough('span'),
    Tag: passThrough('div'),
    Button: passThrough('button'),
    Icon: () => null,
    Tooltip: ({ children }) => children,
    CapUIIcon: { ThumbUp: 'THUMB_UP', Pen: 'PEN', Check: 'CHECK', Cross: 'CROSS' },
    CapUIIconSize: { Md: 'md' },
    CapUIFontSize: { BodyRegular: 'BodyRegular' },
    CapUIFontWeight: { Semibold: 'Semibold' },
    CapUILineHeight: { M: 'M' },
  }
})
jest.mock('react-intl', () => ({
  useIntl: () => ({ formatMessage: ({ id }) => id, formatNumber: (value: number) => String(value) }),
}))
jest.mock('react-relay', () => ({ graphql: jest.fn(), useFragment: jest.fn() }))
jest.mock('@components/BackOffice/AppProvider/App.context', () => ({ useAppContext: () => ({ viewerSession: null }) }))
jest.mock('@mutations/AddProposalVoteMutation', () => ({ __esModule: true, default: { commit: jest.fn() } }))
jest.mock('@mutations/AddProposalSmsVoteMutation', () => ({ __esModule: true, default: { commit: jest.fn() } }))
jest.mock('@mutations/RemoveProposalVoteMutation', () => ({ __esModule: true, default: { commit: jest.fn() } }))
jest.mock('@mutations/RemoveProposalSmsVoteMutation', () => ({ __esModule: true, default: { commit: jest.fn() } }))
jest.mock('@shared/utils/CookieMonster', () => ({
  __esModule: true,
  default: { addParticipantCookie: jest.fn(), getParticipantCookie: jest.fn() },
}))
jest.mock('@shared/utils/toasts', () => ({ mutationErrorToast: jest.fn(), dangerToast: jest.fn() }))

const thresholdStep = {
  id: 'step-id',
  votesMin: null,
  votesLimit: null,
  viewerVotes: { totalCount: 0, creditsLeft: null, edges: [] },
  actionButtonLabel: 'SIGN',
  voteButtonIcon: 'PEN',
  voteThreshold: 150000,
  proposalArchivedTime: 6,
  canDisplayBallot: true,
  open: true,
  state: 'OPENED',
}

const openProposal = {
  id: 'proposal-id',
  estimation: null,
  viewerHasVote: false,
  viewerVote: null,
  votes: { totalCount: 15000 },
  paperVotesTotalCount: 470,
  isArchived: false,
  archiveLimitDate: '2999-01-01 00:00:00',
}

const renderVoteButton = (step: Record<string, unknown>, proposal: Record<string, unknown>) => {
  // The component reads the step fragment first, then the proposal fragment
  ;(useFragment as jest.Mock).mockImplementation(() =>
    (useFragment as jest.Mock).mock.calls.length % 2 ? step : proposal,
  )

  return render(<VoteButton proposal={{} as any} step={{} as any} triggerRequirementModal={jest.fn()} />)
}

describe('VoteButton in a step with a vote threshold', () => {
  it('shows the gauge next to a labelled toggle button while the proposal can be signed', () => {
    renderVoteButton(thresholdStep, openProposal)

    const gauge = screen.getByRole('progressbar')
    expect(gauge.getAttribute('aria-valuenow')).toBe('10')
    expect(gauge.getAttribute('aria-valuetext')).toBe('front.proposal.vote-threshold.progress-label')
    expect(gauge.textContent).toBe('')
    expect(screen.getByText('15470')).toBeTruthy()

    const button = screen.getByRole('button', { name: 'global.sign.for' })
    expect(button.getAttribute('aria-pressed')).toBe('false')
  })

  it('marks the button as pressed and renames it once the viewer has signed', () => {
    renderVoteButton(
      {
        ...thresholdStep,
        viewerVotes: {
          totalCount: 1,
          creditsLeft: null,
          edges: [{ node: { id: 'vote-id', completionStatus: 'COMPLETED', proposal: { id: 'proposal-id' } } }],
        },
      },
      openProposal,
    )

    expect(screen.getByRole('button', { name: 'front.proposal.signed' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('keeps the gauge full and the button once the threshold is exceeded before the deadline', () => {
    renderVoteButton(thresholdStep, { ...openProposal, votes: { totalCount: 1 }, paperVotesTotalCount: 198229 })

    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
    expect(screen.getByText('198230')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'global.sign.for' })).toBeTruthy()
    expect(screen.queryByText('front.proposal.vote-threshold.reached')).toBeNull()
  })

  it('makes the first signature visible and leaves the gauge empty without any', () => {
    const { container, unmount } = renderVoteButton(thresholdStep, {
      ...openProposal,
      votes: { totalCount: 1 },
      paperVotesTotalCount: 0,
    })
    const fill = container.querySelector('[role="progressbar"] > div') as HTMLElement
    expect(fill.style.width).toBe('0%')
    expect(fill.style.minWidth).toBe('4px')
    unmount()

    const { container: emptyContainer } = renderVoteButton(thresholdStep, {
      ...openProposal,
      votes: { totalCount: 0 },
      paperVotesTotalCount: 0,
    })
    const emptyFill = emptyContainer.querySelector('[role="progressbar"] > div') as HTMLElement
    expect(emptyFill.style.minWidth).toBe('0')
  })

  it('replaces the gauge and the button with the reached outcome once the deadline has passed', () => {
    renderVoteButton(thresholdStep, {
      ...openProposal,
      votes: { totalCount: 0 },
      paperVotesTotalCount: 198230,
      archiveLimitDate: '2020-01-01 00:00:00',
    })

    expect(screen.getByText('front.proposal.vote-threshold.reached')).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('tells an archived proposal did not reach the threshold', () => {
    renderVoteButton(thresholdStep, { ...openProposal, isArchived: true })

    expect(screen.getByText('front.proposal.vote-threshold.not-reached')).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('shows the outcome of every proposal once the step is closed', () => {
    renderVoteButton({ ...thresholdStep, open: false, state: 'CLOSED', proposalArchivedTime: 0 }, openProposal)

    expect(screen.getByText('front.proposal.vote-threshold.not-reached')).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('shows the button alone while the secret ballot result is not published', () => {
    renderVoteButton({ ...thresholdStep, canDisplayBallot: false }, openProposal)

    expect(screen.getByRole('button', { name: 'global.sign.for' })).toBeTruthy()
    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(screen.queryByText('15470')).toBeNull()
  })

  it('reveals nothing about a closed proposal while the secret ballot result is not published', () => {
    const { container } = renderVoteButton(
      { ...thresholdStep, canDisplayBallot: false },
      { ...openProposal, isArchived: true },
    )

    expect(container.textContent).toBe('')
  })
})

describe('VoteButton in a step without vote threshold', () => {
  it('shows the vote count instead of the button for an archived proposal', () => {
    renderVoteButton(
      { ...thresholdStep, voteThreshold: null, proposalArchivedTime: 0 },
      { ...openProposal, isArchived: true },
    )

    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('15470')).toBeTruthy()
  })
})
