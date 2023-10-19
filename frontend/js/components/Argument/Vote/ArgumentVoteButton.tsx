import React from 'react'
import ReactDOM from 'react-dom'
import cn from 'classnames'
import { FormattedMessage } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import RemoveArgumentVoteMutation from '../../../mutations/RemoveArgumentVoteMutation'
import AddArgumentVoteMutation from '../../../mutations/AddArgumentVoteMutation'
import FluxDispatcher from '../../../dispatchers/AppDispatcher'
import NewLoginOverlay from '../../Utils/NewLoginOverlay'
import UnpublishedTooltip from '../../Publishable/UnpublishedTooltip'
import type { ArgumentVoteButton_argument } from '~relay/ArgumentVoteButton_argument.graphql'
import RequirementsFormModal from '../../Requirements/RequirementsModal'

type Props = {
  argument: ArgumentVoteButton_argument
}
type State = {
  showModal: boolean
}
export class ArgumentVoteButton extends React.Component<Props, State> {
  target: null | HTMLButtonElement

  state = {
    showModal: false,
  }

  openModal = () => {
    this.setState({
      showModal: true,
    })
  }

  closeModal = () => {
    this.setState({
      showModal: false,
    })
  }

  checkIfUserHasRequirements = (): boolean => {
    const { argument } = this.props
    const { step } = argument
    const userHasNotRequirements = step && step.requirements && !step.requirements.viewerMeetsTheRequirements

    if (userHasNotRequirements) {
      this.openModal()
    }

    return userHasNotRequirements
  }

  vote = () => {
    const { argument } = this.props

    if (this.checkIfUserHasRequirements()) {
      return
    }

    AddArgumentVoteMutation.commit({
      input: {
        argumentId: argument.id,
      },
    })
      .then(() => {
        FluxDispatcher.dispatch({
          actionType: 'UPDATE_ALERT',
          alert: {
            bsStyle: 'success',
            content: 'vote.add_success',
          },
        })
      })
      .catch(() => {
        FluxDispatcher.dispatch({
          actionType: 'UPDATE_ALERT',
          alert: {
            bsStyle: 'danger',
            content: 'alert.danger.add.vote',
          },
        })
      })
  }

  deleteVote = () => {
    const { argument } = this.props

    if (this.checkIfUserHasRequirements()) {
      return
    }

    RemoveArgumentVoteMutation.commit({
      input: {
        argumentId: argument.id,
      },
    })
      .then(() => {
        FluxDispatcher.dispatch({
          actionType: 'UPDATE_ALERT',
          alert: {
            bsStyle: 'success',
            content: 'vote.delete_success',
          },
        })
      })
      .catch(() => {
        FluxDispatcher.dispatch({
          actionType: 'UPDATE_ALERT',
          alert: {
            bsStyle: 'danger',
            content: 'alert.danger.delete.vote',
          },
        })
      })
  }

  render() {
    const { argument } = this.props
    const { step } = argument
    const { showModal } = this.state
    return (
      <>
        {step && <RequirementsFormModal step={step} handleClose={this.closeModal} show={showModal} />}

        <NewLoginOverlay>
          <button
            type="button"
            ref={button => {
              this.target = button
            }}
            disabled={!argument.contribuable || argument.author.isViewer}
            onClick={argument.viewerHasVote ? this.deleteVote : this.vote}
            className={cn('btn btn-xs argument__btn--vote', {
              'btn--outline btn-success': !argument.viewerHasVote,
              'btn-danger': argument.viewerHasVote,
            })}
          >
            {argument.viewerHasVote ? (
              <FormattedMessage id="global.cancel" tagName="span" />
            ) : (
              <span>
                <i className="cap cap-hand-like-2" /> <FormattedMessage id="global.ok" />
              </span>
            )}
            <UnpublishedTooltip
              target={() => ReactDOM.findDOMNode(this.target)}
              publishable={argument.viewerVote || null}
            />
          </button>
        </NewLoginOverlay>
      </>
    )
  }
}
export default createFragmentContainer(ArgumentVoteButton, {
  argument: graphql`
    fragment ArgumentVoteButton_argument on Argument @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      author {
        isViewer @include(if: $isAuthenticated)
      }
      step {
        requirements {
          viewerMeetsTheRequirements @include(if: $isAuthenticated)
        }
        ...RequirementsModal_step @arguments(isAuthenticated: $isAuthenticated)
      }
      contribuable
      viewerHasVote @include(if: $isAuthenticated)
      viewerVote @include(if: $isAuthenticated) {
        id
        ...UnpublishedTooltip_publishable
      }
    }
  `,
})
