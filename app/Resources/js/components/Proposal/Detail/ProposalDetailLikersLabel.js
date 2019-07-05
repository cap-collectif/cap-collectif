// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import Tag from '../../Ui/Labels/Tag';
import type { ProposalDetailLikersLabel_proposal } from '~relay/ProposalDetailLikersLabel_proposal.graphql';

type Props = {
  proposal: ProposalDetailLikersLabel_proposal,
  componentClass: string,
  title: string,
  onClick: Function,
  size?: string,
};

export class ProposalDetailLikersLabel extends React.Component<Props> {
  static defaultProps = {
    componentClass: 'a',
  };

  render() {
    const { size, proposal, componentClass, title, onClick } = this.props;

    if (proposal.likers.length > 0) {
      return (
        <Tag
          size={size}
          as={componentClass}
          title={title}
          onClick={onClick}
          icon="cap cap-heart-1 icon--red">
          <FormattedMessage
            id="proposal.likers.count"
            values={{
              num: proposal.likers.length,
            }}
          />
        </Tag>
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
