import * as React from 'react'
import QuestionContainer from './Question.style'

type Props = {
  children: JSX.Element | JSX.Element[] | string
}

const Question = ({ children }: Props) => <QuestionContainer>{children}</QuestionContainer>

export default Question
