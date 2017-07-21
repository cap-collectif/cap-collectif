import React, { PropTypes } from 'react';
import { Panel } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

export const ProposalFusionList = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    type: PropTypes.oneOf(['From', 'Into']).isRequired,
  },

  render() {
    const { proposal, type } = this.props;
    const list = proposal[`fusionned${type}`];
    if (list.length === 0) {
      return null;
    }
    return (
      <Panel
        header={
          <FormattedMessage
            id={`proposal.fusionned${type}`}
            values={{ num: list.length }}
          />
        }>
        {list.map(p =>
          <div>
            <a href={p.url}>
              {p.title}
            </a>
          </div>,
        )}
      </Panel>
    );
  },
});

export default ProposalFusionList;
