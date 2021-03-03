// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useAnalytics } from 'use-analytics';
import { showRegistrationModal } from '~/redux/modules/user';
import type { State, Dispatch } from '~/types';
import type { BsStyle } from '~/types/ReactBootstrap.type';

type Props = {
  features: Object,
  style?: ?Object,
  user?: ?Object,
  className?: string,
  bsStyle?: BsStyle,
  buttonStyle?: ?Object,
  openRegistrationModal: () => void,
  intl: IntlShape,
};

export const RegistrationButton = ({
  bsStyle = 'primary',
  buttonStyle = {},
  className = '',
  features,
  style = {},
  user = null,
  intl,
  openRegistrationModal,
}: Props) => {
  const { track } = useAnalytics();

  if (!features.registration || !!user) {
    return null;
  }
  return (
    <span style={style}>
      <Button
        style={buttonStyle}
        onClick={() => {
          track('registration_click', { source: 'button' });
          openRegistrationModal();
        }}
        bsStyle={bsStyle}
        aria-label={intl.formatMessage({ id: 'open.inscription_modal' })}
        className={`btn--registration ${className}`}>
        <FormattedMessage id="global.registration" />
      </Button>
    </span>
  );
};

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

export default connect<any, any, _, _, _, _>(mapStateToProps, mapDispatchToProps)(container);
