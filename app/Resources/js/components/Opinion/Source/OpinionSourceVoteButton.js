// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import AddSourceVoteMutation from '../../../mutations/AddSourceVoteMutation';
import RemoveSourceVoteMutation from '../../../mutations/RemoveSourceVoteMutation';
import LoginOverlay from '../../Utils/LoginOverlay';
import UnpublishedTooltip from '../../Publishable/UnpublishedTooltip';
import type { OpinionSourceVoteButton_source } from './__generated__/OpinionSourceVoteButton_source.graphql';
import RequirementsFormModal from '../../Requirements/RequirementsModal';

type Props = {
  disabled: boolean,
  source: OpinionSourceVoteButton_source,
};

type State = {
  showModal: boolean,
};

export class OpinionSourceVoteButton extends React.Component<Props, State> {
  state = { showModal: false };

  openModal = () => {
    this.setState({ showModal: true });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  onClick = () => {
    const { source } = this.props;
    const { step } = source;

    if (step && step.requirements && !step.requirements.viewerMeetsTheRequirements) {
      this.openModal();
      return;
    }

    if (source.viewerHasVote) {
      return RemoveSourceVoteMutation.commit({ input: { sourceId: source.id } });
    }
    return AddSourceVoteMutation.commit({ input: { sourceId: source.id } });
  };

  target: null;

  render() {
    const { source, disabled } = this.props;
    const { step } = source;
    const { showModal } = this.state;
    return (
      <div>
        {step /* $FlowFixMe */ && (
          <RequirementsFormModal step={step} handleClose={this.closeModal} show={showModal} />
        )}
        <LoginOverlay>
          <Button
            ref={button => {
              this.target = button;
            }}
            disabled={disabled}
            bsStyle={source.viewerHasVote ? 'danger' : 'success'}
            className={`source__btn--vote${source.viewerHasVote ? '' : ' btn--outline'}`}
            bsSize="xsmall"
            onClick={this.onClick}>
            {source.viewerHasVote ? (
              <FormattedMessage id="vote.cancel" />
            ) : (
              <span>
                <i className="cap cap-hand-like-2" /> {<FormattedMessage id="vote.ok" />}
              </span>
            )}
            {/* $FlowFixMe */}
            <UnpublishedTooltip
              target={() => ReactDOM.findDOMNode(this.target)}
              publishable={source.viewerVote || null}
            />
          </Button>
        </LoginOverlay>
      </div>
    );
  }
}

export default createFragmentContainer(
  OpinionSourceVoteButton,
  graphql`
    fragment OpinionSourceVoteButton_source on Source
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      contribuable
      step {
        requirements {
          viewerMeetsTheRequirements @include(if: $isAuthenticated)
        }
        ...RequirementsForm_step
        ...RequirementsModal_step
      }
      viewerHasVote @include(if: $isAuthenticated)
      viewerVote @include(if: $isAuthenticated) {
        id
        ...UnpublishedTooltip_publishable
      }
    }
  `,
);
