// @flow
import React from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import type { State } from '../../types';
import { baseUrl } from '../../config';

type Props = {|
  user: ?{|
    username: string,
  |},
|};

export class SSOSwitchUserPage extends React.Component<Props> {
  static defaultProps = {
    user: null,
  };

  render() {
    const { user } = this.props;

    if (!user) {
      window.location.href = `${baseUrl}`;
    }

    return (
      <div className="col-md-4 col-md-offset-4 panel panel-default bg-white">
        <div className="panel-body">
          <Button
            bsStyle="primary"
            className="w-100"
            onClick={() => {
              window.location.href = `${baseUrl}`;
            }}>
            {
              <FormattedHTMLMessage
                id="continue-as-sso-connected-user"
                values={{ SsoConnectedUsername: user ? `${user.username}` : '' }}
              />
            }
          </Button>
          <p className="mt-15 mb-0 text-center">
            <a href="/logout?ssoSwitchUser=true">{<FormattedMessage id="change-user" />}</a>
          </p>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  user: state.user.user,
});
const connector = connect(mapStateToProps);
export default connector(SSOSwitchUserPage);
