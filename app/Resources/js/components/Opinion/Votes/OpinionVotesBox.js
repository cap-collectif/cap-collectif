// @flow
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { VOTE_WIDGET_DISABLED, VOTE_WIDGET_BOTH } from '../../../constants/VoteConstants';
import VotePiechart from '../../Utils/VotePiechart';
import OpinionVotesBar from './OpinionVotesBar';
import OpinionVotesButtons from './OpinionVotesButtons';
import type { OpinionVotesBox_opinion } from './__generated__/OpinionVotesBox_opinion.graphql';

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
            <OpinionVotesButtons show disabled={!opinion.contribuable} opinion={opinion} />
            {/* $FlowFixMe */}
            <OpinionVotesBar opinion={opinion} />
          </Col>
          {opinion.votesCount &&
            opinion.votesCount > 0 &&
            widgetType === VOTE_WIDGET_BOTH && (
              <Col sm={12} md={4}>
                <VotePiechart
                  top={20}
                  height={'180px'}
                  width={'200px'}
                  ok={opinion.votesCountOk}
                  nok={opinion.votesCountNok}
                  mitige={opinion.votesCountMitige}
                />
              </Col>
            )}
        </Row>
      </div>
    );
  }
}

export default createFragmentContainer(OpinionVotesBox, {
  opinion: graphql`
    fragment OpinionVotesBox_opinion on OpinionOrVersion {
      ...OpinionVotesButtons_opinion
      ...OpinionVotesBar_opinion
      ... on Opinion {
        votesCountMitige
        votesCountNok
        votesCountOk
        votesCount
        contribuable
        section {
          voteWidgetType
          votesHelpText
        }
      }
      ... on Version {
        votesCountMitige
        votesCountNok
        votesCountOk
        votesCount
        contribuable
        section {
          voteWidgetType
          votesHelpText
        }
      }
    }
  `,
});
