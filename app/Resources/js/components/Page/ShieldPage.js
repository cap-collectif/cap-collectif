// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { submit, isSubmitting } from 'redux-form';
import { connect } from 'react-redux';
import type { Connector } from 'react-redux';
import type { Dispatch, State } from '../../types';
import LoginButton from '../User/Login/LoginButton';
import LoginBox from '../User/Login/LoginBox';
import SubmitButton from '../Form/SubmitButton';
import RegistrationButton from '../User/Registration/RegistrationButton';

type Props = {
  showRegistration: boolean,
  submitting: boolean,
  dispatch: Dispatch
};
export const Shield = React.createClass({
  propTypes: {
    showRegistration: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { showRegistration, submitting, dispatch }: Props = this.props;
    if (showRegistration) {
      return (
        <div className="col-md-4 col-md-offset-4">
          <LoginButton className="btn--connection" />
          { ' ' }
          <RegistrationButton />
        </div>
      );
    }
    return (
      <div style={{ background: 'white' }} className="col-md-4 col-md-offset-4 block box block--bordered">
        <form id="login-form" onSubmit={() => { dispatch(submit('login')); }}>
          <LoginBox />
          <SubmitButton
            type="submit"
            isSubmitting={submitting}
            label="global.login"
            className="btn-lg btn-success btn-block"
          />
        </form>
      </div>
    );
  },

});

const mapStateToProps = (state: State) => ({
  showRegistration: state.default.features.registration,
  submitting: isSubmitting('login')(state),
});
const connector: Connector<{}, Props> = connect(mapStateToProps);
export default connector(Shield);
