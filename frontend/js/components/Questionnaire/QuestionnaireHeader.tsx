import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import type { QuestionnaireHeader_step$key } from '~relay/QuestionnaireHeader_step.graphql'
import { QuestionnaireHeaderContainer } from './QuestionnaireHeader.style'
import { BodyText } from '~ui/Boxes/BodyText'

const FRAGMENT = graphql`
  fragment QuestionnaireHeader_step on Step {
    body
  }
`
type QuestionnaireHeaderProps = {
  step: QuestionnaireHeader_step$key
}

const QuestionnaireHeader = ({ step: stepFragment }: QuestionnaireHeaderProps) => {
  const step = useFragment(FRAGMENT, stepFragment)
  return (
    <QuestionnaireHeaderContainer>
      {step.body && <BodyText maxLines={5} text={step.body} />}
    </QuestionnaireHeaderContainer>
  )
}

export default QuestionnaireHeader
