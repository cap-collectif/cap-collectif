// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { submit, isSubmitting } from 'redux-form';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import type { Dispatch, State } from '../../types';
import LoginButton from '../User/Login/LoginButton';
import LoginBox from '../User/Login/LoginBox';
import RegistrationButton from '../User/Registration/RegistrationButton';

type Props = {
  showRegistration: boolean,
  submitting: boolean,
  onSubmit: (e: Event) => void,
  chartBody: ?string,
};

export class ShieldPage extends React.Component<Props> {
  render() {
    const { showRegistration, submitting, onSubmit, chartBody }: Props = this.props;
    if (showRegistration) {
      return (
        <div
          style={{ background: 'white' }}
          className="col-md-4 col-md-offset-4 panel panel-default">
          <div className="panel-body">
            <LoginButton className="btn--connection btn-block" />
            <div style={{ marginTop: 10 }} />
            <RegistrationButton chartBody={chartBody} className="btn-block" />
          </div>
        </div>
      );
    }
    return (
      <div style={{ background: 'white' }} className="col-md-4 col-md-offset-4 panel panel-default">
        <div className="panel-body">
          <form id="login-form" onSubmit={onSubmit}>
            <LoginBox />
            <Button
              id="confirm-login"
              type="submit"
              style={{ marginTop: 10 }}
              className="btn-block btn-success"
              disabled={submitting}
              bsStyle="primary">
              {submitting ? (
                <FormattedMessage id="global.loading" />
              ) : (
                <FormattedMessage id="global.login_me" />
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  showRegistration: state.default.features.registration,
  submitting: isSubmitting('login')(state),
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSubmit: (e: Event) => {
    e.preventDefault();
    dispatch(submit('login'));
  },
});
const connector = connect(
  mapStateToProps,
  mapDispatchToProps,
);
export default connector(ShieldPage);
