import {VOTE_WIDGET_SIMPLE, VOTE_WIDGET_BOTH} from '../../constants/VoteConstants';

import OpinionActions from '../../actions/OpinionActions';
import LoginOverlay from '../Utils/LoginOverlay';
import ShareButtonDropdown from '../Utils/ShareButtonDropdown';
import LoginStore from '../../stores/LoginStore';
import OpinionVersionForm from './OpinionVersionForm';
import OpinionReportButton from './OpinionReportButton';

const ButtonToolbar = ReactBootstrap.ButtonToolbar;
const Button = ReactBootstrap.Button;

const OpinionButtons = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  isVersion() {
    return !!this.props.opinion.parent;
  },

  isContribuable() {
    return this.isVersion() ? this.props.opinion.parent.isContribuable : this.props.opinion.isContribuable;
  },

  isCurrentVote(value) {
    return value === this.props.opinion.user_vote;
  },

  vote(value) {
    if (this.isVersion()) {
      OpinionActions.vote({value: value}, this.props.opinion.id, this.props.opinion.parent.id);
    } else {
      OpinionActions.vote({value: value}, this.props.opinion.id);
    }
  },

  deleteVote() {
    if (this.isVersion()) {
      OpinionActions.deleteVote(this.props.opinion.id, this.props.opinion.parent.id);
    } else {
      OpinionActions.deleteVote(this.props.opinion.id);
    }
  },

  voteAction(value) {
    if (!LoginStore.isLoggedIn()) {
      return null;
    }
    return this.isCurrentVote(value) ? this.deleteVote() : this.vote(value);
  },

  isTheUserTheAuthor() {
    if (this.props.opinion.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.opinion.author.uniqueId;
  },

  renderVoteButton(type) {
    const opinion = this.props.opinion;
    const voteType = this.isVersion() ? opinion.parent.type.voteWidgetType : opinion.type.voteWidgetType;
    if (type === 'ok' && (voteType === VOTE_WIDGET_SIMPLE || voteType === VOTE_WIDGET_BOTH)) {
      return (
        <Button bsStyle="success" className="btn--outline"
                onClick={this.voteAction.bind(this, 1)}
                active={this.isCurrentVote(1)}
                aria-label={this.isCurrentVote(1) ? this.getIntlMessage('vote.aria_label_active.ok') : this.getIntlMessage('vote.aria_label.ok')}
        >
          <i className="cap cap-hand-like-2-1"></i>
          { ' ' + this.getIntlMessage('vote.ok') }
        </Button>
      );
    }
    if (type === 'mitige' && voteType === VOTE_WIDGET_BOTH) {
      return (
        <Button bsStyle="warning" className="btn--outline"
                onClick={this.voteAction.bind(this, 0)}
                active={this.isCurrentVote(0)}
                aria-label={this.isCurrentVote(0) ? this.getIntlMessage('vote.aria_label_active.mitige') : this.getIntlMessage('vote.aria_label.mitige')}
        >
          <i className="cap cap-hand-like-2 icon-rotate"></i>
          { ' ' + this.getIntlMessage('vote.mitige') }
        </Button>
      );
    }
    if (type === 'nok' && voteType === VOTE_WIDGET_BOTH) {
      return (
        <Button bsStyle="danger" className="btn--outline"
                onClick={this.voteAction.bind(this, -1)}
                active={this.isCurrentVote(-1)}
                aria-label={this.isCurrentVote(-1) ? this.getIntlMessage('vote.aria_label_active.nok') : this.getIntlMessage('vote.aria_label.nok')}
        >
          <i className="cap cap-hand-unlike-2-1"></i>
          { ' ' + this.getIntlMessage('vote.nok') }
        </Button>
      );
    }
  },

  renderEditButton() {
    if (this.isContribuable() && this.isTheUserTheAuthor()) {
      if (this.isVersion()) {
        return (
          <OpinionVersionForm className="pull-right" style={{marginLeft: '5px'}} mode="edit" opinionId={this.props.opinion.parent.id} version={this.props.opinion} />
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
        {this.isContribuable() ? <LoginOverlay children={ this.renderVoteButton('ok') } /> : null}
        {this.isContribuable() ? <LoginOverlay children={ this.renderVoteButton('mitige') } /> : null}
        {this.isContribuable() ? <LoginOverlay children={ this.renderVoteButton('nok') } /> : null}
        {this.renderEditButton()}
        <OpinionReportButton opinion={opinion} />
        <ShareButtonDropdown className="pull-right" title={opinion.title} url={opinion._links.show} />
      </ButtonToolbar>
    );
  },

});

export default OpinionButtons;
