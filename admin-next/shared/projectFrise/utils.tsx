export const convertTypenameToStepSlug = (typename: string): string => {
  switch (typename) {
    case 'CollectStep':
      return 'collect'

    case 'ConsultationStep':
      return 'consultation'

    case 'PresentationStep':
      return 'presentation'

    case 'QuestionnaireStep':
      return 'questionnaire'

    case 'RankingStep':
      return 'ranking'

    case 'SelectionStep':
      return 'selection'

    case 'DebateStep':
      return 'debate'

    case 'OtherStep':
    default:
      return 'step'
  }
}
