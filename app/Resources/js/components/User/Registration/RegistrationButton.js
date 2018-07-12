// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import RegistrationModal from './RegistrationModal';
import { showRegistrationModal } from '../../../redux/modules/user';
import type { State, Dispatch } from '../../../types';

type Props = {
  features: Object,
  style: ?Object,
  user: ?Object,
  className: string,
  bsStyle: ?string,
  buttonStyle: ?Object,
  openRegistrationModal: () => void,
  shieldEnabled: boolean,
  chartBody: ?string,
};

export class RegistrationButton extends React.Component<Props> {
  static defaultProps = {
    style: {},
    buttonStyle: {},
    user: null,
    className: '',
    bsStyle: 'primary',
    shieldEnabled: false,
    chartBody: '',
  };

  render() {
    const {
      bsStyle,
      buttonStyle,
      className,
      features,
      style,
      user,
      openRegistrationModal,
      shieldEnabled,
      chartBody,
    } = this.props;
    if (!features.registration || !!user) {
      return null;
    }
    return (
      <span style={style}>
        <Button
          style={buttonStyle}
          onClick={openRegistrationModal}
          bsStyle={bsStyle}
          className={`btn--registration ${className}`}>
          {<FormattedMessage id="global.registration" />}
        </Button>
        <RegistrationModal shieldEnabled={shieldEnabled} chartBody={chartBody} />
      </span>
    );
  }
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
  user: state.user.user,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  openRegistrationModal: () => {
    dispatch(showRegistrationModal());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegistrationButton);
