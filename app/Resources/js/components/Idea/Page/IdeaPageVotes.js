import React from 'react';
import { Row, Button } from 'react-bootstrap';
import classNames from 'classnames';
import { IntlMixin, FormattedMessage } from 'react-intl';
import UserBox from '../../User/UserBox';
import AllVotesModal from '../../Votes/AllVotesModal';
import IdeaStore from '../../../stores/IdeaStore';
import { IDEA_VOTES_TO_SHOW } from '../../../constants/IdeaConstants';

const IdeaPageVotes = React.createClass({
  propTypes: {
    idea: React.PropTypes.object.isRequired,
    votes: React.PropTypes.array.isRequired,
    className: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
    };
  },

  getInitialState() {
    const {
      idea,
      votes,
    } = this.props;
    return {
      votes: votes,
      votesCount: idea.votesCount,
      showModal: false,
    };
  },

  componentWillMount() {
    IdeaStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    IdeaStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      votes: IdeaStore.votes,
      votesCount: IdeaStore.votesCount,
    });
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
    const { className } = this.props;
    const votesToDisplay = this.state.votes.slice(0, IDEA_VOTES_TO_SHOW);
    const moreVotes = this.state.votesCount - IDEA_VOTES_TO_SHOW > 0;

    if (!this.state.votesCount) {
      return null;
    }

    const classes = {
      idea__votes: true,
    };
    classes[className] = true;

    return (
      <div id="votes" className={classNames(classes)}>
        <h2>
          <FormattedMessage
            message={this.getIntlMessage('idea.vote.count')}
            num={this.state.votesCount}
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
          moreVotes
          ? <Button
              bsStyle="primary"
              onClick={this.showModal}
              className="btn--outline idea__votes__show-more"
          >
            {this.getIntlMessage('idea.vote.show_more')}
          </Button>
          : null
        }
        <AllVotesModal
          votes={this.state.votes}
          onToggleModal={this.toggleModal}
          showModal={this.state.showModal}
        />
      </div>
    );
  },

});

export default IdeaPageVotes;
