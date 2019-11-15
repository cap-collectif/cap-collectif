// @flow

export type StepType = { value: string, label: string };

export const STEP_TYPES: StepType[] = [
  { value: 'other', label: 'other_step' },
  { value: 'collect', label: 'collect_step' },
  { value: 'ranking', label: 'ranking_step' },
  { value: 'selection', label: 'selection_step' },
  { value: 'synthesis', label: 'synthesis_step' },
  { value: 'consultation', label: 'consultation_step' },
  { value: 'presentation', label: 'presentation_step' },
  { value: 'questionnaire', label: 'questionnaire_step' },
];
