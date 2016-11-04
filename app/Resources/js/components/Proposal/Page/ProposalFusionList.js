import React, { PropTypes } from 'react';
import { Panel } from 'react-bootstrap';
import { IntlMixin, FormattedMessage } from 'react-intl';

export const ProposalFusionList = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    type: PropTypes.oneOf(['From', 'Into']).isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { proposal, type } = this.props;
    const list = proposal[`fusionned${type}`];
    if (list.length === 0) {
      return null;
    }
    return (
          <Panel header={
            <FormattedMessage
              message={this.getIntlMessage(`proposal.fusionned${type}`)}
              num={list.length}
            />
          }
          >
            {
              list.map(p => <div><a href={p.url}>{p.title}</a></div>)
            }
          </Panel>
    );
  },

});

export default ProposalFusionList;
