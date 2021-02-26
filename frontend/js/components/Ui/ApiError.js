// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import * as Sentry from '@sentry/browser';
import { Button } from 'react-bootstrap';
import type { GlobalState } from '~/types';

type Props = {| reportSentryError: boolean |};

const ApiError = ({ reportSentryError }: Props) => {
  return (
    <p className="text-danger">
      <FormattedMessage id="global-api-error" />
      {reportSentryError ? (
        <Button bsStyle="link" onClick={() => Sentry.showReportDialog()}>
          <FormattedMessage id="report-feedback" />
        </Button>
      ) : null}
    </p>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  reportSentryError: state.default.features.report_browers_errors_to_sentry,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(ApiError);
