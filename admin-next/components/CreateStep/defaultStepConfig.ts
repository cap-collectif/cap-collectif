import { CapUISpotIcon } from '@cap-collectif/ui'
import { IntlShape } from 'react-intl'
import { Step, StepType } from './CreateStepPage'

export const StepTypeEnum: Record<StepType, StepType> = {
  COLLECT: 'COLLECT',
  DEBATE: 'DEBATE',
  VOTE: 'VOTE',
  QUESTIONNAIRE: 'QUESTIONNAIRE',
  CONSULTATION: 'CONSULTATION',
  ANALYSIS: 'ANALYSIS',
  RESULT: 'RESULT',
  CUSTOM: 'CUSTOM',
}

const getDefaultStepConfig = (intl: IntlShape): Array<Step> => {
  return [
    {
      type: StepTypeEnum.COLLECT,
      heading: intl.formatMessage({ id: 'global.collect.step.label' }),
      description: intl.formatMessage({ id: 'collect-step-description' }),
      helpText: intl.formatMessage({ id: 'collect-step-help-text' }),
      spotIcon: CapUISpotIcon.BULB_SKETCH,
    },
    {
      type: StepTypeEnum.VOTE,
      heading: intl.formatMessage({ id: 'vote-and-selection' }),
      description: intl.formatMessage({ id: 'vote-step-description' }),
      helpText: intl.formatMessage({ id: 'vote-step-help-text' }),
      spotIcon: CapUISpotIcon.RATING_CLICK,
    },
    {
      type: StepTypeEnum.DEBATE,
      heading: intl.formatMessage({ id: 'global.debate' }),
      description: intl.formatMessage({ id: 'debate-step-description' }),
      helpText: intl.formatMessage({ id: 'debate-step-help-text' }),
      spotIcon: CapUISpotIcon.USER_DISCUSS,
    },
    {
      type: StepTypeEnum.QUESTIONNAIRE,
      heading: intl.formatMessage({ id: 'global.questionnaire' }),
      description: intl.formatMessage({ id: 'questionnaire-step-description' }),
      helpText: intl.formatMessage({ id: 'questionnaire-step-help-text' }),
      spotIcon: CapUISpotIcon.QUESTIONNAIRE,
    },
    {
      type: StepTypeEnum.CONSULTATION,
      heading: intl.formatMessage({ id: 'global.consultation' }),
      description: intl.formatMessage({ id: 'consultation-step-description' }),
      helpText: intl.formatMessage({ id: 'consultation-step-help-text' }),
      spotIcon: CapUISpotIcon.CONSULTATION,
    },
    {
      type: StepTypeEnum.ANALYSIS,
      heading: intl.formatMessage({ id: 'proposal_form.admin.evaluation' }),
      description: intl.formatMessage({ id: 'analysis-step-description' }),
      helpText: intl.formatMessage({ id: 'analysis-step-help-text' }),
      spotIcon: CapUISpotIcon.ANALYSIS,
    },
    {
      type: StepTypeEnum.RESULT,
      heading: intl.formatMessage({ id: 'global.result' }),
      description: intl.formatMessage({ id: 'result-step-description' }),
      helpText: intl.formatMessage({ id: 'result-step-help-text' }),
      spotIcon: CapUISpotIcon.RESULT,
    },
    {
      type: StepTypeEnum.CUSTOM,
      heading: intl.formatMessage({ id: 'global.customized' }),
      description: intl.formatMessage({ id: 'custom-step-description' }),
      helpText: intl.formatMessage({ id: 'custom-step-help-text' }),
      spotIcon: CapUISpotIcon.PENCIL_SOFTWARE,
    },
  ]
}

export { getDefaultStepConfig }
