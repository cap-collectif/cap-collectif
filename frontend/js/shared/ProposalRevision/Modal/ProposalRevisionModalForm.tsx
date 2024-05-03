import * as React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { FormattedMessage, FormattedHTMLMessage, useIntl, injectIntl } from 'react-intl'
import type { FormProps } from 'redux-form'
import { reduxForm, Field, formValueSelector, SubmissionError } from 'redux-form'
import moment from 'moment'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { createFragmentContainer, graphql } from 'react-relay'
import SubmitButton from '~/components/Form/SubmitButton'
import component from '~/components/Form/Field'
import { DateContainer } from '~/components/Admin/Project/Step/ProjectAdminStepForm.style'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import type { ProposalRevisionModalForm_proposal } from '~relay/ProposalRevisionModalForm_proposal.graphql'
import CopyLinkButton from '~ui/Link/CopyLinkButton'
import {
  ProposalRevisionItem,
  ProposalRevisionItemMetadata,
  ProposalRevisionList,
} from '~/shared/ProposalRevision/Modal/ProposalRevisionModalForm.style'
import useToggle from '~/components/AdminEditor/hooks/useToggle'
import type { GlobalState } from '~/types'
import { styleGuideColors } from '~/utils/colors'
import AskProposalRevisionMutation from '~/mutations/AskProposalRevisionMutation'
import { DATE_ISO8601_FORMAT, DATE_LONG_LOCALIZED_FORMAT } from '~/shared/date'
import type { User } from '~/redux/modules/user'
import stripHtml from '~/utils/stripHtml'
import { toast } from '~ds/Toast'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'

type RelayProps = {
  readonly proposal: ProposalRevisionModalForm_proposal
}
type ReduxProps = {
  readonly expiresAt?: string
  readonly proposalId?: string
}
type FormValues = {
  readonly reason: string
  readonly body: string
  readonly proposalId: string
  readonly expiresAt: string
}
type Props = (RelayProps &
  ReduxProps & {
    readonly isAdminView: boolean
    readonly show: boolean
    readonly children?: JSX.Element | JSX.Element[] | string
    readonly onClose: () => void
    readonly viewer: User
    readonly unstable__enableCapcoUiDs?: boolean
  }) &
  FormProps
const formName = 'proposal-revision-form'

const validate = ({ reason, expiresAt, body }: FormValues) => {
  const now = moment()
  const errors: any = {}

  if (!reason) {
    errors.reason = 'global.required'
  }

  if (!body) {
    errors.body = 'global.required'
  }

  if (body && stripHtml(body).length > 500) {
    errors.body = 'proposalRevision.constraints.body'
  }

  if (!expiresAt) {
    errors.expiresAt = 'global.required'
  }

  if (moment(expiresAt).isBefore(now)) {
    errors.expiresAt = 'global-error-dateBeforeNow'
  }

  return errors
}

const onSubmit = (values: FormValues, _, { onClose, intl }: Props) => {
  return AskProposalRevisionMutation.commit({
    input: { ...values, expiresAt: moment(values.expiresAt).format(DATE_ISO8601_FORMAT) },
  })
    .then(() => {
      toast({
        content: intl.formatMessage(
          { id: 'success.message.review.request' },
          {
            date: moment(values.expiresAt).format(DATE_LONG_LOCALIZED_FORMAT),
          },
        ),
        variant: 'success',
      })

      onClose()
      // On backend, the flash message in the ProposalAdminPage component is not fixed on the page
      // on the top. So to avoid to update the flash container (which may lead to other regressions)
      // scrolling to top will do fine while we migrate to the new flash messages from the design system
      window.scrollTo(0, 0)
    })
    .catch(() => {
      mutationErrorToast(intl)
      throw new SubmissionError({
        _error: 'global.error.server.form',
      })
    })
}

const WarningText = styled.p`
  color: ${styleGuideColors.yellow700};
`

