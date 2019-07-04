// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { submit, isSubmitting } from 'redux-form';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import type { Dispatch, State } from '../../types';
import LoginButton from '../User/Login/LoginButton';
import LoginBox from '../User/Login/LoginBox';
import RegistrationButton from '../User/Registration/RegistrationButton';

type Props = {|
  showRegistration: boolean,
  submitting: boolean,
  loginWithOpenId: boolean,
  byPassAuth: boolean,
  onSubmit: (e: Event) => void,
|};

const getShieldBody = ({
  showRegistration,
  submitting,
  byPassAuth,
  loginWithOpenId,
  onSubmit,
}: Props): React.Node => {
  if (showRegistration && !loginWithOpenId) {
    return (
      <>
        <LoginButton className="btn--connection btn-block" />
        <div className="mt-10" />
        <RegistrationButton className="btn-block" />
      </>
    );
  }
  if (byPassAuth && loginWithOpenId) {
    return (
      <>
        <strong>
          <FormattedMessage id="authenticate-with" />
        </strong>
        <LoginBox />
      </>
    );
  }
  return (
    <form id="login-form" onSubmit={onSubmit}>
      <LoginBox />
      <Button
        id="confirm-login"
        type="submit"
        className="mt-10 btn-block btn-success"
        disabled={submitting}
        bsStyle="primary">
        {submitting ? (
          <FormattedMessage id="global.loading" />
        ) : (
          <FormattedMessage id="global.login_me" />
        )}
      </Button>
    </form>
  );
};

export class ShieldPage extends React.Component<Props> {
  render() {
    return (
      <div id="shield-agent" className="bg-white col-md-4 col-md-offset-4 panel panel-default">
        <div className="panel-body">{getShieldBody(this.props)}</div>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  showRegistration: state.default.features.registration,
  byPassAuth: state.default.features.sso_by_pass_auth,
  loginWithOpenId: state.default.features.login_openid,
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
