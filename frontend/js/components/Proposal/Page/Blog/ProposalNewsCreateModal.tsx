import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import { Modal } from 'react-bootstrap'
import {
  isInvalid,
  isSubmitting,
  isPristine,
  submit,
  SubmissionError,
  isValid,
  hasSubmitSucceeded,
  hasSubmitFailed,
} from 'redux-form'
import { connect } from 'react-redux'
import type { Dispatch, GlobalState } from '~/types'
import SubmitButton from '~/components/Form/SubmitButton'
import { formName, ProposalNewsFormCreate } from './ProposalNewsForm'
import type { FormValues } from '~/components/Proposal/Page/Blog/ProposalNewsForm'
import { handleTranslationChange } from '~/services/Translation'
import AddProposalNewsMutation from '~/mutations/AddProposalNewsMutation'
import AlertForm from '~/components/Alert/AlertForm'
import CloseButton from '~/components/Form/CloseButton'
import type { ProposalNewsCreateModal_proposal$data } from '~relay/ProposalNewsCreateModal_proposal.graphql'
import { TranslationLocaleEnum } from '~/utils/enums/TranslationLocale'
import type { AddProposalNewsMutation$data } from '~relay/AddProposalNewsMutation.graphql'

type Props = ReduxFormFormProps & {
  readonly show: boolean
  readonly displayModal: (show: boolean) => void
  readonly dispatch: Dispatch
  readonly currentLanguage: string
  readonly onClose?: () => void
  readonly proposal: ProposalNewsCreateModal_proposal$data
}

export const ProposalNewsCreateModal = ({
  displayModal,
  show,
  dispatch,
  pristine,
  invalid,
  valid,
  submitSucceeded,
  submitFailed,
  submitting,
  proposal,
  currentLanguage,
}: Props) => {
  const intl = useIntl()

  const onSubmit = (values: FormValues) => {
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
      proposalId: proposal.id,
      media: values.media ? values.media.id : null,
      translations: translationsData,
    }
    return AddProposalNewsMutation.commit({
      input: data,
    })
      .then((response: AddProposalNewsMutation$data) => {
        displayModal(false)

        if (response.addProposalNews?.postURL) {
          window.location.href = response.addProposalNews.postURL as string
        }
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
      dialogClassName="modal--update"
    >
      <Modal.Header
        closeButton
        closeLabel={intl.formatMessage({
          id: 'close.modal',
        })}
      >
        <Modal.Title className="font-weight-bold">
          <FormattedMessage id="proposal-add-news" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProposalNewsFormCreate onSubmit={onSubmit} post={null} />
        <AlertForm
          valid={valid}
          invalid={invalid && !pristine}
          submitSucceeded={submitSucceeded}
          submitFailed={submitFailed}
          submitting={submitting}
        />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={() => displayModal(false)} />
        <SubmitButton
          id="confirm-post-create"
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

const mapStateToProps = (state: GlobalState) => ({
  currentLanguage: state.language.currentLanguage,
  pristine: isPristine(formName)(state),
  valid: isValid(formName)(state),
  invalid: isInvalid(formName)(state),
  submitting: isSubmitting(formName)(state),
  submitSucceeded: hasSubmitSucceeded(formName)(state),
  submitFailed: hasSubmitFailed(formName)(state),
})

export default createFragmentContainer(connect(mapStateToProps)(ProposalNewsCreateModal), {
  proposal: graphql`
    fragment ProposalNewsCreateModal_proposal on Proposal {
      id
    }
  `,
})