const ProposalRevisionModalForm = ({
  onClose,
  show,
  handleSubmit,
  submitting,
  pristine,
  invalid,
  expiresAt,
  isAdminView,
  proposal,
  viewer,
  unstable__enableCapcoUiDs,
}: Props) => {
  const intl = useIntl()
  const [showAvailableRevisions, toggleAvailableRevisions] = useToggle(() => proposal.revisions.totalCount > 0)

  if (global.locale) {
    moment.locale(global.locale.split('-')[0])
  } else {
    moment.locale('fr')
  }

  return (
    <Modal show={show} onHide={onClose} backdrop="static">
      {showAvailableRevisions && (
        <>
          <Modal.Header
            closeButton
            closeLabel={intl.formatMessage({
              id: 'close.modal',
            })}
          >
            <Modal.Title className="font-weight-600">
              {intl.formatMessage({
                id: 'modal.review.request',
              })}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="font-weight-600">
              <Icon
                className="mr-10 position-relative"
                color={styleGuideColors.blue200}
                name={ICON_NAME.information}
                style={{
                  top: 2,
                }}
                size="1.5rem"
              />
              &nbsp;
              {intl.formatMessage({
                id: 'revision.request.pending',
              })}
            </p>
            <ProposalRevisionList>
              {proposal.revisions.edges
                ?.filter(Boolean)
                .map(edge => edge.node)
                .map(revision => (
                  <ProposalRevisionItem key={revision.id}>
                    <p className="font-weight-bold m-0">
                      {intl.formatMessage({
                        id: 'admin.fields.proposal-revision.reason',
                      })}
                    </p>
                    <p className="m-0 mt-5">{revision.reason}</p>
                    <ProposalRevisionItemMetadata>
                      {intl.formatMessage(
                        {
                          id: 'user.and.date',
                        },
                        {
                          username: revision.author.username,
                          date: moment(revision.createdAt).format('L'),
                        },
                      )}
                    </ProposalRevisionItemMetadata>
                  </ProposalRevisionItem>
                ))}
            </ProposalRevisionList>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={toggleAvailableRevisions} bsStyle="primary">
              {intl.formatMessage({
                id: 'global.continue',
              })}
            </Button>
          </Modal.Footer>
        </>
      )}
      {!showAvailableRevisions && (
        <form
          onSubmit={e => {
            // prevent parent form (AdminContentForm) to submit
            e.stopPropagation()
            e.preventDefault()
            handleSubmit(e)
          }}
        >
          <Modal.Header
            closeButton
            closeLabel={intl.formatMessage({
              id: 'close.modal',
            })}
          >
            <Modal.Title className="font-weight-600">
              {intl.formatMessage({
                id: 'modal.review.request',
              })}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="excerpt">
              <FormattedHTMLMessage
                id="reply.to.mechanism.review.request"
                values={{
                  email: viewer.email,
                }}
              />
            </p>
            <Field
              name="reason"
              component={component}
              type="text"
              id="proposal_revision_reason"
              placeholder={intl.formatMessage({
                id: 'title-request',
              })}
              label={<FormattedMessage id="reason.review.request" />}
            />
            <Field
              name="body"
              component={component}
              type={unstable__enableCapcoUiDs ? 'admin-editor-ds' : 'admin-editor'}
              id="proposal_revision_body"
              placeholder={intl.formatMessage({
                id: 'review.request.description',
              })}
              label={<FormattedMessage id="additional-information" />}
            />
            <DateContainer>
              <Field
                id="revision-expiresAt"
                component={component}
                type="datetime"
                name="expiresAt"
                label={<FormattedMessage id="review.duration" />}
                addonAfter={<i className="cap-calendar-2" />}
              />
            </DateContainer>
            {!isAdminView &&
              expiresAt &&
              proposal.project?.firstAnalysisStep?.timeRange?.endAt &&
              moment(proposal.project.firstAnalysisStep.timeRange.endAt).isBefore(expiresAt) && (
                <WarningText>
                  {intl.formatMessage({
                    id: 'dateAfter.stepEnd',
                  })}
                </WarningText>
              )}
            <p className="control-label label-container">
              {intl.formatMessage({
                id: 'share.link',
              })}
            </p>
            <div className="d-flex align-items-center">
              <Icon name={ICON_NAME.link} size="1.75rem" />
              <span className="ml-10">{proposal.url}</span>
              <CopyLinkButton value={proposal.url}>
                {isCopied => (
                  <Button bsStyle="link" className="ml-auto">
                    {intl.formatMessage({
                      id: isCopied ? 'copied-link' : 'copy-link',
                    })}
                  </Button>
                )}
              </CopyLinkButton>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <SubmitButton
              bsStyle="primary"
              disabled={pristine || invalid || submitting}
              id="send-proposal-revision"
              label="global.publish"
              isSubmitting={submitting}
            />
          </Modal.Footer>
        </form>
      )}
    </Modal>
  )
}

const mapStateToProps = (state: GlobalState, { proposal }: Props) => ({
  expiresAt: formValueSelector(formName)(state, 'expiresAt'),
  initialValues: {
    proposalId: proposal?.id ?? null,
  },
  viewer: state.user.user,
})

const form = reduxForm({
  onSubmit,
  validate,
  form: formName,
})(ProposalRevisionModalForm)
// @ts-ignore
const container = connect(mapStateToProps)(form)
export default createFragmentContainer(injectIntl(container), {
  proposal: graphql`
    fragment ProposalRevisionModalForm_proposal on Proposal {
      id
      url
      revisions(state: PENDING) {
        totalCount
        edges {
          node {
            id
            reason
            createdAt
            author {
              username
            }
          }
        }
      }
      project {
        firstAnalysisStep {
          timeRange {
            endAt
          }
        }
      }
    }
  `,
})
