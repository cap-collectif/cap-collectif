/* eslint-env jest */
import { deleteProposal, reducer, openDeleteProposalModal, getDeleteProposalSuccessTranslationKey } from './proposal'
import DeleteProposalMutation from '~/mutations/DeleteProposalMutation'
import { toast } from '~ds/Toast'
import { intlMock } from '~/mocks'

jest.mock('~/mutations/DeleteProposalMutation', () => ({ commit: jest.fn() }))
jest.mock('~ds/Toast', () => ({ toast: jest.fn() }))

/**
 * @jest-status compliant
 * @jest-reason Checks public reducer state and failure feedback while awaiting each attempt and resetting module mocks.
 */
describe('proposal deletion failure', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('stops loading, keeps the modal open and allows another attempt', async () => {
    let state = reducer(undefined, openDeleteProposalModal())
    const dispatch = jest.fn(action => {
      state = reducer(state, action)
      return action
    })
    const intl = { ...intlMock, formatMessage: ({ id }) => id }
    const commit = DeleteProposalMutation.commit as jest.MockedFunction<typeof DeleteProposalMutation.commit>
    commit.mockRejectedValue(new Error('Forbidden'))

    const firstAttempt = deleteProposal('proposal-id', dispatch, intl, true)
    expect(state.isDeleting).toBe(true)
    await firstAttempt

    expect(state.isDeleting).toBe(false)
    expect(state.showDeleteModal).toBe(true)
    expect(toast).toHaveBeenCalledWith({ content: 'global.failure', variant: 'warning' })

    const retry = deleteProposal('proposal-id', dispatch, intl, true)
    expect(state.isDeleting).toBe(true)
    await retry
    expect(state.isDeleting).toBe(false)
    expect(commit).toHaveBeenCalledTimes(2)
  })
})

describe('getDeleteProposalSuccessTranslationKey', () => {
  it('uses the contribution type, except for interpellations', () => {
    expect(
      getDeleteProposalSuccessTranslationKey({
        form: { objectType: 'PROJECT' },
        project: { type: { title: 'project.types.participative-budget' } },
      }),
    ).toBe('front.contribution.project.deleted-successfully')

    expect(
      getDeleteProposalSuccessTranslationKey({
        form: { objectType: 'PROPOSAL' },
        project: { type: { title: 'project.types.interpellation' } },
      }),
    ).toBe('interpellation.request.delete.success')
  })
})
