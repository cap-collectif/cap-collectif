import React from 'react';
import {IntlMixin} from 'react-intl';
import {Button} from 'react-bootstrap';
import classNames from 'classnames';

import LoginStore from '../../../stores/LoginStore';
import ProposalActions from '../../../actions/ProposalActions';
import ProposalVoteModal from './ProposalVoteModal';

const ProposalVoteButton = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    selectionStepId: React.PropTypes.number,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      selectionStepId: null,
    };
  },

  getInitialState() {
    return {
      showModal: false,
    };
  },

  userHasVote() {
    return this.props.proposal.userHasVote;
  },

  toggleModal(value) {
    this.setState({
      showModal: value,
    });
  },

  vote() {
    ProposalActions.vote(this.props.selectionStepId, this.props.proposal.id);
  },

  deleteVote() {
    ProposalActions.deleteVote(this.props.selectionStepId, this.props.proposal.id);
  },

  voteAction() {
    if (!LoginStore.isLoggedIn()) {
      this.toggleModal(true);
      return;
    }
    if (this.userHasVote()) {
      this.deleteVote();
    } else {
      this.vote();
    }
  },

  render() {
    const style = this.userHasVote() ? 'danger' : 'success';
    const classes = classNames({
      'proposal__preview__vote': true,
      'btn--outline': !this.userHasVote(),
    });
    return (
      <div>
        {
          this.props.selectionStepId
            ? <Button
                bsStyle={style}
                className={classes}
                style={{width: '100%'}}
                onClick={this.voteAction.bind(this, 1)}
                active={this.userHasVote()}
            >
              {
                this.userHasVote()
                  ? this.getIntlMessage('proposal.vote.delete')
                  : this.getIntlMessage('proposal.vote.add')
              }
            </Button>
            : null
        }
        {
          !LoginStore.isLoggedIn()
            ? <ProposalVoteModal
                proposal={this.props.proposal}
                selectionStepId={this.props.selectionStepId}
                showModal={this.state.showModal}
                onToggleModal={this.toggleModal}
            />
            : null
        }
      </div>
    );
  },

});

export default ProposalVoteButton;
