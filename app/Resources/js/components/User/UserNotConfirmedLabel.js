// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Label } from 'react-bootstrap';
import type { UserNotConfirmedLabel_user } from './__generated__/UserNotConfirmedLabel_user.graphql';

type Props = {
  user: UserNotConfirmedLabel_user,
};

export class UserNotConfirmedLabel extends React.Component<Props> {
  render() {
    const { user } = this.props;
    if (user.isEmailConfirmed) {
      return null;
    }
    return (
      <span>
        {' '}
        <Label bsStyle="danger">
          <i className="cap cap-delete-2" /> <FormattedMessage id="not-verified" />
        </Label>
      </span>
    );
  }
}

export default createFragmentContainer(UserNotConfirmedLabel, {
  user: graphql`
    fragment UserNotConfirmedLabel_user on User {
      isEmailConfirmed
    }
  `,
});
