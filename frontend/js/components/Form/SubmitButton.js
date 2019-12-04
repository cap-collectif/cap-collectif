// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import LoginOverlay from '../Utils/LoginOverlay';
import type { State, User } from '../../types';

type Props = {
  id?: ?string,
  onSubmit: Function,
  // Default props not working
  isSubmitting?: boolean,
  label: string,
  bsStyle: string,
  className: string,
  style: Object,
  disabled: boolean,
  loginOverlay: boolean,
  user?: User,
  children?: any,
};

class SubmitButton extends React.Component<Props> {
  static defaultProps = {
    label: 'global.publish',
    bsStyle: 'primary',
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
    onSubmit();
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
    } = this.props;
    return (
      <LoginOverlay enabled={loginOverlay}>
        <Button
          id={id}
          type="submit"
          disabled={isSubmitting || disabled}
          onClick={this.onClick}
          bsStyle={bsStyle}
          className={className}
          style={style}>
          {children}
          <FormattedMessage id={isSubmitting ? 'global.loading' : label} />
        </Button>
      </LoginOverlay>
    );
  }
}

const mapStateToProps = (state: State) => ({
  user: state.user.user,
});

export default connect(mapStateToProps)(SubmitButton);
