import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Button } from 'react-bootstrap';
import classNames from 'classnames';
import { IntlMixin, FormattedMessage } from 'react-intl';
import { fetchIdeaVotes, VOTES_PREVIEW_COUNT } from '../../../redux/modules/idea';
import UserBox from '../../User/UserBox';
import AllVotesModal from '../../Votes/AllVotesModal';

export const IdeaPageVotes = React.createClass({
  propTypes: {
    fetchIdeaVotes: PropTypes.func.isRequired,
    idea: PropTypes.object.isRequired,
    className: PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
    };
  },

  getInitialState() {
    return {
      showModal: false,
    };
  },

  componentDidMount() {
    this.props.fetchIdeaVotes(this.props.idea.id);
  },

  showModal() {
    this.toggleModal(true);
  },

  toggleModal(value) {
    this.setState({
      showModal: value,
    });
  },

  render() {
    const { idea, className } = this.props;
    const { showModal } = this.state;
    const votesToDisplay = idea.votes.slice(0, VOTES_PREVIEW_COUNT);
    const hasMoreVotes = idea.votesCount - VOTES_PREVIEW_COUNT > 0;

    if (!idea.votesCount) {
      return null;
    }

    const classes = {
      idea__votes: true,
      [className]: true,
    };

    return (
      <div id="votes" className={classNames(classes)}>
        <h2>
          <FormattedMessage
            message={this.getIntlMessage('idea.vote.count')}
            num={idea.votesCount}
          />
        </h2>
        <Row>
          {
            votesToDisplay.map((vote, index) => {
              return <UserBox key={index} user={vote.user} username={vote.username} className="idea__vote" />;
            })
          }
        </Row>
        {
          hasMoreVotes &&
          <Button
              bsStyle="primary"
              onClick={this.showModal}
              className="btn--outline idea__votes__show-more"
          >
            {this.getIntlMessage('idea.vote.show_more')}
          </Button>
        }
        <AllVotesModal
          votes={idea.votes}
          onToggleModal={this.toggleModal}
          showModal={showModal}
        />
      </div>
    );
  },

});

const mapDispatchToProps = (dispatch) => {
  return {
    fetchIdeaVotes: ideaId => dispatch(fetchIdeaVotes(ideaId)),
  };
};

export default connect(null, mapDispatchToProps)(IdeaPageVotes);
