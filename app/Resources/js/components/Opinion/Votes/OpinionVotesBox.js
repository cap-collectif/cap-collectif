import React, { PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { VOTE_WIDGET_DISABLED, VOTE_WIDGET_BOTH } from '../../../constants/VoteConstants';
import { fetchOpinionVotes } from '../../../redux/modules/opinion';
import VotePiechart from '../../Utils/VotePiechart';
import OpinionVotesBar from './OpinionVotesBar';
import OpinionVotesButtons from './OpinionVotesButtons';
import { connect } from 'react-redux';

const OpinionVotesBox = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
    fetchOpinionVotes: PropTypes.func.isRequired,
    votes: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  componentDidMount() {
    this.props.fetchOpinionVotes(this.props.opinion.id);
    console.log(this.props.votes);
  },

  getOpinionType() {
    const { opinion } = this.props;
    return this.isVersion() ? opinion.parent.type : opinion.type;
  },

  isVersion() {
    const { opinion } = this.props;
    return opinion && opinion.parent;
  },

  isContribuable() {
    const { opinion } = this.props;
    return this.isVersion() ? opinion.parent.isContribuable : opinion.isContribuable;
  },

  showVotesButtons() {
    const widgetType = this.getOpinionType().voteWidgetType;
    return widgetType !== VOTE_WIDGET_DISABLED;
  },

  showPiechart() {
    const { opinion } = this.props;
    const widgetType = this.getOpinionType().voteWidgetType;
    return opinion.votes.length > 0 && widgetType === VOTE_WIDGET_BOTH;
  },

  render() {
    if (this.getOpinionType().voteWidgetType === VOTE_WIDGET_DISABLED) {
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
            <OpinionVotesButtons show disabled={!this.isContribuable()} opinion={opinion} />
            <OpinionVotesBar opinion={opinion} />
          </Col>
          {
            this.showPiechart() &&
              <Col sm={12} md={4}>
                <VotePiechart
                  top={20}
                  height={'180px'}
                  width={'200px'}
                  ok={opinion.votes_ok}
                  nok={opinion.votes_nok}
                  mitige={opinion.votes_mitige}
                />
              </Col>
          }
        </Row>
      </div>
    );
  },

});

const mapStateToProps = (state, props) => {
  return {
    votes: state.opinion.opinions[props.opinion.id],
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchOpinionVotes: (opinionId) => dispatch(fetchOpinionVotes(opinionId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OpinionVotesBox);
