// @flow
import React from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector, Field, FieldArray } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { Glyphicon, ButtonToolbar, Button } from 'react-bootstrap';
import AlertAdminForm from '../../Alert/AlertAdminForm';
import ChangeProposalNotationMutation from '../../../mutations/ChangeProposalNotationMutation';
import ChangeProposalEvaluationMutation from '../../../mutations/ChangeProposalEvaluationMutation';
import component from '../../Form/Field';
import select from '../../Form/Select';
import Fetcher from '../../../services/Fetcher';
import type { ProposalAdminNotationForm_proposal } from './__generated__/ProposalAdminNotationForm_proposal.graphql';
import type { Dispatch, State } from '../../../types';
import { MultipleChoiceRadio } from '../../Form/MultipleChoiceRadio';

type FormValues = Object;
type RelayProps = { proposal: ProposalAdminNotationForm_proposal };
type Props = RelayProps & {
  intl: intlShape,
  handleSubmit: () => void,
  invalid: boolean,
  valid: boolean,
  submitSucceeded: boolean,
  submitFailed: boolean,
  pristine: boolean,
  submitting: boolean,
  proposal: ProposalAdminNotationForm_proposal,
  initialValues: Object,
  fields: Object,
  evaluationForm: Object,
  change: Function,
  responses: Array<Object>,
};

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
    const questions = props.proposal.form.evaluationForm.questions;
    const responses = values.responses.map(resp => {
      const actualQuestion = questions.find(question => question.id === String(resp.question));
      const questionType = actualQuestion.type;

      let value;
      if (questionType === 'ranking' || questionType === 'button') {
        value = JSON.stringify({
          labels: Array.isArray(resp.value) ? resp.value : [resp.value],
          other: null,
        });
      } else if (questionType === 'checkbox' || questionType === 'radio') {
        value = JSON.stringify(resp.value);
      } else {
        value = resp.value;
      }

      return {
        question: actualQuestion.id,
        value,
      };
    });

    const variablesEvaluation = {
      input: { proposalId: props.proposal.id, responses },
    };

    promises.push(ChangeProposalEvaluationMutation.commit(variablesEvaluation));
  }

  return Promise.all(promises);
};

const validate = (values: FormValues, { proposal }: Props) => {
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

const formattedChoicesInField = field => {
  return field.choices.map(choice => {
    return {
      id: choice.id,
      label: choice.title,
      description: choice.description,
      color: choice.color,
    };
  });
};

const renderResponses = ({
  fields,
  evaluationForm,
  responses,
  change,
  intl,
}: {
  fields: Object,
  evaluationForm: Object,
  responses: Array<Object>,
  change: Function,
  intl: intlShape,
}) => (
  <div>
    {fields.map((member, index) => {
      const field = evaluationForm.questions[index];
      const key = field.slug;
      const inputType = field.type || 'text';
      const isOtherAllowed = field.isOtherAllowed;

      let labelMessage = field.title;
      let intlMessage;
      if (field.required) {
        intlMessage = intl.formatMessage({ id: 'global.mandatory' });
      } else {
        intlMessage = intl.formatMessage({ id: 'global.optional' });
      }

      labelMessage += ` <span class="small warning">${intlMessage}</span>`;
      const label = <span dangerouslySetInnerHTML={{ __html: labelMessage }} />;

      switch (inputType) {
        case 'medias': {
          return (
            <p className="text-danger" key={`${member}-container`}>
              <Glyphicon bsClass="glyphicon" glyph="alert" />
              <span className="ml-10">
                <FormattedMessage id="evaluation_form.constraints.medias" />
              </span>
            </p>
          );
        }
        default: {
          let response;
          if (responses) {
            response = responses[index].value;
          }

          let choices = [];
          if (
            inputType === 'ranking' ||
            inputType === 'radio' ||
            inputType === 'checkbox' ||
            inputType === 'button'
          ) {
            choices = formattedChoicesInField(field);
            if (inputType === 'radio') {
              return (
                <div key={`${member}-container`}>
                  <MultipleChoiceRadio
                    name={member}
                    helpText={field.helpText}
                    isOtherAllowed={isOtherAllowed}
                    label={label}
                    choices={choices}
                    value={response}
                    change={change}
                  />
                </div>
              );
            }
          }

          return (
            <Field
              key={key}
              name={`${member}.value`}
              id={`reply-${field.id}`}
              type={inputType}
              component={component}
              help={field.helpText}
              isOtherAllowed={isOtherAllowed}
              labelClassName="h4"
              placeholder="reply.your_response"
              choices={choices}
              label={label}
            />
          );
        }
      }
    })}
  </div>
);

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
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="proposal.admin.general" />
          </h3>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/86-editer-une-proposition-dune-etape-de-depot#contenu">
            <i className="fa fa-info-circle" /> Aide
          </a>
        </div>
        <div className="box-content box-content__notation-form">
          <form onSubmit={handleSubmit}>
            <div>
              <div className="mb-40">
                <Field
                  name="estimation"
                  component={component}
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
                    Fetcher.postToJson(`/users/search`, { terms }).then(res => ({
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
                    }))}
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
                evaluationForm={evaluationForm}
                responses={this.props.responses}
                change={this.props.change}
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
                  submitFailded={submitFailed}
                  submitting={submitting}
                />
              </ButtonToolbar>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

const form = injectIntl(
  reduxForm({
    onSubmit,
    validate,
    form: formName,
  })(ProposalAdminNotationForm),
);

const mapStateToProps = (state: State, props: RelayProps) => ({
  responses: formValueSelector(formName)(state, 'responses'),
  initialValues: {
    estimation: props.proposal.estimation,
    likers: props.proposal.likers.map(u => ({
      value: u.id,
      label: u.displayName,
    })),
    responses:
      !props.proposal.form.evaluationForm || !props.proposal.form.evaluationForm.questions
        ? undefined
        : props.proposal.form.evaluationForm.questions.map(field => {
            const response = props.proposal.evaluation
              ? props.proposal.evaluation.responses.filter(
                  res => res && res.question.id === field.id,
                )[0]
              : null;
            if (response) {
              if (response.value) {
                let responseValue = response.value;

                const questionType = response.question.type;
                if (questionType === 'button') {
                  responseValue = JSON.parse(response.value).labels[0];
                }

                if (questionType === 'radio') {
                  responseValue = JSON.parse(response.value);
                }

                if (questionType === 'ranking') {
                  responseValue = JSON.parse(response.value).labels;
                }

                if (questionType === 'checkbox') {
                  responseValue = JSON.parse(response.value);
                }

                return {
                  question: parseInt(field.id, 10),
                  value: responseValue,
                };
              }
            }

            return { question: parseInt(field.id, 10), value: null };
          }),
  },
});

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalAdminNotationForm_proposal on Proposal {
      id
      estimation
      likers {
        id
        displayName
      }
      form {
        evaluationForm {
          questions {
            id
            title
            slug
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
            type
          }
          ... on ValueResponse {
            value
          }
        }
      }
    }
  `,
);
