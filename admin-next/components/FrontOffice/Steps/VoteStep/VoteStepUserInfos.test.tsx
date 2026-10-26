/* eslint-env jest */

import React from 'react'
import { render } from '@testing-library/react'
import { useFragment } from 'react-relay'
import VoteStepUserInfos from './VoteStepUserInfos'

const formatMessage = jest.fn(({ id }) => id)

jest.mock('@cap-collectif/ui', () => ({
  Box: ({ children }) => <div>{children}</div>,
  Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
  CircularStep: () => <div />,
  Flex: ({ children }) => <div>{children}</div>,
  Heading: ({ children }) => <h2>{children}</h2>,
  Icon: () => <div />,
  Modal: ({ children }) => <div>{typeof children === 'function' ? children({ hide: jest.fn() }) : children}</div>,
  CapUIFontSize: { BodyLarge: 'bodyLarge' },
  CapUIFontWeight: { Semibold: 'semibold' },
  CapUIIcon: { Bag: 'bag', ThumbUp: 'thumbUp', ArrowUpO: 'up', ArrowDownO: 'down', Info: 'info' },
  CapUIIconSize: { Lg: 'lg', Xl: 'xl' },
  CapUIModalSize: { Md: 'md' },
  useTheme: () => ({ colors: { text: { secondary: 'secondary' } } }),
}))

jest.mock('react-intl', () => ({ useIntl: () => ({ formatMessage }) }))
jest.mock('react-relay', () => ({ graphql: jest.fn(), useFragment: jest.fn() }))
jest.mock('@shared/hooks/useIsMobile', () => () => false)
jest.mock('@liinkiing/react-hooks', () => ({ useMatchMedia: () => false }))
jest.mock('./VotesPopup/VotesPopup', () => {
  function VotesPopup() {
    return <div />
  }

  return VotesPopup
})
jest.mock('@shared/form/WYSIWYGRender', () => {
  function WYSIWYGRender() {
    return <div />
  }

  return WYSIWYGRender
})

type TestCase = {
  name: string
  voteTypes: string[]
  votes: number
  votesMin?: number | null
  votesLimit?: number | null
  budget?: number | null
  estimation?: number
  voteThreshold?: number | null
  title: string
  titleN?: number
  desc?: string
  descN?: number
}

const getTitleTranslationKey = (title: string) =>
  title === 'proposals' || title === 'proposal-number'
    ? `front.contribution.proposal.votes.title.${title}`
    : `proposal.step.user.votes.infos.title.${title}`

const getDescTranslationKey = (desc: string) =>
  desc === 'vote-more' || desc === 'vote-others'
    ? `front.contribution.proposal.votes.desc.${desc}`
    : `proposal.step.user.votes.infos.desc.${desc}`

