// @flow

export type StepType = { value: string, label: string };

export const STEP_TYPES: StepType[] = [
  { value: 'OtherStep', label: 'global.custom.feminine' },
  { value: 'CollectStep', label: 'collect_step' },
  { value: 'RankingStep', label: 'global.ranking' },
  { value: 'SelectionStep', label: 'selection_step' },
  { value: 'SynthesisStep', label: 'global.synthesis' },
  { value: 'ConsultationStep', label: 'global.consultation' },
  { value: 'PresentationStep', label: 'presentation_step' },
  { value: 'QuestionnaireStep', label: 'global.questionnaire' },
];
