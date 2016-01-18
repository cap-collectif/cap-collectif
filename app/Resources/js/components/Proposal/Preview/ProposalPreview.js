import React from 'react';
import {IntlMixin} from 'react-intl';
import {Col} from 'react-bootstrap';
import classNames from 'classnames';

import ProposalPreviewHeader from './ProposalPreviewHeader';
import ProposalPreviewBody from './ProposalPreviewBody';
import ProposalPreviewButtons from './ProposalPreviewButtons';
import ProposalPreviewFooter from './ProposalPreviewFooter';

const ProposalPreview = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    selectionStepId: React.PropTypes.number,
    creditsLeft: React.PropTypes.number,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      selectionStepId: null,
      creditsLeft: null,
    };
  },

  render() {
    const proposal = this.props.proposal;
    const classes = classNames({
      'box': true,
      'bg-vip': proposal.author && proposal.author.vip,
    });

    return (
      <Col componentClass="li" xs={12} sm={6} md={4}>
        <div id={'proposal-' + proposal.id} className="block block--bordered proposal__preview">
          <div className={classes}>
            <ProposalPreviewHeader proposal={proposal} />
            <ProposalPreviewBody proposal={proposal} />
            <ProposalPreviewButtons {...this.props} />
          </div>
          <ProposalPreviewFooter {...this.props} />
        </div>
      </Col>
    );
  },

});

export default ProposalPreview;
