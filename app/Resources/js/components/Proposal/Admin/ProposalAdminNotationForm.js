// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { type FormProps, reduxForm, formValueSelector, Field, FieldArray } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { Glyphicon, ButtonToolbar, Button } from 'react-bootstrap';
import AlertAdminForm from '../../Alert/AlertAdminForm';
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
  formatResponsesToSubmit,
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
  values.likers = values.likers.map(u => u.value);

  const promises = [];
  promises.push(
    ChangeProposalNotationMutation.commit({
      input: {
        proposalId: props.proposal.id,
        estimation: values.estimation,
        likers: values.likers,
      },
    }),
  );

  if (props.proposal.form.evaluationForm) {
    const variablesEvaluation = {
      input: { proposalId: props.proposal.id, responses: formatResponsesToSubmit(values, props) },
    };

    promises.push(ChangeProposalEvaluationMutation.commit(variablesEvaluation));
  }

  return Promise.all(promises);
};

export const validate = (values: FormValues, { proposal }: Props) => {
  const errors = {};
  const responsesArrayErrors = [];
  const questions = proposal.form.evaluationForm ? proposal.form.evaluationForm.questions : [];

  if (values.responses) {
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

        if (rule.type === 'min' && currentLength < rule.number) {
          const responseError = {};
          responseError.value = {
            id: 'reply.constraints.choices_min',
            values: {
              nb: rule.number,
            },
          };

          responsesArrayErrors[index] = responseError;
        }

        if (rule.type === 'max' && currentLength > rule.number) {
          const responseError = {};
          responseError.value = {
            id: 'reply.constraints.choices_max',
            values: {
              nb: rule.number,
            },
          };

          responsesArrayErrors[index] = responseError;
        }

        if (rule.type === 'equal' && currentLength !== Number(rule.number)) {
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
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      pristine,
      handleSubmit,
      submitting,
      proposal,
    } = this.props;
    const evaluationForm = proposal.form.evaluationForm;

    return (
      <div className="box box-primary container">
        <div className="box-content box-content__notation-form">
          <div>
            <ProposalAdminEvaluersForm proposal={proposal} />
            <form onSubmit={handleSubmit}>
              <div className="mb-40">
                <div className="box-header">
                  <h3 className="box-title">
                    <FormattedMessage id="Questionnaire" />
                  </h3>
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
                      .catch(e => console.error(e))}
                />
              </div>

              {evaluationForm && (
                <div>
                  <h3>
                    <FormattedMessage id="proposal.admin.personalize" />
                  </h3>
                  <hr />
                </div>
              )}
              <FieldArray
                name="responses"
                component={renderResponses}
                questions={evaluationForm.questions}
                responses={this.props.responses}
                intl={this.props.intl}
              />
              <ButtonToolbar style={{ marginBottom: 10 }} className="box-content__toolbar">
                <Button
                  disabled={invalid || pristine || submitting}
                  type="submit"
                  bsStyle="primary">
                  <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
                </Button>
                <AlertAdminForm
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

export const formatInitialResponses = (props: MinimalRelayProps | RelayProps) => {
  return !props.proposal.form.evaluationForm || !props.proposal.form.evaluationForm.questions
    ? []
    : formatInitialResponsesValues(
        props.proposal.form.evaluationForm.questions,
        props.proposal.evaluation ? props.proposal.evaluation.responses : [],
      );
};

const mapStateToProps = (state: State, props: RelayProps) => ({
  responses: formValueSelector(formName)(state, 'responses'),
  initialValues: {
    estimation: props.proposal.estimation,
    likers: props.proposal.likers.map(u => ({
      value: u.id,
      label: u.displayName,
    })),
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
          questions {
            id
            title
            position
            private
            required
            helpText
            type
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
            }
          }
        }
      }
      evaluation {
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
