import ProposalPreviewVote from './ProposalPreviewVote';
import ProposalDetailsButton from './ProposalDetailsButton';
import {VOTE_TYPE_DISABLED} from '../../../constants/ProposalConstants';
import React from 'react';
import {Row, Col} from 'react-bootstrap';
import {IntlMixin} from 'react-intl';

const ProposalPreviewButtons = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    selectionStepId: React.PropTypes.number,
    creditsLeft: React.PropTypes.number,
    voteType: React.PropTypes.number,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      selectionStepId: null,
      creditsLeft: null,
      voteType: VOTE_TYPE_DISABLED,
    };
  },

  render() {
    return (
      <Row className="proposal__buttons text-center" >
        <Col xs={6} sm={12} md={12} lg={12}>
          <ProposalPreviewVote {...this.props} />
        </Col>
        <Col xs={6} sm={12} md={12} lg={12}>
          <ProposalDetailsButton proposal={this.props.proposal} />
        </Col>
      </Row>
    );
  },

});

export default ProposalPreviewButtons;
