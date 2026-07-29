import { IntlShape } from 'react-intl'
import { getParticipatoryBudgetAnalysisInput } from './ConfigureParticipatoryBudgetAnalysisInput'
import { getParticipatoryBudgetInput } from './ConfigureParticipatoryBudgetInput'
import { getPublicConsultationInput } from './ConfigurePublicConsultationInput'
import { getPublicInquiryInput } from './ConfigurePublicInquiryInput'

const intl = {
  formatMessage: ({ id }: { id: string }) => id,
} as IntlShape

const baseParams = {
  projectTitle: 'Project title',
  authors: ['user-id'],
  intl,
  isNewBackOfficeEnabled: false,
}

const getCollectStepRequirementTypes = input =>
  input.project.steps.find(step => step.type === 'COLLECT').requirements.map(requirement => requirement.type)

const templateInputs = [
  [
    'participatory budget',
    isSsoByPassAuthEnabled => getParticipatoryBudgetInput({ ...baseParams, isSsoByPassAuthEnabled }),
  ],
  [
    'participatory budget analysis',
    isSsoByPassAuthEnabled => getParticipatoryBudgetAnalysisInput({ ...baseParams, isSsoByPassAuthEnabled }),
  ],
  [
    'public inquiry',
    isSsoByPassAuthEnabled =>
      getPublicInquiryInput({ ...baseParams, isSsoByPassAuthEnabled, visibility: 'ADMIN' }),
  ],
  [
    'public consultation',
    isSsoByPassAuthEnabled =>
      getPublicConsultationInput({ ...baseParams, isSsoByPassAuthEnabled, visibility: 'ADMIN' }),
  ],
]

describe('project template collect-step requirements', () => {
  test.each(templateInputs)('%s uses email verification when SSO bypass authentication is disabled', (_name, getInput) => {
    expect(getCollectStepRequirementTypes(getInput(false))).toEqual(['EMAIL_VERIFIED', 'CONSENT_PRIVACY_POLICY'])
  })

  test.each(templateInputs)('%s uses SSO when SSO bypass authentication is enabled', (_name, getInput) => {
    expect(getCollectStepRequirementTypes(getInput(true))).toEqual(['SSO', 'CONSENT_PRIVACY_POLICY'])
  })
})
