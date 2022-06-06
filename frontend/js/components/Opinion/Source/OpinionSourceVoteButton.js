// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import cn from 'classnames';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import AddSourceVoteMutation from '../../../mutations/AddSourceVoteMutation';
import RemoveSourceVoteMutation from '../../../mutations/RemoveSourceVoteMutation';
import NewLoginOverlay from '../../Utils/NewLoginOverlay';
import UnpublishedTooltip from '../../Publishable/UnpublishedTooltip';
import type { OpinionSourceVoteButton_source } from '~relay/OpinionSourceVoteButton_source.graphql';
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

  target: null | HTMLButtonElement;

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

  render() {
    const { source, disabled } = this.props;
    const { step } = source;
    const { showModal } = this.state;
    return (
      <div>
        {step && (
          <RequirementsFormModal step={step} handleClose={this.closeModal} show={showModal} />
        )}
        <NewLoginOverlay>
          <button
            type="button"
            ref={button => {
              this.target = button;
            }}
            disabled={disabled}
            onClick={this.onClick}
            className={cn('btn source__btn--vote btn-xs', {
              'btn--outline btn-success': !source.viewerHasVote,
              'btn-danger': source.viewerHasVote,
            })}>
            {source.viewerHasVote ? (
              <FormattedMessage id="global.cancel" />
            ) : (
              <span>
                <i className="cap cap-hand-like-2" /> <FormattedMessage id="global.ok" />
              </span>
            )}
            <UnpublishedTooltip
              target={() => ReactDOM.findDOMNode(this.target)}
              publishable={source.viewerVote || null}
            />
          </button>
        </NewLoginOverlay>
      </div>
    );
  }
}

export default createFragmentContainer(OpinionSourceVoteButton, {
  source: graphql`
    fragment OpinionSourceVoteButton_source on Source
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      contribuable
      step {
        requirements {
          viewerMeetsTheRequirements @include(if: $isAuthenticated)
        }
        ...RequirementsFormLegacy_step @arguments(isAuthenticated: $isAuthenticated)

        ...RequirementsModal_step @arguments(isAuthenticated: $isAuthenticated)
      }
      viewerHasVote @include(if: $isAuthenticated)
      viewerVote @include(if: $isAuthenticated) {
        id
        ...UnpublishedTooltip_publishable
      }
    }
  `,
});
