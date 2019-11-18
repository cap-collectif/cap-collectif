// @flow
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { formValueSelector, reduxForm, Field, FieldArray } from 'redux-form';
import moment from 'moment';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ButtonToolbar, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import type { ProposalAdminSelections_proposal } from '~relay/ProposalAdminSelections_proposal.graphql';
import type { State, Dispatch } from '../../../types';
import AlertForm from '../../Alert/AlertForm';
import component from '../../Form/Field';
import toggle from '../../Form/Toggle';
import SelectProposalMutation from '../../../mutations/SelectProposalMutation';
import ChangeSelectionStatusMutation from '../../../mutations/ChangeSelectionStatusMutation';
import ChangeCollectStatusMutation from '../../../mutations/ChangeCollectStatusMutation';
import ChangeProposalProgressStepsMutation from '../../../mutations/ChangeProposalProgressStepsMutation';
import UnselectProposalMutation from '../../../mutations/UnselectProposalMutation';
import ProposalAdminProgressSteps from './ProposalAdminProgressSteps';

export const formName = 'proposal-admin-selections';
const selector = formValueSelector(formName);

type FormValues = Object;
type PassedProps = {
  proposal: ProposalAdminSelections_proposal,
};

type Props = PassedProps & {
  initialValues: FormValues,
  intl: IntlShape,
  selectionValues: Array<{ step: string, selected: boolean, status: ?string }>,
  handleSubmit: Function,
  pristine: boolean,
  invalid: boolean,
  valid: boolean,
  submitSucceeded: boolean,
  submitFailed: boolean,
  submitting: boolean,
};

const validate = () => {
  const errors = {};
  return errors;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { proposal } = props;
  const promises = [];
  for (const selection of values.selections) {
    const array = proposal.selections.filter(s => s.step.id === selection.step);
    const previousSelection = array.length ? array[0] : null;

    if (selection.selected && previousSelection === null) {
      promises.push(
        SelectProposalMutation.commit({
          input: {
            stepId: selection.step,
            proposalId: proposal.id,
            statusId: selection.status,
          },
        }),
      );
    }
    if (selection.selected && previousSelection && previousSelection.status !== selection.status) {
      promises.push(
        ChangeSelectionStatusMutation.commit({
          input: {
            stepId: selection.step,
            proposalId: proposal.id,
            statusId: selection.status,
          },
        }),
      );
    }
    if (!selection.selected && previousSelection) {
      promises.push(
        UnselectProposalMutation.commit({
          input: {
            stepId: selection.step,
            proposalId: proposal.id,
          },
        }),
      );
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
    );
  }

  if (values.collectStatus !== props.initialValues.collectStatus) {
    promises.push(
      ChangeCollectStatusMutation.commit({
        input: {
          proposalId: proposal.id,
          statusId: values.collectStatus,
        },
      }),
    );
  }
  return Promise.all(promises);
};

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
    } = this.props;
    const steps = proposal.project ? proposal.project.steps : [];
    const collectStep = steps.filter(step => step.kind === 'collect')[0];
    const selectionSteps = steps.filter(step => step.kind === 'selection');
    return (
      <div className="box box-primary container-fluid">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="proposal.admin.steps" />
          </h3>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href={intl.formatMessage({ id: 'admin.help.link.proposal.advancement' })}>
            <i className="fa fa-info-circle" /> <FormattedMessage id="global.help" />
          </a>
        </div>
        <div className="box-content">
          <form onSubmit={handleSubmit}>
            <ListGroup style={{ paddingBottom: 10 }}>
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
                    component={component}>
                    <option value="-1">{intl.formatMessage({ id: 'proposal.no_status' })}</option>
                    {collectStep.statuses &&
                      collectStep.statuses.map(status => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                  </Field>
                </div>
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
                        component={component}>
                        <option value="-1">
                          {intl.formatMessage({ id: 'proposal.no_status' })}
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
                </ListGroupItem>
              ))}
            </ListGroup>
            <ButtonToolbar className="box-content__toolbar">
              <Button
                type="submit"
                bsStyle="primary"
                id="proposal_advancement_save"
                disabled={pristine || invalid || submitting}>
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
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(ProposalAdminSelections);

const mapStateToProps = (state: State, props: PassedProps) => {
  const steps = props.proposal.project ? props.proposal.project.steps : [];
  const selectionSteps = steps.filter(step => step.kind === 'selection');
  return {
    selectionValues: selector(state, 'selections') || [],
    initialValues: {
      collectPublished: true,
      progressSteps: props.proposal.progressSteps,
      collectStatus: props.proposal.status ? props.proposal.status.id : null,
      selections: selectionSteps.map(step => {
        const selectionAsArray = props.proposal.selections.filter(
          selection => selection.step.id === step.id,
        );
        const selection = selectionAsArray.length ? selectionAsArray[0] : null;
        const selected = selection != null;
        return {
          step: step.id,
          selected,
          status: selection && selection.status ? selection.status.id : null,
        };
      }),
    },
  };
};

const container = connect(mapStateToProps)(injectIntl(form));

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
          }
          ... on CollectStep {
            statuses {
              id
              name
            }
          }
        }
      }
    }
  `,
});
