import * as React from 'react'

import styled from 'styled-components'
import { Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Field, reduxForm, SubmissionError } from 'redux-form'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'
import CloseButton from '~/components/Form/CloseButton'
import component from '~/components/Form/Field'
import type { Dispatch } from '~/types'
import CreateProposalFusionMutation from '~/mutations/CreateProposalFusionMutation'
import AlertForm from '~/components/Alert/AlertForm'
const ProjectAdminMergeModaleStyle = styled.div`
  ul {
    list-style: none;
    padding-left: 0;
  }
`
type Proposal = {
  readonly id: string
  readonly title: string
  readonly adminUrl: string
}
type Props = ReduxFormFormProps & {
  intl: IntlShape
  proposalsSelected: ReadonlyArray<Proposal>
  dispatch: Dispatch
  show: boolean
  onClose: () => void
}
type FormValues = {
  fromProposals: Array<number>
  title: string
  description: string
}
export const formName = 'proposal-merge-form'

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { proposalsSelected } = props
  const input = {
    fromProposals: proposalsSelected.map(({ id }) => id),
    title: values.title,
    description: values.description,
  }
  return CreateProposalFusionMutation.commit({
    input,
  })
    .then(response => {
      if (!response.createProposalFusion) {
        throw new Error('Mutation "CreateProposalFusionMutation" failed.')
      }

      if (response.createProposalFusion.proposal && response.createProposalFusion.proposal.adminUrl) {
        window.location.href = response.createProposalFusion.proposal.adminUrl
      } else {
        window.location.reload()
      }
    })
    .catch(response => {
      if (response.message) {
        throw new SubmissionError({
          _error: response.message,
        })
      } else {
        throw new SubmissionError({
          _error: props.intl.formatMessage({
            id: 'global.error.server.form',
          }),
        })
      }
    })
}

export const ProjectAdminMergeModale = ({
  invalid,
  pristine,
  submitting,
  handleSubmit,
  valid,
  submitFailed,
  submitSucceeded,
  show,
  proposalsSelected,
  onClose,
}: Props) => {
  return (
    <Modal
      show={show}
      onHide={() => {
        onClose()
      }}
      aria-labelledby="modale-title"
    >
      <form name={formName} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title id="modale-title">
            <FormattedMessage id="proposal.add_fusion" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Field
            label={
              <span className="font-weight-bold">
                <FormattedMessage id="admin.fields.proposal.title" />
              </span>
            }
            id="merge.title"
            name="title"
            type="text"
            component={component}
          />
          <div className="font-weight-bold">
            <FormattedMessage id="title.selected.propositions" />
          </div>
          <div className="mb-20 mt-5">
            <ProjectAdminMergeModaleStyle>
              <ul>
                {proposalsSelected.map(proposal => (
                  <li key={proposal.id}>
                    <a href={proposal.adminUrl} target="_blank" rel="noopener noreferrer">
                      {proposal.title}
                    </a>
                  </li>
                ))}
              </ul>
            </ProjectAdminMergeModaleStyle>
          </div>

          <Field
            name="description"
            component={component}
            type="editor"
            id="merge.description"
            label={
              <span className="font-weight-bold">
                <FormattedMessage id="global.description" />
              </span>
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            label="editor.undo"
            buttonId="merge.cancel"
            onClose={() => {
              onClose()
            }}
          />

          <Button
            id="merge-proposal-submit-button"
            disabled={invalid || submitting || pristine}
            type="submit"
            bsStyle="primary"
            className="ml-15"
          >
            {submitting ? <FormattedMessage id="global.loading" /> : <FormattedMessage id="global.save" />}
          </Button>
          <AlertForm
            valid={valid}
            invalid={invalid && !pristine}
            submitSucceeded={submitSucceeded}
            submitFailed={submitFailed}
            submitting={submitting}
          />
        </Modal.Footer>
      </form>
    </Modal>
  )
}
const form = reduxForm({
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(ProjectAdminMergeModale)

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    dispatch,
  }
}

export default connect(mapDispatchToProps)(injectIntl(form))
