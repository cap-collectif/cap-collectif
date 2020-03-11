// @flow

import * as React from 'react';
import QuestionContainer from './Question.style';

type Props = {
  children: React.Node | string,
};
const Question = ({ children }: Props) => <QuestionContainer>{children}</QuestionContainer>;

export default Question;
