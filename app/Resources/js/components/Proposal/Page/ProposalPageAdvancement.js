import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import ProposalDetailAdvancement from '../Detail/ProposalDetailAdvancement';

const ProposalPageAdvancement = React.createClass({
  displayName: 'ProposalPageAdvancement',
  propTypes: {
    proposal: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { proposal } = this.props;
    return (
      <div className="proposal__page__metadata">
        <div className="proposal__infos">
          <ProposalDetailAdvancement
            proposal={proposal}
          />
        </div>
      </div>
    );
  },

});

export default ProposalPageAdvancement;
