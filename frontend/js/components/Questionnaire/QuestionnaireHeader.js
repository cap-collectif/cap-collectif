// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import type { QuestionnaireHeader_step$key } from '~relay/QuestionnaireHeader_step.graphql';
import { QuestionnaireHeaderContainer, Title } from './QuestionnaireHeader.style';
import { BodyText } from '~ui/Boxes/BodyText';

const FRAGMENT = graphql`
  fragment QuestionnaireHeader_step on Step {
    body
    title
  }
`;

type QuestionnaireHeaderProps = {|
  step: QuestionnaireHeader_step$key,
|};

const QuestionnaireHeader = ({ step: stepFragment }: QuestionnaireHeaderProps) => {
  const step = useFragment(FRAGMENT, stepFragment);

  return (
    <QuestionnaireHeaderContainer>
      <Title>{step.title}</Title>
      {step.body && <BodyText maxLines={5} text={step.body} />}
    </QuestionnaireHeaderContainer>
  );
};

export default QuestionnaireHeader;
