import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlMixin, FormattedMessage } from 'react-intl';
import OpinionUserVote from './OpinionUserVote';
import VotesBar from '../../Utils/VotesBar';
import OpinionVotesModal from './OpinionVotesModal';

const OpinionVotesBar = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
    votes: PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  getOpinionType() {
    const { opinion } = this.props;
    return opinion.parent ? opinion.parent.type : opinion.type;
  },

  render() {
    const { opinion, votes } = this.props;

    return (
      <div>
        {
          this.getOpinionType().votesThreshold &&
            <VotesBar
              max={this.getOpinionType().votesThreshold}
              value={opinion.votes_ok}
              helpText={this.getOpinionType().votesThresholdHelpText}
            />
        }
        <div style={{ paddingTop: '20px' }}>
          {
            votes.map((vote, index) => {
              return <OpinionUserVote key={index} vote={vote} style={{ marginRight: 5 }} />;
            })
          }
          <OpinionVotesModal opinion={opinion} />
        </div>
        <div>
          <FormattedMessage message={this.getIntlMessage('global.votes')} num={votes.length} />
        </div>
      </div>
    );
  },
});

const mapStateToProps = (state, props) => {
  return {
    votes: state.opinion.opinions[props.opinion.id].votes,
  };
};

export default connect(mapStateToProps)(OpinionVotesBar);
