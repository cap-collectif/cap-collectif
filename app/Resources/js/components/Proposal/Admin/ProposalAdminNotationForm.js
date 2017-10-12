// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { Glyphicon, ButtonToolbar, Button } from 'react-bootstrap';
import ChangeProposalNotationMutation from '../../../mutations/ChangeProposalNotationMutation';
import ChangeProposalEvaluationMutation from '../../../mutations/ChangeProposalEvaluationMutation';
import component from '../../Form/Field';
import select from '../../Form/Select';
import Fetcher from '../../../services/Fetcher';
import type { ProposalAdminNotationForm_proposal } from './__generated__/ProposalAdminNotationForm_proposal.graphql';
import type { Dispatch } from '../../../types';

type FormValues = Object;
type RelayProps = { proposal: ProposalAdminNotationForm_proposal };
type Props = RelayProps & {
  handleSubmit: () => {},
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
  disabled: boolean,
  formValidationRules: Object,
  proposal: ProposalAdminNotationForm_proposal,
  initialValues: Object,
};

type State = { form: Object };

const formName = 'proposal-admin-evaluation';
const validate = () => {
  const errors = {};
  return errors;
};

const getRequiredFieldIndicationStrategy = (fields: Array<{ required: boolean }>) => {
  const numberOfRequiredFields = fields.reduce((a, b) => a + (b.required ? 1 : 0), 0);
  const numberOfFields = fields.length;
  const halfNumberOfFields = numberOfFields / 2;
  if (numberOfRequiredFields === 0) {
    return 'no_required';
  }
  if (numberOfRequiredFields === numberOfFields) {
    return 'all_required';
  }
  if (numberOfRequiredFields === halfNumberOfFields) {
    return 'half_required';
  }
  if (numberOfRequiredFields > halfNumberOfFields) {
    return 'majority_required';
  }
  return 'minority_required';
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  values.likers = values.likers.map(u => u.value);

  const promises = [];

  const variables = {
    input: {
      proposalId: props.proposal.id,
      estimation: values.estimation,
      likers: values.likers,
    },
  };

  const responses = values.responses.map(resp => {
    const questions = props.proposal.form.evaluationForm.questions;
    const actualQuestion = questions.find(question => question.id === String(resp.question));
    const questionType = actualQuestion.type;

    let value;
    if (
      questionType === 'ranking' ||
      questionType === 'radio' ||
      questionType === 'checkbox' ||
      questionType === 'button'
    ) {
      value = JSON.stringify({
        labels: resp.value,
        other: null,
      });
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

  // console.log(variables);
  // console.log(variablesEvaluation);

  promises.push(ChangeProposalNotationMutation.commit(variables));
  promises.push(ChangeProposalEvaluationMutation.commit(variablesEvaluation));

  return Promise.all(promises)
    .then(() => {
      // location.reload();
    })
    .catch(() => {});
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

export class ProposalAdminNotationForm extends React.Component<Props, State> {
  static get defaultProps() {
    return {
      formValidationRules: {},
    };
  }

  constructor(props: Props) {
    super(props);
    const form = {};

    if (props.proposal.form.evaluationForm && props.proposal.form.evaluationForm.questions) {
      props.proposal.form.evaluationForm.questions.forEach(field => {
        if (field.type === 'button') {
          form[field.id] = field.choices[0].label;
        } else if (field.type === 'checkbox') {
          form[field.id] = [];
        } else {
          form[field.id] = '';
        }

        let fieldRules: Object = {};

        if (field.required) {
          if (field.type === 'checkbox' || field.type === 'ranking') {
            fieldRules = {
              notEmpty: { message: 'reply.constraints.field_mandatory' },
            };
          } else {
            fieldRules = {
              notBlank: { message: 'reply.constraints.field_mandatory' },
            };
          }
        }
        if (field.validationRule && field.type !== 'button') {
          const rule = field.validationRule;
          switch (rule.type) {
            case 'min': {
              fieldRules.min = {
                message: 'reply.constraints.choices_min',
                messageParams: { nb: rule.number },
                value: rule.number,
              };
              break;
            }
            case 'max': {
              fieldRules.max = {
                message: 'reply.constraints.choices_max',
                messageParams: { nb: rule.number },
                value: rule.number,
              };
              break;
            }
            case 'equal': {
              fieldRules.length = {
                message: 'reply.constraints.choices_equal',
                messageParams: { nb: rule.number },
                value: rule.number,
              };
              break;
            }
            default:
              break;
          }
        }
      });
    }

    this.state = { form };
  }

  render() {
    const { invalid, pristine, handleSubmit, submitting, proposal, initialValues } = this.props;
    const evaluationForm = proposal.form.evaluationForm;

    let strategy = null;
    if (evaluationForm) {
      strategy = getRequiredFieldIndicationStrategy(proposal.form.evaluationForm.questions);
    }

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

              {evaluationForm &&
                evaluationForm.questions && (
                  <FieldArray
                    name="responses"
                    component={({ fields }) => (
                      <div>
                        {fields.map((field, index) => {
                          const key = field.slug;
                          const inputType = field.type || 'text';
                          const labelAppend = field.required
                            ? strategy === 'minority_required'
                              ? ' <span class="small warning"><FormattedMessage id="proposal.mandatory"/></span>'
                              : ''
                            : strategy === 'majority_required' || strategy === 'half_required'
                              ? ' <span class="small excerpt"><FormattedMessage id="proposal.optional"/></span>'
                              : '';
                          const labelMessage = field.title + labelAppend;
                          const label = <span dangerouslySetInnerHTML={{ __html: labelMessage }} />;

                          switch (inputType) {
                            case 'medias': {
                              return (
                                <p className="text-danger">
                                  <Glyphicon bsClass="glyphicon" glyph="alert" />
                                  <span className="ml-10">
                                    <FormattedMessage id="evaluation_form.constraints.medias" />
                                  </span>
                                </p>
                              );
                            }

                            default: {
                              let choices;
                              let checkedValue;
                              if (
                                inputType === 'ranking' ||
                                inputType === 'radio' ||
                                inputType === 'checkbox' ||
                                inputType === 'button'
                              ) {
                                choices = formattedChoicesInField(field);

                                if (inputType === 'radio') {
                                  checkedValue = initialValues.responses[index].value;
                                }
                              }

                              return (
                                <Field
                                  key={key}
                                  name={`responses.${index}.value`}
                                  id={`reply-${field.id}`}
                                  type={inputType}
                                  component={component}
                                  help={field.helpText}
                                  labelClassName="h4"
                                  placeholder="reply.your_response"
                                  choices={choices}
                                  label={label}
                                  checkedValue={checkedValue}
                                />
                              );
                            }
                          }
                        })}
                      </div>
                    )}
                    fields={evaluationForm.questions}
                  />
                )}

              <ButtonToolbar style={{ marginBottom: 10 }} className="box-content__toolbar">
                <Button
                  disabled={invalid || pristine || submitting}
                  type="submit"
                  bsStyle="primary">
                  <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
                </Button>
              </ButtonToolbar>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  form: formName,
})(ProposalAdminNotationForm);

const mapStateToProps = (state: State, props: RelayProps) => ({
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
            if (!props.proposal.proposalEvaluation) {
              return;
            }
            const response = props.proposal.proposalEvaluation.responses.filter(
              res => res && res.question.id === field.id,
            )[0];
            if (response) {
              if (response.value) {
                let responseValue = response.value;

                const questionType = response.question.type;
                if (questionType === 'radio' || questionType === 'button') {
                  responseValue = JSON.parse(response.value).labels[0];
                }

                if (questionType === 'checkbox' || questionType === 'ranking') {
                  responseValue = JSON.parse(response.value).labels;
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
      proposalEvaluation {
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
