import React, { PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { VOTE_WIDGET_DISABLED, VOTE_WIDGET_BOTH } from '../../../constants/VoteConstants';
import VotePiechart from '../../Utils/VotePiechart';
import OpinionVotesBar from './OpinionVotesBar';
import OpinionVotesButtons from './OpinionVotesButtons';

const OpinionVotesBox = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getOpinionType() {
    return this.isVersion() ? this.props.opinion.parent.type : this.props.opinion.type;
  },

  isVersion() {
    return this.props.opinion && this.props.opinion.parent;
  },

  isContribuable() {
    return this.isVersion() ? this.props.opinion.parent.isContribuable : this.props.opinion.isContribuable;
  },

  showVotesButtons() {
    const widgetType = this.getOpinionType().voteWidgetType;
    return widgetType !== VOTE_WIDGET_DISABLED;
  },

  showPiechart() {
    const widgetType = this.getOpinionType().voteWidgetType;
    return this.props.opinion.votes.length > 0 && widgetType === VOTE_WIDGET_BOTH;
  },

  show() {
    const widgetType = this.getOpinionType().voteWidgetType;
    const { opinion } = this.props;
    return widgetType !== VOTE_WIDGET_DISABLED && (
        this.isContribuable()
        || opinion.votes.length > 0
        || this.getOpinionType().votesThreshold
      );
  },

  render() {
    if (!this.show()) {
      return null;
    }
    const { opinion } = this.props;
    const helpText = this.getOpinionType().votesHelpText;

    return (
      <div className="opinion__votes__box">
        {
          helpText && <p className="h4" style={{ marginBottom: '0' }}>{helpText}</p>
        }
        <Row>
          <Col sm={12} md={8} style={{ paddingTop: '15px' }}>
            <OpinionVotesButtons show={this.showVotesButtons()} disabled={!this.isContribuable()} opinion={opinion} />
            <OpinionVotesBar opinion={opinion} />
          </Col>
          {
            this.showPiechart()
              ? <Col sm={12} md={4}>
                <VotePiechart
                  top={20}
                  height={180}
                  ok={opinion.votes_ok}
                  nok={opinion.votes_nok}
                  mitige={opinion.votes_mitige}
                />
              </Col>
              : null
          }
        </Row>
      </div>
    );
  },

});

export default OpinionVotesBox;
