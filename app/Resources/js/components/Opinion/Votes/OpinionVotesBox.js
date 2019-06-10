// @flow
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { VOTE_WIDGET_DISABLED, VOTE_WIDGET_BOTH } from '../../../constants/VoteConstants';
import VotePiechart from '../../Utils/VotePiechart';
import OpinionVotesBar from './OpinionVotesBar';
import OpinionVotesButtons from './OpinionVotesButtons';
import type { OpinionVotesBox_opinion } from '~relay/OpinionVotesBox_opinion.graphql';

type Props = { opinion: OpinionVotesBox_opinion };

class OpinionVotesBox extends React.Component<Props> {
  render() {
    const { opinion } = this.props;
    if (!opinion || !opinion.section || opinion.section.voteWidgetType === VOTE_WIDGET_DISABLED) {
      return null;
    }
    const helpText = opinion.section.votesHelpText;
    const widgetType = opinion.section && opinion.section.voteWidgetType;
    return (
      <div className="opinion__votes__box">
        {helpText && (
          <p className="h4" style={{ marginBottom: '0' }}>
            {helpText}
          </p>
        )}
        <Row>
          <Col sm={12} md={8} style={{ paddingTop: '15px' }}>
            {/* $FlowFixMe */}
            <OpinionVotesButtons opinion={opinion} />
            {/* $FlowFixMe */}
            <OpinionVotesBar opinion={opinion} />
          </Col>
          {opinion.votes &&
          opinion.votes.totalCount &&
          opinion.votes.totalCount > 0 &&
          widgetType === VOTE_WIDGET_BOTH ? (
            <Col sm={12} md={4}>
              {/* $FlowFixMe */}
              <VotePiechart
                height="145px"
                width="150px"
                innerRadius={15}
                outerRadius={60}
                ok={opinion.votesYes ? opinion.votesYes.totalCount : 0}
                nok={opinion.votesNo ? opinion.votesNo.totalCount : 0}
                mitige={opinion.votesMitige ? opinion.votesMitige.totalCount : 0}
              />
            </Col>
          ) : null}
        </Row>
      </div>
    );
  }
}

export default createFragmentContainer(OpinionVotesBox, {
  opinion: graphql`
    fragment OpinionVotesBox_opinion on OpinionOrVersion
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...OpinionVotesButtons_opinion @arguments(isAuthenticated: $isAuthenticated)
      ...OpinionVotesBar_opinion
      ... on Opinion {
        votes(first: 0) {
          totalCount
        }
        votesYes: votes(first: 0, value: YES) {
          totalCount
        }
        votesNo: votes(first: 0, value: NO) {
          totalCount
        }
        votesMitige: votes(first: 0, value: MITIGE) {
          totalCount
        }
        section {
          voteWidgetType
          votesHelpText
        }
      }
      ... on Version {
        votes(first: 0) {
          totalCount
        }
        votesYes: votes(first: 0, value: YES) {
          totalCount
        }
        votesNo: votes(first: 0, value: NO) {
          totalCount
        }
        votesMitige: votes(first: 0, value: MITIGE) {
          totalCount
        }
        section {
          voteWidgetType
          votesHelpText
        }
      }
    }
  `,
});
