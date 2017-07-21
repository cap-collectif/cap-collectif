// @flow
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ButtonToolbar } from 'react-bootstrap';
import ShareButtonDropdown from '../Utils/ShareButtonDropdown';
import OpinionVersionEditButton from './OpinionVersionEditButton';
import OpinionVersionEditModal from './OpinionVersionEditModal';
import OpinionReportButton from './OpinionReportButton';
import OpinionDelete from './Delete/OpinionDelete';
import OpinionEditButton from './OpinionEditButton';
import type { State } from '../../types';

const OpinionButtons = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
    user: PropTypes.object,
  },

  getDefaultProps() {
    return {
      user: null,
    };
  },

  isVersion() {
    const { opinion } = this.props;
    return !!opinion.parent;
  },

  isContribuable() {
    const { opinion } = this.props;
    return opinion.isContribuable;
  },

  isTheUserTheAuthor() {
    const { opinion, user } = this.props;
    if (opinion.author === null || !user) {
      return false;
    }
    return user.uniqueId === opinion.author.uniqueId;
  },

  renderEditButton() {
    const { opinion } = this.props;
    if (this.isContribuable() && this.isTheUserTheAuthor()) {
      if (this.isVersion()) {
        return (
          <OpinionVersionEditButton
            className="pull-right"
            style={{ marginLeft: '5px' }}
            opinionId={opinion.parent.id}
            version={opinion}
          />
        );
      }
      return (
        <OpinionEditButton
          className="opinion__action--edit pull-right btn--outline btn-dark-gray"
          opinion={opinion}
        />
      );
    }
  },

  render() {
    const opinion = this.props.opinion;
    return (
      <ButtonToolbar>
        <OpinionDelete opinion={opinion} />
        {this.renderEditButton()}
        <OpinionReportButton opinion={opinion} />
        <ShareButtonDropdown
          id="opinion-share-button"
          className="pull-right"
          title={opinion.title}
          url={opinion._links.show}
        />
        <OpinionVersionEditModal />
      </ButtonToolbar>
    );
  },
});

const mapStateToProps = (state: State) => ({
  features: state.default.features,
  user: state.user.user,
});

export default connect(mapStateToProps)(OpinionButtons);
