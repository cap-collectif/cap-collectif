/* eslint-env jest */
import { onSubmit as submit } from './ProposalForm'
import { onSubmit as submitLegacy } from './ProposalFormLegacy'
import { saveProposal } from '../Create/ProposalErrorModal'
import CreateProposalMutation from '~/mutations/CreateProposalMutation'
import ChangeProposalContentMutation from '~/mutations/ChangeProposalContentMutation'
import { validateProposalContent } from '../Admin/ProposalAdminContentForm'

jest.mock('~/mutations/CreateProposalMutation', () => ({ commit: jest.fn() }))
jest.mock('~/mutations/ChangeProposalContentMutation', () => ({ commit: jest.fn() }))
jest.mock('../Admin/ProposalAdminContentForm', () => ({ validateProposalContent: jest.fn() }))

const originalLocation = window.location

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      href: 'https://capco.test/project/project/collect/step/proposals/draft',
      search: '',
      assign: jest.fn(),
      reload: jest.fn(),
    },
  })
})

afterEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
})

/** @jest-status compliant */
describe.each([
  ['current', submit],
  ['legacy', submitLegacy],
])('%s proposal submission', (_, onSubmit) => {
  it.each([
    ['incomplete publication', false, 'MISSING_REQUIREMENTS', false, true],
    ['consent workflow', false, 'COMPLETED', true, true],
    ['incomplete draft save', true, 'MISSING_REQUIREMENTS', false, false],
    ['incomplete draft save with consent pending', true, 'MISSING_REQUIREMENTS', true, false],
    ['completed draft save', true, 'COMPLETED', false, false],
    ['completed draft save with consent pending', true, 'COMPLETED', true, false],
    ['completed publication', false, 'COMPLETED', false, false],
  ])('%s opens the appropriate next screen', async (_, draft, completionStatus, shouldTriggerWorkflow, redirects) => {
    ;(validateProposalContent as jest.Mock).mockReturnValue({})
    ;(ChangeProposalContentMutation.commit as jest.Mock).mockResolvedValue({
      changeProposalContent: {
        shouldTriggerWorkflow,
        proposal: {
          id: 'proposal1',
          completionStatus,
          form: { step: { url: 'https://capco.test/project/project/collect/step' } },
        },
      },
    })
    await onSubmit({ title: 'Proposal', responses: [], draft } as any, jest.fn(), {
      proposal: { id: 'proposal1' },
      proposalForm: { id: 'form1', step: { id: 'step1' }, questions: [] },
      features: {},
      onSubmitSuccess: jest.fn(),
      onSubmitFailed: jest.fn(),
    } as any)

    if (redirects) {
      expect(window.location.assign).toHaveBeenCalledWith(
        'https://capco.test/project/project/collect/step?workflow=&contributionId=proposal1',
      )
      expect(window.location.reload).not.toHaveBeenCalled()
    } else {
      expect(window.location.assign).not.toHaveBeenCalled()
      expect(window.location.reload).toHaveBeenCalled()
    }
  })

  it.each([false, true])('waits for independent email authentication when draft=%s', async draft => {
    window.location.search = '?token=proposal-only-token'
    ;(validateProposalContent as jest.Mock).mockReturnValue({})
    ;(ChangeProposalContentMutation.commit as jest.Mock).mockResolvedValue({
      changeProposalContent: {
        participantAuthenticationRequired: true,
        shouldTriggerWorkflow: false,
        proposal: {
          id: 'proposal1',
          completionStatus: 'MISSING_REQUIREMENTS',
          form: { step: { url: 'https://capco.test/project/project/collect/step' } },
        },
      },
    })
    const onSubmitSuccess = jest.fn()
    await onSubmit({ title: 'Proposal', responses: [], draft } as any, jest.fn(), {
      proposal: { id: 'proposal1' },
      proposalForm: { id: 'form1', step: { id: 'step1' }, questions: [] },
      features: {},
      intl: { formatMessage: jest.fn(({ id }) => id) },
      onSubmitSuccess,
      onSubmitFailed: jest.fn(),
      isAuthenticated: false,
    } as any)

    expect(window.location.assign).not.toHaveBeenCalled()
    expect(window.location.reload).not.toHaveBeenCalled()
    expect(onSubmitSuccess).toHaveBeenCalled()
  })

  it('creates an incomplete draft without opening the workflow', async () => {
    const pushState = jest.spyOn(window.history, 'pushState').mockImplementation(() => {})
    const onSubmitSuccess = jest.fn()
    ;(validateProposalContent as jest.Mock).mockReturnValue({})
    ;(CreateProposalMutation.commit as jest.Mock).mockResolvedValue({
      createProposal: {
        shouldTriggerWorkflow: true,
        proposalId: { id: 'proposal1' },
        proposal: { id: 'proposal1', completionStatus: 'MISSING_REQUIREMENTS' },
      },
    })
    try {
      await onSubmit({ title: 'Draft', responses: [], draft: true } as any, jest.fn(), {
        proposalForm: { id: 'form1', step: { id: 'step1' }, questions: [] },
        features: {},
        intl: { formatHTMLMessage: jest.fn(({ id }) => id) },
        onSubmitSuccess,
        onSubmitFailed: jest.fn(),
        isAuthenticated: true,
      } as any)
      expect(pushState).not.toHaveBeenCalled()
      expect(window.location.assign).not.toHaveBeenCalled()
      expect(onSubmitSuccess).toHaveBeenCalled()
    } finally {
      pushState.mockRestore()
    }
  })

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

/** @jest-status compliant */
describe.each(['current', 'legacy', 'retry'])('%s workflow contributor access', mode => {
  it.each([
    ['administrator editing another author returns to the proposal', 'admin', 'author', true, false],
    ['organization member editing another author returns to the proposal', 'member', 'author', true, false],
    ['administrator editing their own proposal opens the workflow', 'admin', 'admin', true, true],
    ['author opens the workflow', 'author', 'author', true, true],
    ['participant with a session opens the workflow', undefined, 'participant', false, true],
  ])('%s', async (_, viewerId, authorId, isAuthenticated, redirects) => {
    ;(validateProposalContent as jest.Mock).mockReturnValue({})
    ;(ChangeProposalContentMutation.commit as jest.Mock).mockResolvedValue({
      changeProposalContent: {
        shouldTriggerWorkflow: true,
        participantAuthenticationRequired: false,
        proposal: {
          id: 'proposal1',
          author: { id: authorId },
          completionStatus: 'MISSING_REQUIREMENTS',
          form: { step: { url: 'https://capco.test/project/project/collect/step' } },
        },
      },
    })
    const values = { id: 'proposal1', title: 'Proposal', responses: [], draft: false }
    const proposal = { id: 'proposal1' }
    const proposalForm = { id: 'form1', step: { id: 'step1' }, questions: [] }
    const onSubmitSuccess = jest.fn()
    if (mode === 'retry') {
      await saveProposal(
        values as any,
        proposalForm as any,
        proposal as any,
        false,
        {} as any,
        jest.fn(),
        onSubmitSuccess,
        jest.fn(),
        isAuthenticated,
        viewerId,
      )
    } else {
      await (mode === 'current' ? submit : submitLegacy)(values as any, jest.fn(), {
        proposal,
        proposalForm,
        features: {},
        isAuthenticated,
        user: viewerId ? { id: viewerId } : null,
        onSubmitSuccess,
        onSubmitFailed: jest.fn(),
      } as any)
    }
    if (redirects) {
      expect(window.location.assign).toHaveBeenCalledWith(
        'https://capco.test/project/project/collect/step?workflow=&contributionId=proposal1',
      )
      expect(window.location.reload).not.toHaveBeenCalled()
    } else {
      expect(window.location.assign).not.toHaveBeenCalled()
      expect(onSubmitSuccess).toHaveBeenCalled()
      expect(window.location.reload).toHaveBeenCalled()
    }
  })
})
