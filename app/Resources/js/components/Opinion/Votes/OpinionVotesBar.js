import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import OpinionUserVote from './OpinionUserVote';
import VotesBar from '../../Utils/VotesBar';
import OpinionVotesModal from './OpinionVotesModal';

const OpinionVotesBar = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getOpinionType() {
    const { opinion } = this.props;
    return opinion.parent ? opinion.parent.type : opinion.type;
  },

  render() {
    const opinion = this.props.opinion;
    const votes = opinion.votes;

    return (
      <div>
        {this.getOpinionType().votesThreshold
          ? <VotesBar
              max={this.getOpinionType().votesThreshold}
              value={opinion.votes_ok}
              helpText={this.getOpinionType().votesThresholdHelpText}
          />
          : null
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
          <FormattedMessage message={this.getIntlMessage('global.votes')} num={opinion.votes_total} />
        </div>
      </div>
    );
  },

});

export default OpinionVotesBar;
