// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import type { TrashedMessage_contribution } from './__generated__/TrashedMessage_contribution.graphql';

type Props = {
  contribution: TrashedMessage_contribution,
  className?: string,
  children: any,
};

class TrashedMessage extends React.Component<Props> {
  render() {
    const { contribution, children, className } = this.props;

    return contribution.trashedStatus === 'INVISIBLE' ? (
      <div className={className}>
        <FormattedMessage id="hidden-content" />
      </div>
    ) : (
      children
    );
  }
}

export default createFragmentContainer(
  TrashedMessage,
  graphql`
    fragment TrashedMessage_contribution on Trashable {
      trashedStatus
    }
  `,
);
