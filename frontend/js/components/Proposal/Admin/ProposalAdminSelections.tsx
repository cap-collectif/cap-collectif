import React, { Component } from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { connect } from 'react-redux'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'
import { formValueSelector, reduxForm, Field, FieldArray } from 'redux-form'
import moment from 'moment'
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ButtonToolbar, Button, ListGroup, ListGroupItem } from 'react-bootstrap'
import type { ProposalAdminSelections_proposal } from '~relay/ProposalAdminSelections_proposal.graphql'
import type { State, Dispatch } from '~/types'
import AlertForm from '../../Alert/AlertForm'
import component from '../../Form/Field'
import toggle from '../../Form/Toggle'
import SelectProposalMutation from '../../../mutations/SelectProposalMutation'
import ChangeSelectionStatusMutation from '../../../mutations/ChangeSelectionStatusMutation'
import ChangeCollectStatusMutation from '../../../mutations/ChangeCollectStatusMutation'
import ChangeProposalProgressStepsMutation from '../../../mutations/ChangeProposalProgressStepsMutation'
import UnselectProposalMutation from '../../../mutations/UnselectProposalMutation'
import ProposalAdminProgressSteps from './ProposalAdminProgressSteps'
import Flex from '~ui/Primitives/Layout/Flex'
import Icon, { ICON_NAME } from '~ds/Icon/Icon'
import UpdateProposalStepPaperVoteCounterMutation from '~/mutations/UpdateProposalStepPaperVoteCounterMutation'
import Text from '~ui/Primitives/Text'
import AppBox from '~ui/Primitives/AppBox'
import { Tooltip as DsTooltip } from '~ds/Tooltip/Tooltip'

export const formName = 'proposal-admin-selections'
const selector = formValueSelector(formName)
type FormValues = Record<string, any>
type PassedProps = {
  proposal: ProposalAdminSelections_proposal
}
type Props = PassedProps & {
  proposal: ProposalAdminSelections_proposal
  initialValues: FormValues
  intl: IntlShape
  selectionValues: Array<{
    step: string
    selected: boolean
    status: string | null | undefined
  }>
  handleSubmit: (...args: Array<any>) => any
  pristine: boolean
  invalid: boolean
  valid: boolean
  submitSucceeded: boolean
  submitFailed: boolean
  submitting: boolean
  paperVoteEnabled: boolean
}

