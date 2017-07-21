import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import LoginOverlay from '../../Utils/LoginOverlay';

const ArgumentVoteButton = React.createClass({
  propTypes: {
    hasVoted: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    argument: PropTypes.object.isRequired,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  isTheUserTheAuthor() {
    const { argument, user } = this.props;
    if (argument.author === null || !user) {
      return false;
    }
    return user.uniqueId === argument.author.uniqueId;
  },

  render() {
    const { hasVoted, onClick, argument } = this.props;
    return (
      <LoginOverlay>
        <Button
          disabled={!argument.isContribuable || this.isTheUserTheAuthor()}
          bsStyle={hasVoted ? 'danger' : 'success'}
          className={`argument__btn--vote${hasVoted ? '' : ' btn--outline'}`}
          bsSize="xsmall"
          onClick={onClick}
        >
          {hasVoted
            ? <span>{this.getIntlMessage('vote.cancel')}</span>
            : <span>
                <i className="cap cap-hand-like-2"></i>
                {' '}
                {this.getIntlMessage('vote.ok')}
            </span>
          }
        </Button>
      </LoginOverlay>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(ArgumentVoteButton);
