import React from 'react';
import { IntlMixin } from 'react-intl';

import ShareButtonDropdown from '../Utils/ShareButtonDropdown';
import LoginStore from '../../stores/LoginStore';
import OpinionVersionForm from './OpinionVersionForm';
import OpinionReportButton from './OpinionReportButton';
import { ButtonToolbar, Button } from 'react-bootstrap';
import OpinionDelete from './Delete/OpinionDelete';

const OpinionButtons = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  isVersion() {
    return !!this.props.opinion.parent;
  },

  isContribuable() {
    return this.isVersion() ? this.props.opinion.parent.isContribuable : this.props.opinion.isContribuable;
  },

  isTheUserTheAuthor() {
    if (this.props.opinion.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.opinion.author.uniqueId;
  },

  renderEditButton() {
    if (this.isContribuable() && this.isTheUserTheAuthor()) {
      if (this.isVersion()) {
        return (
          <OpinionVersionForm
            className="pull-right"
            style={{ marginLeft: '5px' }}
            mode="edit"
            opinionId={this.props.opinion.parent.id}
            version={this.props.opinion}
            isContribuable
          />
        );
      }
      return (
        <Button className="opinion__action--edit pull-right btn--outline btn-dark-gray" href={this.props.opinion._links.edit}>
          <i className="cap cap-pencil-1"></i> {this.getIntlMessage('global.edit')}
        </Button>
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
        <ShareButtonDropdown className="pull-right" title={opinion.title} url={opinion._links.show} />
      </ButtonToolbar>
    );
  },

});

export default OpinionButtons;
