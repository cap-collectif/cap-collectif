// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Loader from '~ui/FeedbacksIndicators/Loader';
import { Container } from './EmailingLoader.style';

const EmailingLoader = () => (
  <Container>
    <Loader inline size={16} />
    <FormattedMessage id="synthesis.common.loading" />
  </Container>
);

export default EmailingLoader;
