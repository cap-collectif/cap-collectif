// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import ErrorIncident from '~ui/ErrorIncident/ErrorIncident';
import { ButtonRetry } from './ErrorQuery.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

type Props = {
  retry: ?() => void,
};

const ErrorQuery = ({ retry }: Props) => (
  <ErrorIncident>
    <FormattedMessage id="loading.error" tagName="p" />
    <FormattedMessage id="loading.error.help.text" tagName="p" />

    {retry && (
      <ButtonRetry type="button" onClick={() => retry()}>
        <Icon name={ICON_NAME.reload} size={15} />
        <FormattedMessage id="button.try.again" />
      </ButtonRetry>
    )}
  </ErrorIncident>
);

export default ErrorQuery;
