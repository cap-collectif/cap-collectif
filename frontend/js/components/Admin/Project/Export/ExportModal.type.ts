export type Step = {
  readonly id: string
  readonly title: string
  readonly __typename: ProjectType
  readonly votable?: boolean
}

export type ProjectType =
  | 'PresentationStep'
  | 'DebateStep'
  | 'ConsultationStep'
  | 'CollectStep'
  | 'SelectionStep'
  | 'RankingStep'
  | 'QuestionnaireStep'
  | 'OtherStep'
  | 'AllSteps'
