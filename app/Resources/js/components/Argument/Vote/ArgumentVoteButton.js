import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import LoginOverlay from '../../Utils/LoginOverlay';
import { connect } from 'react-redux';

const ArgumentVoteButton = React.createClass({
  propTypes: {
    hasVoted: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    argument: PropTypes.object.isRequired,
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
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
    const { hasVoted, onClick, user, features, argument } = this.props;
    return (
      <LoginOverlay user={user} features={features}>
        <Button
          disabled={!argument.isContribuable || this.isTheUserTheAuthor()}
          bsStyle={hasVoted ? 'danger' : 'success'}
          className={'argument__btn--vote' + (hasVoted ? '' : ' btn--outline')}
          bsSize="xsmall"
          onClick={user ? onClick : null}
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
    features: state.features,
    user: state.user,
  };
};

export default connect(mapStateToProps)(ArgumentVoteButton);
