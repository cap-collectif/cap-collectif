import { getDeleteProposalSuccessTranslationKey } from './proposal'

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
