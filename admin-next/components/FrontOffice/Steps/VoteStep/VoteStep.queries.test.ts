/* eslint-env jest */

import { buildVoteStepQueryVariables } from './VoteStep.queries'

jest.mock('react-relay', () => ({ graphql: jest.fn() }))
jest.mock('@utils/leaflet', () => ({ exportLatLngBounds: jest.fn() }))

const buildVariables = (state: string | null) =>
  buildVoteStepQueryVariables({ stepId: 'step-id', isAuthenticated: false, searchParams: { state } })

describe('buildVoteStepQueryVariables', () => {
  it.each(['PUBLISHED', 'ARCHIVED'])('filters the proposals on the %s state picked by the visitor', state => {
    expect(buildVariables(state).state).toBe(state)
  })

  it.each([null, 'ALL', 'DRAFT', 'TRASHED'])(
    'lists published and archived proposals alike when the state is %s',
    state => {
      expect(buildVariables(state).state).toBeUndefined()
    },
  )
})
