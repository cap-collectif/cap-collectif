import { IntlShape } from 'react-intl'

export const proposalStepObjectTypeOptions = (intl: IntlShape) => [
  { label: intl.formatMessage({ id: 'proposal.step.object_type.proposition' }), value: 'PROPOSITION' },
  { label: intl.formatMessage({ id: 'proposal.step.object_type.project' }), value: 'PROJECT' },
  { label: intl.formatMessage({ id: 'proposal.step.object_type.mission' }), value: 'MISSION' },
  { label: intl.formatMessage({ id: 'proposal.step.object_type.opinion' }), value: 'OPINION' },
  { label: intl.formatMessage({ id: 'proposal.step.object_type.idea' }), value: 'IDEA' },
  { label: intl.formatMessage({ id: 'proposal.step.object_type.question' }), value: 'QUESTION' },
  { label: intl.formatMessage({ id: 'proposal.step.object_type.reporting' }), value: 'REPORTING' },
  { label: intl.formatMessage({ id: 'proposal.step.object_type.testimony' }), value: 'TESTIMONY' },
  { label: intl.formatMessage({ id: 'proposal.step.object_type.picture' }), value: 'PICTURE' },
]
