// @flow
import * as React from 'react';
import cn from 'classnames';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import LoginOverlay from '../Utils/LoginOverlay';
import type { State, User } from '~/types';
import type { BsStyle } from '~/types/ReactBootstrap.type';

type Props = {
  id?: ?string,
  onSubmit?: Function,
  // Default props not working
  isSubmitting?: boolean,
  label: string,
  bsStyle: BsStyle,
  className: string,
  loading: string,
  style: Object,
  disabled: boolean,
  loginOverlay: boolean,
  user?: User,
  children?: any,
  ariaLabel?: string,
};

class SubmitButton extends React.Component<Props> {
  static defaultProps = {
    label: 'global.send',
    bsStyle: 'primary',
    loading: 'global.loading',
    className: '',
    style: {},
    disabled: false,
    loginOverlay: false,
  };

  onClick = () => {
    const { isSubmitting, loginOverlay, onSubmit, user } = this.props;
    if ((loginOverlay && !user) || isSubmitting) {
      return null;
    }
    if (onSubmit) {
      onSubmit();
    }
  };

  render() {
    const {
      loginOverlay,
      isSubmitting,
      bsStyle,
      className,
      id,
      label,
      disabled,
      style,
      children,
      loading,
      ariaLabel,
    } = this.props;
    return (
      <LoginOverlay enabled={loginOverlay}>
        <button
          type="submit"
          id={id}
          disabled={isSubmitting || disabled}
          onClick={this.onClick}
          className={cn(`btn btn-${bsStyle}`, className)}
          style={style}
          aria-label={ariaLabel}>
          {children}
          <FormattedMessage id={isSubmitting ? loading : label} />
        </button>
      </LoginOverlay>
    );
  }
}

const mapStateToProps = (state: State) => ({
  user: state.user.user,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(SubmitButton);
