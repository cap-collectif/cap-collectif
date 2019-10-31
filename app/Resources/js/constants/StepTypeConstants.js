// @flow

export type StepType = { value: string, label: string };

export const STEP_TYPES: StepType[] = [
  { value: 'other_step', label: 'other_step' },
  { value: 'collect_step', label: 'collect_step' },
  { value: 'ranking_step', label: 'ranking_step' },
  { value: 'selection_step', label: 'selection_step' },
  { value: 'synthesis_step', label: 'synthesis_step' },
  { value: 'consultation_step', label: 'consultation_step' },
  { value: 'presentation_step', label: 'presentation_step' },
  { value: 'questionnaire_step', label: 'questionnaire_step' },
];
