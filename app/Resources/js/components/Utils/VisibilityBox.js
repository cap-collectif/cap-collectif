// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Jumbotron } from 'react-bootstrap';
import classNames from 'classnames';
import LoginButton from '../User/Login/LoginButton';
import type { State } from '../../types';

type Props = {
  user?: ?Object,
  children: $FlowFixMe,
  enabled?: boolean,
};

export class VisibilityBox extends React.Component<Props> {
  static defaultProps = {
    user: null,
    enabled: false,
  };

  render() {
    const { user, children, enabled } = this.props;

    if (!enabled) {
      return children;
    }

    if (enabled && !user) {
      return (
        <Jumbotron className={{ 'p--centered': true }}>
          <p>
            <FormattedMessage id="proposal.private.show_login" />
          </p>
          <p>
            <LoginButton bsStyle="primary" />
          </p>
        </Jumbotron>
      );
    }

    const rootClasses = classNames({ PrivateList: true });
    const boxClasses = classNames({ PrivateList__box: true });

    return (
      <div className={rootClasses}>
        <p id="privateInfo">
          <i className="glyphicon glyphicon-lock" />{' '}
          <strong>
            <FormattedMessage id="proposal.private.message" />
          </strong>
        </p>
        <div className={boxClasses}>{children}</div>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  user: state.user.user,
});

export default connect(mapStateToProps)(VisibilityBox);
