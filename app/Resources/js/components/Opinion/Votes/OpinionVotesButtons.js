import React from 'react';
import { IntlMixin } from 'react-intl';

import LoginStore from '../../../stores/LoginStore';
import OpinionVotesButton from './OpinionVotesButton';
import { ButtonToolbar } from 'react-bootstrap';

const OpinionVotesButtons = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    show: React.PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  isTheUserTheAuthor() {
    if (this.props.opinion.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.opinion.author.uniqueId;
  },

  render() {
    if (!this.props.show) {
      return null;
    }
    const opinion = this.props.opinion;
    return (
      <ButtonToolbar className="opinion__votes__buttons">
        <OpinionVotesButton opinion={opinion} value={1} />
        <OpinionVotesButton opinion={opinion} value={0} />
        <OpinionVotesButton opinion={opinion} value={-1} />
      </ButtonToolbar>
    );
  },

});

export default OpinionVotesButtons;
