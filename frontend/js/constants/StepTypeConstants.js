// @flow

export type StepType = { value: string, label: string, addLabel: string, editLabel: string };

export const STEP_TYPES: StepType[] = [
  {
    value: 'PresentationStep',
    label: 'presentation_step',
    addLabel: 'add-presentation-step',
    editLabel: 'edit-submission-step',
  },
  {
    value: 'CollectStep',
    label: 'collect_step',
    addLabel: 'add_step_submission',
    editLabel: 'edit-submission-step',
  },
  {
    value: 'SelectionStep',
    label: 'selection_step',
    addLabel: 'add-selection-step',
    editLabel: 'edit-selection-step',
  },
  {
    value: 'ConsultationStep',
    label: 'global.consultation',
    addLabel: 'add-consultation-step',
    editLabel: 'edit-consultation-step',
  },
  {
    value: 'SynthesisStep',
    label: 'global.synthesis',
    addLabel: 'add-synthesis-step',
    editLabel: 'edit-synthesis-step',
  },
  {
    value: 'RankingStep',
    label: 'global.ranking',
    addLabel: 'add-ranking-step',
    editLabel: 'edit-ranking-step',
  },
  {
    value: 'QuestionnaireStep',
    label: 'global.questionnaire',
    addLabel: 'add-questionnaire-step',
    editLabel: 'edit-questionnaire-step',
  },
  {
    value: 'OtherStep',
    label: 'global.custom.feminine',
    addLabel: 'add-custom-step',
    editLabel: 'edit-custom-step',
  },
];
