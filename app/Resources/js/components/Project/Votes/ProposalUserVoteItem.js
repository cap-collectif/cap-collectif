// @flow
import React, { PropTypes } from 'react';
import {FormattedDate, FormattedMessage, FormattedTime} from 'react-intl';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import {Field} from "redux-form";
import Toggle from 'react-toggle';
// import UserLink from '../../User/UserLink';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import toggle from '../../Form/Toggle';
import ProposalDetailsEstimation from '../../Proposal/Detail/ProposalDetailEstimation';
import { deleteVote } from '../../../redux/modules/proposal';

export const ProposalUserVoteItem = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    node: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
    classment: PropTypes.number.isRequired,
  },

  render() {
    const { step, node, dispatch, classment } = this.props;
    const proposal = node.proposal;
    const anonymous = node.anonymous;
    const voteAt = node.createdAt;

    console.log(anonymous);

    const voteDay = (
      <FormattedDate value={voteAt} day="numeric" month="long" year="numeric" />
    );
    const voteTime = <FormattedTime value={voteAt} hour="numeric" minute="numeric" />;


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

    return (
      <Row className="proposals-user-votes__row d-flex flex-wrap" id={`vote-step${step.id}-proposal${proposal.id}`}>
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
            <div>
              <a
                href={proposal.show_url}
                className="proposals-user-votes__title"
              >
                {proposal.title}
              </a>
              <br />
              {voteAt &&
              <FormattedMessage
                id="voted-on-date-at-time"
                values={{
                  date: voteDay,
                  time: voteTime,
                }}
              />
              }
            </div>
          </div>
        </Col>
        <Col className="proposals-user-votes__col" md={2} xs={12}>
          <div className="proposals-user-votes__content justify-content-end">
            <div className="d-flex">
              <FormattedMessage id="public" />
              <Field component={toggle}
                className="ml-10"
                name="anonymous"
                checked={!anonymous}
                // onChange={() => {}}
              />
            </div>
          </div>
        </Col>
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
