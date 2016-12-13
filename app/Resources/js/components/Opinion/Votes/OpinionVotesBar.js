// @flow
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
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
    const { opinion } = this.props;
    return (
      <div>
        {
          this.getOpinionType().votesThreshold &&
            <VotesBar
              max={this.getOpinionType().votesThreshold}
              value={opinion.votesCountOk}
              helpText={this.getOpinionType().votesThresholdHelpText}
            />
        }
        <div style={{ paddingTop: '20px' }}>
          {
            opinion.votes.map((vote, index) => {
              return <OpinionUserVote key={index} vote={vote} style={{ marginRight: 5 }} />;
            })
          }
          <OpinionVotesModal opinion={opinion} />
        </div>
        <div>
          <FormattedMessage message={this.getIntlMessage('global.votes')} num={opinion.votesCount} />
        </div>
      </div>
    );
  },
});

const mapStateToProps = ({ opinion: { opinionsById, versionsById } }, { opinion }) => ({
  opinion: {
    ...opinion,
    ...(Object.keys(opinionsById).length ? opinionsById[opinion.id] : versionsById[opinion.id]),
  },
});

export default connect(mapStateToProps)(OpinionVotesBar);
