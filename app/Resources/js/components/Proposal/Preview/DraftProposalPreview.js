// @flow
import * as React from 'react';

type Props = {
  proposal: Object,
};

export default class DraftProposalPreview extends React.Component<Props> {
  render() {
    const { proposal } = this.props;

    return (
      <li className="list-group-item">
        <a href={proposal.show_url ? proposal.show_url : proposal._links.show}>{proposal.title}</a>
      </li>
    );
  }
}
