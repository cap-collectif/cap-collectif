import { $PropertyType } from 'utility-types'
import * as React from 'react'
import { createMachine } from 'xstate'
import CookieMonster from '~/CookieMonster'
import type { DebateStepPageVoteAndShare_step } from '~relay/DebateStepPageVoteAndShare_step.graphql'
export type DebateStateMachine = Record<string, any>
export type Context = {
  readonly value?: DebateStateMachine | null
}
export const MachineContext: React.Context<Context> = React.createContext<Context>({
  value: null,
})
export type VoteState =
  | 'idle'
  | 'none'
  | 'none_anonymous'
  | 'none_not_confirmed'
  | 'voted'
  | 'voted_anonymous'
  | 'voted_not_confirmed'
  | 'argumented'
  | 'argumented_not_confirmed'
  | 'argumented_anonymous'
  | 'result'
export type VoteAction = 'VOTE' | 'ARGUMENT' | 'DELETE_ARGUMENT' | 'DELETE_VOTE'
export const getInitialState = (
  debate: $PropertyType<DebateStepPageVoteAndShare_step, 'debate'>,
  stepClosed: boolean,
  viewerIsConfirmedByEmail: boolean,
  isAnonymousVoteAllowed: boolean,
  isAuthenticated: boolean,
): VoteState => {
  if (debate.viewerHasVote && !stepClosed) {
    if (debate.viewerHasArgument) return viewerIsConfirmedByEmail ? 'argumented' : 'argumented_not_confirmed'
    return viewerIsConfirmedByEmail ? 'voted' : 'voted_not_confirmed'
  }

  if (stepClosed) return 'result'

  if (isAnonymousVoteAllowed && CookieMonster.hasDebateAnonymousVoteCookie(debate.id) && !isAuthenticated) {
    return CookieMonster.hasDebateAnonymousArgumentCookie(debate.id) ? 'argumented_anonymous' : 'voted_anonymous'
  }

  return isAuthenticated ? (viewerIsConfirmedByEmail ? 'none' : 'none_not_confirmed') : 'none_anonymous'
}
export const debateStateMachine: DebateStateMachine = createMachine({
  id: 'debate-state-machine',
  initial: 'idle',
  states: {
    idle: {
      on: {
        none: 'none',
        none_anonymous: 'none_anonymous',
        none_not_confirmed: 'none_not_confirmed',
        voted: 'voted',
        voted_anonymous: 'voted_anonymous',
        voted_not_confirmed: 'voted_not_confirmed',
        argumented: 'argumented',
        argumented_not_confirmed: 'argumented_not_confirmed',
        argumented_anonymous: 'argumented_anonymous',
        result: 'result',
      },
    },
    none: {
      on: {
        VOTE: 'voted',
      },
    },
    none_not_confirmed: {
      on: {
        VOTE: 'voted_not_confirmed',
      },
    },
    none_anonymous: {
      on: {
        VOTE: 'voted_anonymous',
      },
    },
    voted: {
      on: {
        DELETE_VOTE: 'none',
        ARGUMENT: 'argumented',
      },
    },
    voted_anonymous: {
      on: {
        DELETE_VOTE: 'none_anonymous',
      },
    },
    voted_not_confirmed: {
      on: {
        DELETE_VOTE: 'none_not_confirmed',
        ARGUMENT: 'argumented_not_confirmed',
      },
    },
    argumented: {
      on: {
        DELETE_ARGUMENT: 'voted',
        DELETE_VOTE: 'none',
      },
    },
    argumented_anonymous: {
      on: {
        DELETE_ARGUMENT: 'voted_anonymous',
        DELETE_VOTE: 'none_anonymous',
      },
    },
    argumented_not_confirmed: {
      on: {
        DELETE_ARGUMENT: 'voted_not_confirmed',
        DELETE_VOTE: 'none_not_confirmed',
      },
    },
    result: {
      type: 'final',
    },
  },
})