const cases: TestCase[] = [
  { name: 'simple sans vote', voteTypes: [], votes: 0, title: 'proposals' },
  { name: 'simple avec vote', voteTypes: [], votes: 1, title: 'proposals', desc: 'votes-validated', descN: 1 },
  {
    name: 'seuil',
    voteTypes: ['THRESHOLD'],
    votes: 0,
    voteThreshold: 3,
    title: 'proposals',
    desc: 'threshold',
    descN: 3,
  },
  {
    name: 'budget restant',
    voteTypes: ['BUDGET'],
    votes: 0,
    budget: 100,
    title: 'proposals',
    desc: 'budget',
    descN: 100,
  },
  {
    name: 'budget épuisé',
    voteTypes: ['BUDGET'],
    votes: 1,
    budget: 100,
    estimation: 100,
    title: 'proposals',
    desc: 'budget',
    descN: 0,
  },
  {
    name: 'minimum avant seuil',
    voteTypes: ['MIN'],
    votes: 0,
    votesMin: 2,
    title: 'proposal-number',
    titleN: 2,
    desc: 'default',
  },
  { name: 'minimum atteint', voteTypes: ['MIN'], votes: 2, votesMin: 2, title: 'validated', desc: 'vote-others' },
  { name: 'minimum dépassé', voteTypes: ['MIN'], votes: 3, votesMin: 2, title: 'validated', desc: 'vote-others' },
  { name: 'maximum sans vote', voteTypes: ['MAX'], votes: 0, votesLimit: 4, title: 'proposal-number', titleN: 4 },
  {
    name: 'maximum en cours',
    voteTypes: ['MAX'],
    votes: 1,
    votesLimit: 4,
    title: 'proposal-number',
    titleN: 3,
    desc: 'votes-validated',
    descN: 1,
  },
  { name: 'maximum atteint', voteTypes: ['MAX'], votes: 4, votesLimit: 4, title: 'ended', desc: 'thanks' },
  {
    name: 'budget min-max avant minimum',
    voteTypes: ['BUDGET', 'MIN', 'MAX'],
    votes: 0,
    votesMin: 2,
    votesLimit: 4,
    budget: 100,
    title: 'proposal-number',
    titleN: 2,
    desc: 'budget',
    descN: 100,
  },
  {
    name: 'budget min-max validé',
    voteTypes: ['BUDGET', 'MIN', 'MAX'],
    votes: 2,
    votesMin: 2,
    votesLimit: 4,
    budget: 100,
    estimation: 10,
    title: 'validated',
    desc: 'budget-ended',
    descN: 80,
  },
  {
    name: 'budget min-max terminé',
    voteTypes: ['BUDGET', 'MIN', 'MAX'],
    votes: 4,
    votesMin: 2,
    votesLimit: 4,
    budget: 100,
    estimation: 25,
    title: 'ended',
    desc: 'budget-ended',
    descN: 0,
  },
  {
    name: 'min-max avant minimum',
    voteTypes: ['MIN', 'MAX'],
    votes: 0,
    votesMin: 2,
    votesLimit: 4,
    title: 'proposal-number',
    titleN: 2,
    desc: 'default',
  },
  {
    name: 'min-max minimum atteint',
    voteTypes: ['MIN', 'MAX'],
    votes: 2,
    votesMin: 2,
    votesLimit: 4,
    title: 'validated',
    desc: 'vote-more',
    descN: 2,
  },
  {
    name: 'min-max entre les seuils',
    voteTypes: ['MIN', 'MAX'],
    votes: 3,
    votesMin: 2,
    votesLimit: 4,
    title: 'validated',
    desc: 'vote-more',
    descN: 1,
  },
  {
    name: 'min-max maximum atteint',
    voteTypes: ['MIN', 'MAX'],
    votes: 4,
    votesMin: 2,
    votesLimit: 4,
    title: 'ended',
    desc: 'thanks',
  },
  {
    name: 'classement maximum en cours',
    voteTypes: ['RANKING', 'MAX'],
    votes: 1,
    votesLimit: 4,
    title: 'proposal-number',
    titleN: 3,
    desc: 'votes-validated',
    descN: 1,
  },
  {
    name: 'classement maximum atteint',
    voteTypes: ['RANKING', 'MAX'],
    votes: 4,
    votesLimit: 4,
    title: 'ended',
    desc: 'thanks',
  },
  {
    name: 'classement min-max avant minimum',
    voteTypes: ['RANKING', 'MIN', 'MAX'],
    votes: 0,
    votesMin: 2,
    votesLimit: 4,
    title: 'proposal-number',
    titleN: 2,
    desc: 'default',
  },
  {
    name: 'classement min-max validé',
    voteTypes: ['RANKING', 'MIN', 'MAX'],
    votes: 2,
    votesMin: 2,
    votesLimit: 4,
    title: 'validated',
    desc: 'vote-more',
    descN: 2,
  },
  {
    name: 'classement min-max entre les seuils',
    voteTypes: ['RANKING', 'MIN', 'MAX'],
    votes: 3,
    votesMin: 2,
    votesLimit: 4,
    title: 'validated',
    desc: 'vote-more',
    descN: 1,
  },
  {
    name: 'classement min-max terminé',
    voteTypes: ['RANKING', 'MIN', 'MAX'],
    votes: 4,
    votesMin: 2,
    votesLimit: 4,
    title: 'ended',
    desc: 'thanks',
  },
]

describe('VoteStepUserInfos', () => {
  beforeEach(() => jest.clearAllMocks())

  it.each(cases)('affiche les messages attendus : $name', testCase => {
    const estimation = testCase.estimation ?? 0
    ;(useFragment as jest.Mock).mockReturnValue({
      voteTypes: testCase.voteTypes,
      votesMin: testCase.votesMin ?? null,
      votesLimit: testCase.votesLimit ?? null,
      budget: testCase.budget ?? null,
      voteThreshold: testCase.voteThreshold ?? null,
      actionButtonLabel: null,
      votesHelpText: null,
      form: { objectType: 'PROPOSAL' },
      viewerVotes: {
        totalCount: testCase.votes,
        edges: Array.from({ length: testCase.votes }, () => ({ node: { proposal: { estimation } } })),
      },
    })

    render(<VoteStepUserInfos step={{} as any} />)

    expect(formatMessage).toHaveBeenCalledWith(
      { id: getTitleTranslationKey(testCase.title) },
      expect.any(Object),
    )

    if (testCase.titleN !== undefined) {
      expect(formatMessage).toHaveBeenCalledWith(
        { id: getTitleTranslationKey(testCase.title) },
        { n: testCase.titleN },
      )
    }

    if (testCase.desc) {
      expect(formatMessage).toHaveBeenCalledWith(
        { id: getDescTranslationKey(testCase.desc) },
        { n: testCase.descN, v: (testCase.votesLimit ?? 0) - testCase.votes },
      )
    } else {
      expect(formatMessage).not.toHaveBeenCalledWith(
        expect.objectContaining({ id: expect.stringMatching(/\.infos\.desc\./) }),
        expect.anything(),
      )
    }
  })
})
