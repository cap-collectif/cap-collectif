// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import type { QuestionnaireFooter_step$key } from '~relay/QuestionnaireFooter_step.graphql';
import { QuestionnaireFooterContainer } from './QuestionnaireFooter.style';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';

const FRAGMENT = graphql`
  fragment QuestionnaireFooter_step on QuestionnaireStep {
    footer
  }
`;

type QuestionnaireFooterProps = {|
  step: QuestionnaireFooter_step$key,
|};

const QuestionnaireFooter = ({ step: stepFragment }: QuestionnaireFooterProps) => {
  const step = useFragment(FRAGMENT, stepFragment);

  if (!step.footer) return null;

  return (
    <QuestionnaireFooterContainer>
      <WYSIWYGRender value={step.footer} />
    </QuestionnaireFooterContainer>
  );
};

export default QuestionnaireFooter;
