// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import type { Connector } from 'react-redux';
import type { State } from '../../types';
import LoginButton from '../User/Login/LoginButton';
import LoginBox from '../User/Login/LoginBox';
import RegistrationButton from '../User/Registration/RegistrationButton';

type Props = { showRegistration: boolean };
export const Shield = React.createClass({
  propTypes: {
    showRegistration: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { showRegistration }: Props = this.props;
    if (showRegistration) {
      return (
        <div>
          <LoginButton />
          <RegistrationButton />
        </div>
      );
    }
    return (
      <div>
        <LoginBox />
        {/* <SubmitButton /> */}
      </div>
    );
  },

});

const mapStateToProps = (state: State) => ({
  showRegistration: state.default.features.registration,
});
const connector: Connector<{}, Props> = connect(mapStateToProps);
export default connector(Shield);
