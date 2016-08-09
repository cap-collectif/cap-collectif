import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';

import ShareButtonDropdown from '../Utils/ShareButtonDropdown';
import OpinionVersionForm from './OpinionVersionForm';
import OpinionReportButton from './OpinionReportButton';
import { ButtonToolbar } from 'react-bootstrap';
import OpinionDelete from './Delete/OpinionDelete';
import OpinionEditButton from './OpinionEditButton';

const OpinionButtons = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

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
    return this.isVersion() ? opinion.parent.isContribuable : opinion.isContribuable;
  },

  isTheUserTheAuthor() {
    const {
      opinion,
      user,
    } = this.props;
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
          <OpinionVersionForm
            className="pull-right"
            style={{ marginLeft: '5px' }}
            mode="edit"
            opinionId={opinion.parent.id}
            version={opinion}
            isContribuable
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
      </ButtonToolbar>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    features: state.default.features,
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(OpinionButtons);
