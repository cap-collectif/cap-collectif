// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import {
  type FormProps,
  SubmissionError,
  reduxForm,
  formValueSelector,
  Field,
  FieldArray,
} from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { Glyphicon, ButtonToolbar, Button } from 'react-bootstrap';
import AlertForm from '../../Alert/AlertForm';
import ChangeProposalNotationMutation from '../../../mutations/ChangeProposalNotationMutation';
import ChangeProposalEvaluationMutation from '../../../mutations/ChangeProposalEvaluationMutation';
import component from '../../Form/Field';
import select from '../../Form/Select';
import Fetcher from '../../../services/Fetcher';
import ProposalAdminEvaluersForm from './ProposalAdminEvaluersForm';
import type { ProposalAdminNotationForm_proposal } from './__generated__/ProposalAdminNotationForm_proposal.graphql';
import type { ProposalPageEvaluation_proposal } from '../Page/__generated__/ProposalPageEvaluation_proposal.graphql';
import {
  formatInitialResponsesValues,
  formatSubmitResponses,
  renderResponses,
} from '../../../utils/responsesHelper';
import type { Dispatch, State } from '../../../types';

export type ResponsesValues = Array<Object>;
type FormValues = { responses: ResponsesValues } & Object;
type MinimalRelayProps = { proposal: ProposalPageEvaluation_proposal };
type RelayProps = { proposal: ProposalAdminNotationForm_proposal };
type Props = RelayProps & FormProps & FormValues & { intl: IntlShape };

const formName = 'proposal-admin-evaluation';

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const data = {
    ...values,
    likers: values.likers.map(u => u.value),
  };

  if (props.proposal.form.evaluationForm) {
    const evaluationInput = {
      input: {
        proposalId: props.proposal.id,
        version: props.proposal.evaluation ? props.proposal.evaluation.version : 1,
        responses: formatSubmitResponses(
          data.responses,
          props.proposal.form.evaluationForm.questions,
        ),
      },
    };
    return ChangeProposalEvaluationMutation.commit(evaluationInput).then(response => {
      if (!response.changeProposalEvaluation) {
        throw new SubmissionError({
          _error: 'proposal_form.admin.evaluation.error.modified_since',
        });
      } else {
        return ChangeProposalNotationMutation.commit({
          input: {
            proposalId: props.proposal.id,
            estimation: data.estimation,
            likers: data.likers,
          },
        });
      }
    });
  }
  return ChangeProposalNotationMutation.commit({
    input: {
      proposalId: props.proposal.id,
      estimation: data.estimation,
      likers: data.likers,
    },
  });
};

export const validate = (values: FormValues, { proposal }: Props) => {
  const errors = {};
  const responsesArrayErrors = [];
  const questions = proposal.form.evaluationForm ? proposal.form.evaluationForm.questions : [];

  if (questions && values.responses) {
    values.responses.forEach((response, index) => {
      const currentQuestion = questions.find(question => question.id === String(response.question));

      if (response.value && currentQuestion && currentQuestion.validationRule) {
        const rule = currentQuestion.validationRule;
        let currentLength = 0;
        if (currentQuestion.type === 'checkbox' || currentQuestion.type === 'radio') {
          if (response.value.labels) {
            currentLength = response.value.labels.length;
          }

          if (response.value.other !== null) {
            currentLength += 1;
          }
        } else {
          currentLength = response.value.length;
        }

        if (rule.number && rule.type === 'min' && currentLength < Number(rule.number)) {
          const responseError = {};
          responseError.value = {
            id: 'reply.constraints.choices_min',
            values: {
              nb: rule.number,
            },
          };

          responsesArrayErrors[index] = responseError;
        }

        if (rule.number && rule.type === 'max' && currentLength > Number(rule.number)) {
          const responseError = {};
          responseError.value = {
            id: 'reply.constraints.choices_max',
            values: {
              nb: rule.number,
            },
          };

          responsesArrayErrors[index] = responseError;
        }

        if (rule.number && rule.type === 'equal' && currentLength !== Number(rule.number)) {
          const responseError = {};
          responseError.value = {
            id: 'reply.constraints.choices_equal',
            values: {
              nb: rule.number,
            },
          };

          responsesArrayErrors[index] = responseError;
        }
      }

      if (currentQuestion && currentQuestion.required) {
        let currentValue = response.value;

        if (currentQuestion.type === 'checkbox' || currentQuestion.type === 'radio') {
          if (response.value && response.value.labels !== null) {
            currentValue = response.value.labels;
          } else if (response.value && response.value.other !== null) {
            currentValue = response.value.other;
          } else {
            currentValue = null;
          }
        }

        if (!currentValue || currentValue.length === 0) {
          const responseError = {};
          responseError.value = 'global.constraints.notBlank';
          responsesArrayErrors[index] = responseError;
        }
      }
    });
  }

  if (responsesArrayErrors.length) {
    errors.responses = responsesArrayErrors;
  }

  return errors;
};

