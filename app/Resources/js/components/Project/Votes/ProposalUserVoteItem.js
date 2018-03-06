// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Row, Col } from 'react-bootstrap';
import UserLink from '../../User/UserLink';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import ProposalDetailsEstimation from '../../Proposal/Detail/ProposalDetailEstimation';
import { deleteVote } from '../../../redux/modules/proposal';

export const ProposalUserVoteItem = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired
  },

  render() {
    const { step, proposal, dispatch } = this.props;

    const colWidth = proposal.district ? 2 : 3;

    return (
      <Row className="proposals-user-votes__row" id={`vote-step${step.id}-proposal${proposal.id}`}>
        <Col
          className="proposals-user-votes__col"
          md={colWidth === 3 ? colWidth + 1 : colWidth + 2}
          xs={12}>
          <a href={proposal._links.show}>{proposal.title}</a>
        </Col>
        <Col className="proposals-user-votes__col" md={colWidth} xs={12}>
          <i className="cap cap-user-2" />
          <UserLink user={proposal.author} />
        </Col>
        {proposal.district && (
          <Col className="proposals-user-votes__col" md={colWidth} xs={12}>
            <i className="cap cap-marker-1" />
            {proposal.district.name}
          </Col>
        )}
        <Col className="proposals-user-votes__col" md={colWidth} xs={12}>
          <ProposalDetailsEstimation
            proposal={proposal}
            showNullEstimation={step.voteType === VOTE_TYPE_BUDGET}
          />
        </Col>
        <Col className="proposals-user-votes__col" md={colWidth} xs={12}>
          <Button
            onClick={() => {
              deleteVote(dispatch, step, proposal);
            }}
            className="proposal-vote__delete"
            disabled={!step.open}>
            {<FormattedMessage id="project.votes.delete" />}
          </Button>
        </Col>
      </Row>
    );
  }
});

export default connect()(ProposalUserVoteItem);
