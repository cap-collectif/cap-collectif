// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import LoginOverlay from '../Utils/LoginOverlay';
import type { State } from '../../types';

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
  user: Object,
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
    const { loginOverlay, isSubmitting, bsStyle, className, id, label, style } = this.props;
    const disabled = isSubmitting || this.props.disabled;
    return (
      <LoginOverlay enabled={loginOverlay}>
        <Button
          id={id}
          type="submit"
          disabled={disabled}
          onClick={this.onClick}
          bsStyle={bsStyle}
          className={className}
          style={style}>
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
