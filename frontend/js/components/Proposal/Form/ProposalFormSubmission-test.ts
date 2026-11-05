/* eslint-env jest */
import { onSubmit as submit } from './ProposalForm'
import { onSubmit as submitLegacy } from './ProposalFormLegacy'
import CreateProposalMutation from '~/mutations/CreateProposalMutation'
import ChangeProposalContentMutation from '~/mutations/ChangeProposalContentMutation'
import { validateProposalContent } from '../Admin/ProposalAdminContentForm'

jest.mock('~/mutations/CreateProposalMutation', () => ({ commit: jest.fn() }))
jest.mock('~/mutations/ChangeProposalContentMutation', () => ({ commit: jest.fn() }))
jest.mock('../Admin/ProposalAdminContentForm', () => ({ validateProposalContent: jest.fn() }))

/** @jest-status compliant */
describe.each([
  ['current', submit],
  ['legacy', submitLegacy],
])('%s proposal submission', (_, onSubmit) => {
  it.each(['edit', 'create'])(
    'keeps the %s form available to correct a rejected private media reference',
    async mode => {
      const onSubmitFailed = jest.fn()
      const onSubmitSuccess = jest.fn()
      ;(validateProposalContent as jest.Mock).mockReturnValue({})
      const mutation = mode === 'edit' ? ChangeProposalContentMutation : CreateProposalMutation
      ;(mutation.commit as jest.Mock).mockRejectedValue({
        extensions: {
          code: 'MEDIA_REUSE_DENIED',
          field: 'value',
          questionId: 'question1',
          mediaReference: 'private.png',
        },
      })

      await expect(
        onSubmit({ title: 'Proposal', responses: [{ question: 'question1', value: 'Content' }] } as any, jest.fn(), {
          proposal: mode === 'edit' ? { id: 'proposal1' } : undefined,
          proposalForm: { id: 'form1', step: { id: 'step1' }, questions: [{ id: 'question1', type: 'text' }] },
          features: {},
          onSubmitFailed,
          onSubmitSuccess,
        } as any),
      ).rejects.toMatchObject({
        errors: {
          responses: [{ value: { id: 'file-loading-failure', values: { fileName: 'private.png' } } }],
        },
      })
      expect(onSubmitFailed).not.toHaveBeenCalled()
      expect(onSubmitSuccess).not.toHaveBeenCalled()
    },
  )
})
