import React, { PropTypes } from 'react';
import ProposalDetailAdvancement from '../Detail/ProposalDetailAdvancement';

const ProposalPageAdvancement = React.createClass({
  displayName: 'ProposalPageAdvancement',

  propTypes: {
    proposal: PropTypes.object.isRequired
  },

  render() {
    const { proposal } = this.props;
    return (
      <div className="proposal__page__metadata">
        <div className="proposal__infos">
          <ProposalDetailAdvancement proposal={proposal} />
        </div>
      </div>
    );
  }
});

export default ProposalPageAdvancement;