const validate = (values: FormValues, props: Props) => {
  const errors: any = {}
  const paperVoteErrors = {}

  for (const stepId in values.paperVotes) {
    if (values.paperVotes[stepId].totalCount || values.paperVotes[stepId].totalPointsCount) {
      const voteStep = props.proposal.project?.steps.find(step => step.id === stepId)

      if (voteStep && voteStep.votesRanking) {
        const { totalCount, totalPointsCount } = values.paperVotes[stepId]
        const paperVoteStepErrors = {}

        if (undefined === totalCount) {
          paperVoteStepErrors.totalCount = 'error-paper-points-no-votes'
          paperVoteErrors[stepId] = paperVoteStepErrors
        } else if (undefined === totalPointsCount) {
          values.paperVotes[stepId].totalPointsCount = 0
          paperVoteStepErrors.totalPointsCount = 'error-paper-points-no-points'
          paperVoteErrors[stepId] = paperVoteStepErrors
        } else if (Number(totalCount) === 0 && Number(totalPointsCount) > 0) {
          paperVoteStepErrors.totalCount = 'error-paper-points-no-votes'
          paperVoteErrors[stepId] = paperVoteStepErrors
        } else if (Number(totalCount) > Number(totalPointsCount)) {
          paperVoteStepErrors.totalCount = 'error-paper-points-above-votes'
          paperVoteStepErrors.totalPointsCount = ' '
          paperVoteErrors[stepId] = paperVoteStepErrors
        }
      }
    }
  }

  errors.paperVotes = paperVoteErrors
  return errors
}

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { proposal } = props
  const promises = []

  for (const selection of values.selections) {
    const array = proposal.selections.filter(s => s.step.id === selection.step)
    const previousSelection = array.length ? array[0] : null

    if (selection.selected && previousSelection === null) {
      promises.push(
        SelectProposalMutation.commit({
          input: {
            stepId: selection.step,
            proposalId: proposal.id,
            statusId: selection.status,
          },
        }),
      )
    }

    if (selection.selected && previousSelection && previousSelection.status?.id !== selection.status) {
      promises.push(
        ChangeSelectionStatusMutation.commit({
          input: {
            stepId: selection.step,
            proposalId: proposal.id,
            statusId: selection.status,
          },
        }),
      )
    }

    if (!selection.selected && previousSelection) {
      promises.push(
        UnselectProposalMutation.commit({
          input: {
            stepId: selection.step,
            proposalId: proposal.id,
          },
        }),
      )
    }
  }

  if (values.progressSteps !== props.initialValues.progressSteps) {
    promises.push(
      ChangeProposalProgressStepsMutation.commit({
        input: {
          proposalId: proposal.id,
          progressSteps: values.progressSteps.map(v => ({
            title: v.title,
            startAt: moment(v.startAt).format('YYYY-MM-DD HH:mm:ss'),
            endAt: v.endAt ? moment(v.endAt).format('YYYY-MM-DD HH:mm:ss') : null,
          })),
        },
      }),
    )
  }

  if (values.collectStatus !== props.initialValues.collectStatus) {
    promises.push(
      ChangeCollectStatusMutation.commit({
        input: {
          proposalId: proposal.id,
          statusId: values.collectStatus,
        },
      }),
    )
  }

  for (const stepId in values.paperVotes) {
    if (!Number.isNaN(values.paperVotes[stepId].totalCount)) {
      const newCount = Number(values.paperVotes[stepId].totalCount)
      const newPoints =
        values.paperVotes[stepId].totalPointsCount && !Number.isNaN(values.paperVotes[stepId].totalPointsCount)
          ? Number(values.paperVotes[stepId].totalPointsCount)
          : 0

      if (
        newCount !== (props.initialValues.paperVotes[stepId]?.totalCount ?? 0) ||
        newPoints !== (props.initialValues.paperVotes[stepId]?.totalPointsCount ?? 0)
      ) {
        promises.push(
          UpdateProposalStepPaperVoteCounterMutation.commit({
            input: {
              proposal: proposal.id,
              step: stepId,
              totalCount: newCount,
              totalPointsCount: newPoints ?? 0,
            },
          }),
        )
      }
    }
  }

  return Promise.all(promises)
}

const paperVotesIndexed = paperVotes => {
  if (paperVotes) {
    return paperVotes.reduce((acc, paperVote) => {
      return {
        ...acc,
        [paperVote.step.id]: {
          totalCount: paperVote.totalCount,
          totalPointsCount: paperVote.totalPointsCount,
        },
      }
    }, {})
  }

  return {}
}

