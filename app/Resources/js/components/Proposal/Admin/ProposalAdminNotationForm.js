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
import type { Dispatch, State } from '../../../types';

type FormValues = Object;
type RelayProps = { proposal: ProposalAdminNotationForm_proposal };
type Props = RelayProps & {
  handleSubmit: () => void,
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
  proposal: ProposalAdminNotationForm_proposal,
  initialValues: Object,
  fields: Object,
  evaluationForm: Object,
};

const formName = 'proposal-admin-evaluation';

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
        labels: Array.isArray(resp.value) ? resp.value : [resp.value],
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

  promises.push(ChangeProposalNotationMutation.commit(variables));
  promises.push(ChangeProposalEvaluationMutation.commit(variablesEvaluation));

  return Promise.all(promises)
    .then(() => {
      location.reload();
    })
    .catch(() => {});
};

const validate = (values: FormValues, { proposal }: Props) => {
  const errors = {};
  const questions = proposal.form.evaluationForm.questions;

  const responsesArrayErrors = [];
  values.responses.forEach((response, index) => {
    const currentQuestion = questions.find(question => question.id === String(response.question));

    if (currentQuestion && currentQuestion.required) {
      if (!response.value || response.value.length === 0) {
        const responseError = {};
        responseError.value = 'global.constraints.notBlank';
        responsesArrayErrors[index] = responseError;
      }
    } else if (currentQuestion && currentQuestion.validationRule) {
      // todo
    }
  });

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
  initialValues,
}: {
  fields: Object,
  evaluationForm: Object,
  initialValues: Object,
}) => (
  <div>
    {fields.map((member, index) => {
      const field = evaluationForm.questions[index];
      const key = field.slug;
      const inputType = field.type || 'text';
      const labelMessage = field.title;
      const isOtherAllowed = field.isOtherAllowed;
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
          let choices = [];
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
              checkedValue={checkedValue}
            />
          );
        }
      }
    })}
  </div>
);

export class ProposalAdminNotationForm extends React.Component<Props> {
  render() {
    const { invalid, pristine, handleSubmit, submitting, proposal, initialValues } = this.props;
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
                initialValues={initialValues}
              />
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
            const response = props.proposal.evaluation
              ? props.proposal.evaluation.responses.filter(
                  res => res && res.question.id === field.id,
                )[0]
              : null;
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
