import React, { useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import cn from 'classnames'
import { FormattedMessage, useIntl } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import RemoveArgumentVoteMutation from '../../../mutations/RemoveArgumentVoteMutation'
import AddArgumentVoteMutation from '../../../mutations/AddArgumentVoteMutation'
import NewLoginOverlay from '../../Utils/NewLoginOverlay'
import UnpublishedTooltip from '../../Publishable/UnpublishedTooltip'
import type { ArgumentVoteButton_argument } from '~relay/ArgumentVoteButton_argument.graphql'
import RequirementsFormModal from '../../Requirements/RequirementsModal'
import { toast } from '~ds/Toast'

type Props = {
  argument: ArgumentVoteButton_argument
}

export const ArgumentVoteButton = ({ argument }: Props) => {
  const target = useRef(null)
  const [showModal, setShowModal] = useState(false)
  const intl = useIntl()
  const { step } = argument

  const checkIfUserHasRequirements = (): boolean => {
    const userHasNotRequirements = step && step.requirements && !step.requirements.viewerMeetsTheRequirements

    if (userHasNotRequirements) {
      setShowModal(true)
    }

    return userHasNotRequirements
  }

  const vote = () => {
    if (checkIfUserHasRequirements()) {
      return
    }

    AddArgumentVoteMutation.commit({
      input: {
        argumentId: argument.id,
      },
    })
      .then(() => {
        toast({ content: intl.formatMessage({ id: 'vote.add_success' }), variant: 'success' })
      })
      .catch(() => {
        toast({ content: intl.formatMessage({ id: 'alert.danger.add.vote' }), variant: 'danger' })
      })
  }

  const deleteVote = () => {
    if (checkIfUserHasRequirements()) {
      return
    }

    RemoveArgumentVoteMutation.commit({
      input: {
        argumentId: argument.id,
      },
    })
      .then(() => {
        toast({ content: intl.formatMessage({ id: 'vote.delete_success' }), variant: 'success' })
      })
      .catch(() => {
        toast({ content: intl.formatMessage({ id: 'alert.danger.delete.vote' }), variant: 'success' })
      })
  }

  return (
    <>
      {step && <RequirementsFormModal step={step} handleClose={() => setShowModal(false)} show={showModal} />}

      <NewLoginOverlay>
        <button
          type="button"
          ref={target}
          disabled={!argument.contribuable || argument.author.isViewer}
          onClick={argument.viewerHasVote ? deleteVote : vote}
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
            target={() => ReactDOM.findDOMNode(target.current)}
            publishable={argument.viewerVote || null}
          />
        </button>
      </NewLoginOverlay>
    </>
  )
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