export class ProposalAdminNotationForm extends React.Component<Props> {
  render() {
    const {
      error,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      pristine,
      handleSubmit,
      submitting,
      proposal,
      form,
      intl,
    } = this.props;
    const evaluationForm = proposal.form.evaluationForm;
    return (
      <div className="box box-primary container-fluid">
        <div className="box-content box-content__notation-form">
          <div>
            <ProposalAdminEvaluersForm proposal={proposal} />
            <form onSubmit={handleSubmit}>
              <div className="mb-40">
                <div className="box-header">
                  <h3 className="box-title">
                    <FormattedMessage id="Questionnaire" />
                  </h3>
                  <a
                    className="pull-right link"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={intl.formatMessage({ id: 'admin.help.link.proposal.evaluation' })}>
                    <i className="fa fa-info-circle" /> <FormattedMessage id="global.help" />
                  </a>
                </div>
                <Field
                  name="estimation"
                  component={component}
                  normalize={val => parseInt(val, 10)}
                  type="number"
                  id="proposal_estimation"
                  addonAfter={<Glyphicon glyph="euro" />}
                  label={<FormattedMessage id="proposal.estimation" />}
                />
                <Field
                  name="likers"
                  id="likers"
                  label="Coup(s) de coeur"
                  labelClassName="control-label"
                  inputClassName="fake-inputClassName"
                  multi
                  placeholder="Sélectionnez un coup de coeur"
                  component={select}
                  clearable={false}
                  loadOptions={terms =>
                    Fetcher.postToJson(`/users/search`, { terms })
                      .then(res => ({
                        options: res.users
                          .map(u => ({
                            value: u.id,
                            label: u.displayName,
                          }))
                          .concat(
                            proposal.likers.map(u => ({
                              value: u.id,
                              label: u.displayName,
                            })),
                          ),
                      }))
                      // eslint-disable-next-line no-console
                      .catch(e => console.error(e))
                  }
                />
              </div>

              {evaluationForm && (
                <div className="box-header">
                  <h3 className="box-title">
                    <FormattedMessage id="proposal.admin.personalize" />
                  </h3>
                </div>
              )}
              <FieldArray
                name="responses"
                component={renderResponses}
                form={form}
                questions={evaluationForm ? evaluationForm.questions : []}
                responses={this.props.responses}
                intl={this.props.intl}
              />
              <ButtonToolbar className="box-content__toolbar">
                <Button
                  id="proposal-evaluation-custom-save"
                  disabled={invalid || pristine || submitting}
                  type="submit"
                  bsStyle="primary">
                  <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
                </Button>
                <AlertForm
                  valid={valid}
                  errorMessage={error}
                  invalid={invalid}
                  submitSucceeded={submitSucceeded}
                  submitFailed={submitFailed}
                  submitting={submitting}
                />
              </ButtonToolbar>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const form = injectIntl(
  reduxForm({
    onSubmit,
    validate,
    enableReinitialize: true,
    form: formName,
  })(ProposalAdminNotationForm),
);

export const formatInitialResponses = (props: MinimalRelayProps | RelayProps) =>
  !props.proposal.form.evaluationForm || !props.proposal.form.evaluationForm.questions
    ? []
    : formatInitialResponsesValues(
        props.proposal.form.evaluationForm.questions,
        props.proposal.evaluation ? props.proposal.evaluation.responses : [],
      );

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: RelayProps) => ({
  responses: formValueSelector(formName)(state, 'responses'),
  initialValues: {
    estimation: props.proposal.estimation,
    likers: props.proposal.likers.map(u => ({
      value: u.id,
      label: u.displayName,
    })),
    version: props.proposal.evaluation ? props.proposal.evaluation.version : 1,
    responses: formatInitialResponses(props),
  },
});

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalAdminNotationForm_proposal on Proposal {
      id
      estimation
      ...ProposalAdminEvaluersForm_proposal
      likers {
        id
        displayName
      }
      form {
        evaluationForm {
          description
          questions {
            id
            title
            private
            position
            required
            helpText
            jumps {
              id
              always
              destination {
                id
                title
              }
              conditions {
                id
                operator
                question {
                  id
                  title
                }
                ... on MultipleChoiceQuestionLogicJumpCondition {
                  value {
                    id
                    title
                  }
                }
              }
            }
            description
            type
            ... on MultipleChoiceQuestion {
              isOtherAllowed
              validationRule {
                type
                number
              }
              choices {
                id
                title
                description
                color
                image {
                  url
                }
              }
            }
          }
        }
      }
      evaluation {
        version
        responses {
          question {
            id
          }
          ... on ValueResponse {
            value
          }
          ... on MediaResponse {
            medias {
              id
              name
              url
              size
            }
          }
        }
      }
    }
  `,
);
