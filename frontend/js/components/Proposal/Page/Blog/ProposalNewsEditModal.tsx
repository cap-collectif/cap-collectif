import React, { useState } from 'react'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import { Modal } from 'react-bootstrap'
import {
  submit,
  SubmissionError,
  isPristine,
  isValid,
  isInvalid,
  isSubmitting,
  hasSubmitSucceeded,
  hasSubmitFailed,
} from 'redux-form'
import { connect } from 'react-redux'
import { Button } from '@cap-collectif/ui'
import type { Dispatch, GlobalState } from '~/types'
import SubmitButton from '~/components/Form/SubmitButton'
import ProposalNewsForm, { formName } from './ProposalNewsForm'
import type { FormValues } from '~/components/Proposal/Page/Blog/ProposalNewsForm'
import { handleTranslationChange } from '~/services/Translation'
import UpdateProposalNewsMutation from '~/mutations/UpdateProposalNewsMutation'
import DeleteProposalNewsMutation from '~/mutations/DeleteProposalNewsMutation'
import AlertForm from '~/components/Alert/AlertForm'
import CloseButton from '~/components/Form/CloseButton'
import type { ProposalNewsEditModal_post } from '~relay/ProposalNewsEditModal_post.graphql'
import { TranslationLocaleEnum } from '~/utils/enums/TranslationLocale'
import { toast } from '~ds/Toast'
import ProposalNewsDeleteModal from '~/components/Proposal/Page/Blog/ProposalNewsDeleteModal'
import type { DeleteProposalNewsMutationResponse } from '~relay/DeleteProposalNewsMutation.graphql'
type Props = ReduxFormFormProps & {
  readonly show: boolean
  readonly displayModal: (show: boolean) => void
  readonly dispatch: Dispatch
  readonly currentLanguage: string
  readonly onClose?: () => void
  readonly post: ProposalNewsEditModal_post
  readonly intl: IntlShape
}
export const ProposalNewsEditModal = ({
  displayModal,
  show,
  dispatch,
  pristine,
  invalid,
  valid,
  submitSucceeded,
  submitFailed,
  submitting,
  post,
  intl,
  currentLanguage,
}: Props) => {
  const [showDeleteModal, displayDeleteModal] = useState(false)

  const onUpdate = (values: FormValues) => {
    const translationsData = handleTranslationChange(
      [],
      {
        locale: TranslationLocaleEnum[currentLanguage],
        body: values.body,
        title: values.title,
        abstract: values.abstract,
      },
      TranslationLocaleEnum[currentLanguage],
    )
    const data = {
      postId: post.id,
      media: values.media ? values.media.id : null,
      translations: translationsData,
    }
    return UpdateProposalNewsMutation.commit({
      input: data,
    })
      .then(() => {
        toast({
          variant: 'success',
          content: intl.formatHTMLMessage({
            id: 'your-form-has-been-updated',
          }),
        })
        displayModal(false)
        window.location.reload(true)
      })
      .catch(() => {
        throw new SubmissionError({
          _error: 'global.error.server.form',
        })
      })
  }

  const onDelete = postId => {
    return DeleteProposalNewsMutation.commit({
      input: {
        postId,
      },
    })
      .then((response: DeleteProposalNewsMutationResponse) => {
        toast({
          variant: 'success',
          content: intl.formatHTMLMessage({
            id: 'your-form-has-been-deleted',
          }),
        })

        if (response.deleteProposalNews && response.deleteProposalNews.proposalUrl) {
          window.location.href = response.deleteProposalNews.proposalUrl
        }

        displayModal(false)
      })
      .catch(() => {
        throw new SubmissionError({
          _error: 'global.error.server.form',
        })
      })
  }

  return (
    <Modal
      enforceFocus={false}
      show={show}
      onHide={() => displayModal(false)}
      animation={false}
      className={show ? `overflow-hidden` : null}
      dialogClassName="modal--update"
    >
      <Modal.Header
        closeButton
        closeLabel={intl.formatMessage({
          id: 'close.modal',
        })}
      >
        <Modal.Title className="font-weight-bold">
          <FormattedMessage id="proposal-edit-news" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProposalNewsForm onSubmit={onUpdate} post={post} />
        <ProposalNewsDeleteModal
          onSubmit={onDelete}
          post={post}
          showDeleteModal={showDeleteModal}
          displayDeleteModal={displayDeleteModal}
        />
        <AlertForm
          valid={valid}
          invalid={invalid && !pristine}
          submitSucceeded={submitSucceeded}
          submitFailed={submitFailed}
          submitting={submitting}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          id="delete-proposal-news"
          variant="tertiary"
          variantColor="danger"
          display="inline"
          mr={3}
          onClick={() => displayDeleteModal(true)}
        >
          <FormattedMessage id="global.delete" />
        </Button>
        <CloseButton onClose={() => displayModal(false)} />
        <SubmitButton
          id="confirm-post-edit"
          bsStyle="primary"
          label={submitting ? 'global.loading' : 'global.publish'}
          isSubmitting={submitting}
          disabled={pristine || invalid || submitting}
          onSubmit={() => {
            dispatch(submit(formName))
          }}
        />
      </Modal.Footer>
    </Modal>
  )
}

const mapStateToProps = (state: GlobalState) => {
  return {
    currentLanguage: state.language.currentLanguage,
    pristine: isPristine(formName)(state),
    valid: isValid(formName)(state),
    invalid: isInvalid(formName)(state),
    submitting: isSubmitting(formName)(state),
    submitSucceeded: hasSubmitSucceeded(formName)(state),
    submitFailed: hasSubmitFailed(formName)(state),
  }
}

// @ts-ignore
const container = connect(mapStateToProps)(injectIntl(ProposalNewsEditModal))
export default createFragmentContainer(container, {
  post: graphql`
    fragment ProposalNewsEditModal_post on Post {
      id
      authors {
        id
        slug
      }
      ...ProposalNewsForm_post
      ...ProposalNewsDeleteModal_post
    }
  `,
})