export class ProposalAdminSelections extends Component<Props> {
  render() {
    const {
      intl,
      selectionValues,
      proposal,
      handleSubmit,
      pristine,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      submitting,
      paperVoteEnabled,
    } = this.props
    const steps = proposal.project ? proposal.project.steps : []
    const collectStep = steps.filter(step => step.kind === 'collect')[0]
    const selectionSteps = steps.filter(step => step.kind === 'selection')
    return (
      <div className="box box-primary container-fluid">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="project.show.meta.step.title" />
          </h3>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href={intl.formatMessage({
              id: 'admin.help.link.proposal.advancement',
            })}
          >
            <i className="fa fa-info-circle" /> <FormattedMessage id="global.help" />
          </a>
        </div>
        <div className="box-content">
          <form onSubmit={handleSubmit}>
            <ListGroup
              style={{
                paddingBottom: 10,
              }}
            >
              <ListGroupItem>
                <div>
                  <strong>{collectStep.title}</strong> - <span>Etape de dépôt</span>
                </div>
                <br />
                <Field
                  label={<FormattedMessage id="published-in-this-step" tagName="div" />}
                  name="collectPublished"
                  id="collectPublished"
                  disabled
                  readOnly
                  component={toggle}
                />
                <div>
                  <Field
                    type="select"
                    label="Statut"
                    name="collectStatus"
                    id="collectStatus"
                    normalize={val => (val === '-1' ? null : val)}
                    component={component}
                  >
                    <option value="-1">
                      {intl.formatMessage({
                        id: 'global.no_status',
                      })}
                    </option>
                    {collectStep.statuses &&
                      collectStep.statuses.map(status => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                  </Field>
                </div>
                {collectStep.votable && paperVoteEnabled && (
                  <>
                    <Flex direction="row" align="center" spacing={1}>
                      <Text color="gray.900">
                        {intl.formatMessage({
                          id: 'paper-votes-field-label',
                        })}
                      </Text>
                      <DsTooltip
                        label={intl.formatMessage({
                          id: collectStep.votesRanking
                            ? 'paper-votes-field-help-tooltip'
                            : 'paper-votes-and-points-field-help-tooltip',
                        })}
                      >
                        <Flex>
                          <Icon name={ICON_NAME.CIRCLE_INFO} size="sm" color="blue.500" />
                        </Flex>
                      </DsTooltip>
                    </Flex>
                    <Text
                      color="gray.700"
                      style={{
                        marginTop: 0,
                      }}
                    >
                      {intl.formatMessage({
                        id: collectStep.votesRanking ? 'paper-votes-field-help-points' : 'paper-votes-field-help',
                      })}
                    </Text>
                    <Flex>
                      <AppBox maxWidth="200px">
                        <Field
                          label={
                            collectStep.votesRanking
                              ? intl.formatMessage(
                                  {
                                    id: 'vote-plural',
                                  },
                                  {
                                    num: 2,
                                  },
                                )
                              : ''
                          }
                          type="number"
                          name={`paperVotes[${collectStep.id}].totalCount`}
                          component={component}
                        />
                      </AppBox>
                      {collectStep.votesRanking && (
                        <Flex ml={4} maxWidth="200px">
                          <Field
                            label={intl.formatMessage(
                              {
                                id: 'points-plural',
                              },
                              {
                                num: 2,
                              },
                            )}
                            type="number"
                            name={`paperVotes[${collectStep.id}].totalPointsCount`}
                            component={component}
                          />
                        </Flex>
                      )}
                    </Flex>
                  </>
                )}
              </ListGroupItem>
              {selectionSteps.map((step, index) => (
                <ListGroupItem key={index} id={`item_${index}`}>
                  <div>
                    <strong>{step.title}</strong> - <span>Etape de sélection</span>
                  </div>
                  <br />
                  <Field
                    label={<FormattedMessage id="published-in-this-step" />}
                    id={`selections[${index}].selected`}
                    name={`selections[${index}].selected`}
                    component={toggle}
                    normalize={val => !!val}
                  />
                  {selectionValues[index] && selectionValues[index].selected && (
                    <div>
                      <Field
                        type="select"
                        label="Statut"
                        id={`selections[${index}].status`}
                        name={`selections[${index}].status`}
                        normalize={val => (val === '-1' ? null : val)}
                        component={component}
                      >
                        <option value="-1">
                          {intl.formatMessage({
                            id: 'global.no_status',
                          })}
                        </option>
                        {step.statuses &&
                          step.statuses.map(status => (
                            <option key={status.id} value={status.id}>
                              {status.name}
                            </option>
                          ))}
                      </Field>
                      {step.allowingProgressSteps && (
                        <FieldArray name="progressSteps" component={ProposalAdminProgressSteps} />
                      )}
                    </div>
                  )}
                  {step.votable && paperVoteEnabled && (
                    <>
                      <Flex direction="row" align="center" spacing={1}>
                        <Text color="gray.900">
                          {intl.formatMessage({
                            id: 'paper-votes-field-label',
                          })}
                        </Text>
                        <DsTooltip
                          placement="top"
                          id={`paper-vote-tooltip-${index}`}
                          key={intl.formatMessage({
                            id: step.votesRanking
                              ? 'paper-votes-field-help-tooltip'
                              : 'paper-votes-and-points-field-help-tooltip',
                          })}
                          label={intl.formatMessage({
                            id: step.votesRanking
                              ? 'paper-votes-field-help-tooltip'
                              : 'paper-votes-and-points-field-help-tooltip',
                          })}
                        >
                          <AppBox mt={1}>
                            <Icon name={ICON_NAME.CIRCLE_INFO} size="sm" color="blue.500" />
                          </AppBox>
                        </DsTooltip>
                      </Flex>
                      <Text
                        color="gray.700"
                        style={{
                          marginTop: 0,
                        }}
                      >
                        {intl.formatMessage({
                          id: step.votesRanking ? 'paper-votes-field-help-points' : 'paper-votes-field-help',
                        })}
                      </Text>
                      <Flex>
                        <AppBox maxWidth="200px">
                          <Field
                            label={
                              step.votesRanking
                                ? intl.formatMessage(
                                    {
                                      id: 'vote-plural',
                                    },
                                    {
                                      num: 2,
                                    },
                                  )
                                : ''
                            }
                            type="number"
                            name={`paperVotes[${step.id}].totalCount`}
                            component={component}
                          />
                        </AppBox>
                        {step.votesRanking && (
                          <Flex ml={4} maxWidth="200px">
                            <Field
                              style={{
                                maxWidth: '200px',
                              }}
                              label={intl.formatMessage(
                                {
                                  id: 'points-plural',
                                },
                                {
                                  num: 2,
                                },
                              )}
                              type="number"
                              name={`paperVotes[${step.id}].totalPointsCount`}
                              component={component}
                            />
                          </Flex>
                        )}
                      </Flex>
                    </>
                  )}
                </ListGroupItem>
              ))}
            </ListGroup>
            <ButtonToolbar className="box-content__toolbar">
              <Button
                type="submit"
                bsStyle="primary"
                id="proposal_advancement_save"
                disabled={pristine || invalid || submitting}
              >
                <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
              </Button>
              <AlertForm
                valid={valid}
                invalid={invalid}
                submitSucceeded={submitSucceeded}
                submitFailed={submitFailed}
                submitting={submitting}
              />
            </ButtonToolbar>
          </form>
        </div>
      </div>
    )
  }
}
const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(ProposalAdminSelections)

const mapStateToProps = (state: State, props: PassedProps) => {
  const steps = props.proposal.project ? props.proposal.project.steps : []
  const selectionSteps = steps.filter(step => step.kind === 'selection')
  return {
    selectionValues: selector(state, 'selections') || [],
    initialValues: {
      collectPublished: true,
      progressSteps: props.proposal.progressSteps,
      collectStatus: props.proposal.status ? props.proposal.status.id : null,
      selections: selectionSteps.map(step => {
        const selectionAsArray = props.proposal.selections.filter(selection => selection.step.id === step.id)
        const selection = selectionAsArray.length ? selectionAsArray[0] : null
        const selected = selection != null
        return {
          step: step.id,
          selected,
          status: selection && selection.status ? selection.status.id : null,
        }
      }),
      paperVotes: paperVotesIndexed(props.proposal.paperVotes),
    },
    paperVoteEnabled: state.default.features.paper_vote ?? false,
  }
}

// @ts-ignore
const container = connect<any, any>(mapStateToProps)(injectIntl(form))
export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalAdminSelections_proposal on Proposal {
      id
      status {
        id
      }
      progressSteps {
        id
        title
        startAt
        endAt
      }
      selections {
        step {
          id
        }
        status {
          id
        }
      }
      project {
        steps {
          id
          title
          kind
          ... on SelectionStep {
            allowingProgressSteps
            statuses {
              id
              name
            }
            votable
            votesRanking
          }
          ... on CollectStep {
            statuses {
              id
              name
            }
            votable
            votesRanking
          }
        }
      }
      paperVotes {
        step {
          id
        }
        totalCount
        totalPointsCount
      }
    }
  `,
})
