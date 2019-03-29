// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import type { ProposalDetailLikersLabel_proposal } from './__generated__/ProposalDetailLikersLabel_proposal.graphql';

type Props = { proposal: ProposalDetailLikersLabel_proposal };

export class ProposalDetailLikersLabel extends React.Component<Props> {
  render() {
    const { proposal } = this.props;
    const funcProps = {
      onFocus: () => {},
      onBlur: () => {},
      onMouseOver: () => {},
      onMouseOut: () => {},
    };

    if (proposal.likers.length > 0) {
      return (
        <span {...funcProps}>
          <i className="cap cap-heart-1 icon--red" />
          <FormattedMessage
            id="proposal.likers.count"
            values={{
              num: proposal.likers.length,
            }}
          />
        </span>
      );
    }
    return null;
  }
}

export default createFragmentContainer(ProposalDetailLikersLabel, {
  proposal: graphql`
    fragment ProposalDetailLikersLabel_proposal on Proposal {
      id
      likers {
        id
      }
    }
  `,
});
