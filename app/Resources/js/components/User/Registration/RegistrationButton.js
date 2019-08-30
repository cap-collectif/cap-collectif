// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
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
  intl: IntlShape,
};

export class RegistrationButton extends React.Component<Props> {
  static defaultProps = {
    style: {},
    buttonStyle: {},
    user: null,
    className: '',
    bsStyle: 'primary',
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
      intl,
      openRegistrationModal,
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
          aria-label={intl.formatMessage({ id: 'open.inscription_modal' })}
          className={`btn--registration ${className}`}>
          <FormattedMessage id="global.registration" />
        </Button>
        {/* $FlowFixMe */}
        <RegistrationModal />
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

const container = injectIntl(RegistrationButton);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(container);
