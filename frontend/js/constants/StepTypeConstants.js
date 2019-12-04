// @flow

export type StepType = { value: string, label: string };

export const STEP_TYPES: StepType[] = [
  { value: 'other', label: 'global.custom.feminine' },
  { value: 'collect', label: 'collect_step' },
  { value: 'ranking', label: 'global.ranking' },
  { value: 'selection', label: 'selection_step' },
  { value: 'synthesis', label: 'global.synthesis' },
  { value: 'consultation', label: 'global.consultation' },
  { value: 'presentation', label: 'presentation_step' },
  { value: 'questionnaire', label: 'global.questionnaire' },
];
