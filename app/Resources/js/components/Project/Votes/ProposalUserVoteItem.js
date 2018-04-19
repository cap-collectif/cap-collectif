// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Row, Col } from 'react-bootstrap';
import Toggle from 'react-toggle';
// import UserLink from '../../User/UserLink';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import ProposalDetailsEstimation from '../../Proposal/Detail/ProposalDetailEstimation';
import { deleteVote } from '../../../redux/modules/proposal';

export const ProposalUserVoteItem = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
    classment: PropTypes.number.isRequired,
  },

  render() {
    const { step, proposal, dispatch, classment } = this.props;


    const colWidth = () => {
      if(step.votesRanking === true && step.voteType === VOTE_TYPE_BUDGET) {
        return 6;
      }

      if(step.votesRanking === true) {
        return 8;
      }

      if(step.voteType === VOTE_TYPE_BUDGET) {
        return 7;
      }

      return 9;
    };

    // console.log(step);
    // console.warn(proposal);
    // console.error(classment);

    return (
      <Row className="proposals-user-votes__row d-flex" id={`vote-step${step.id}-proposal${proposal.id}`}>
        <Col md={1} xs={12} className="proposals-user-votes__col" >
          <div className="proposals-user-votes__content justify-content-between">
            <i className="cap cap-android-menu excerpt" />
            <div className="d-flex">
              <span className="badge label-primary m-auto">{classment + 1}</span>
            </div>
          </div>
        </Col>
        <Col
          className="proposals-user-votes__col"
          md={colWidth()}
          xs={12}>
          <div className="proposals-user-votes__content">
            <a href={proposal.show_url}>{proposal.title}</a>
          </div>
        </Col>
        <Col className="proposals-user-votes__col" md={2} xs={12}>
          <div className="proposals-user-votes__content justify-content-end">
            <div className="d-flex">
              <FormattedMessage id="public" />
              <Toggle
                className="ml-10"
                // checked={proposal}
                // onChange={() => {}}
              />
            </div>
          </div>
        </Col>
        {/*<Col className="proposals-user-votes__col" md={2} xs={12}>*/}
          {/*<div className="proposals-user-votes__content">*/}
            {/*<div>*/}
              {/*<span className="label label-primary">*/}
                {/*Soumis au vote*/}
              {/*</span>*/}
            {/*</div>*/}
          {/*</div>*/}
        {/*</Col>*/}
        {step.voteType === VOTE_TYPE_BUDGET &&
          <Col className="proposals-user-votes__col" md={2} xs={12}>
            <div className="proposals-user-votes__content justify-content-center">
              <ProposalDetailsEstimation
                proposal={proposal}
                showNullEstimation={step.voteType === VOTE_TYPE_BUDGET}
              />
            </div>
          </Col>
        }
        <Col className="proposals-user-votes__col" md={1} xs={12}>
          <a
            onClick={() => {
              deleteVote(dispatch, step, proposal);
            }}
            className="proposal-vote__delete"
            disabled={!step.open}>
            <i className="cap cap-ios-close" />
          </a>
        </Col>
      </Row>
    );
  },
});

export default connect()(ProposalUserVoteItem);
