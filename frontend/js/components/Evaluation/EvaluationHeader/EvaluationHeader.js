// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import EvaluationHeaderContainer from './EvaluationHeader.style';

const EvaluationHeader = () => (
  <EvaluationHeaderContainer>
    <FormattedMessage tagName="h1" id="evaluations.index.page_title" />
  </EvaluationHeaderContainer>
);

export default EvaluationHeader;
