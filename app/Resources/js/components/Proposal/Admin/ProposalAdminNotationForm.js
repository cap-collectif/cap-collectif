// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { Glyphicon, ButtonToolbar, Button } from 'react-bootstrap';
import { RadioGroup, RadioButton } from 'react-radio-buttons';
import ChangeProposalNotationMutation from '../../../mutations/ChangeProposalNotationMutation';
import component from '../../Form/Field';
import select from '../../Form/Select';
import Input from '../../Form/Input';
import Radio from '../../Form/Radio';
import Checkbox from '../../Form/Checkbox';
import Ranking from '../../Form/Ranking';
import Fetcher from '../../../services/Fetcher';
import ButtonBody from '../../Reply/Form/ButtonBody';
import type { ProposalAdminNotationForm_proposal } from './__generated__/ProposalAdminNotationForm_proposal.graphql';
import type { Dispatch } from '../../../types';

type FormValues = Object;
type RelayProps = { proposal: ProposalAdminNotationForm_proposal };
type Props = RelayProps & {
  handleSubmit: Object,
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
  disabled: boolean,
  formValidationRules: Object,
  proposal: ProposalAdminNotationForm_proposal,
};

type State = { form: Object };

const formName = 'proposal-admin-notation';
const validate = () => {
  const errors = {};
  return errors;
};

const getRequiredFieldIndicationStrategory = (fields: Array<{ required: boolean }>) => {
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
  const variables = {
    input: { ...values, proposalId: props.proposal.id },
  };
  return ChangeProposalNotationMutation.commit(variables).then(() => {
    location.reload();
  });
};

const formattedChoicesInField = field => {
  const choices = field.choices.map(choice => {
    return {
      id: choice.id,
      label: choice.title,
      description: choice.description,
      color: choice.color,
    };
  });

  return { ...field, choices };
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

  onChange(field: Object, value: string) {
    const form = this.state.form;
    if (field) {
      form[field.id] = value;
    }
    this.setState({
      form,
    });
  }

  render() {
    const { invalid, pristine, handleSubmit, submitting, proposal, disabled } = this.props;
    const evaluationForm = proposal.form.evaluationForm;

    let strategy = null;
    if (evaluationForm) {
      strategy = getRequiredFieldIndicationStrategory(proposal.form.evaluationForm.questions);
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
                evaluationForm.questions &&
                evaluationForm.questions.map(field => {
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
                    case 'checkbox': {
                      const formattedCBField = formattedChoicesInField(field);

                      return (
                        <Checkbox
                          key={key}
                          // ref={c => (this[`field-${formattedCBField.id}`] = c)}
                          id={`reply-${formattedCBField.id}`}
                          field={formattedCBField}
                          getGroupStyle={() => {}}
                          renderFormErrors={() => {}}
                          onChange={this.onChange}
                          values={this.state.form}
                          label={label}
                          labelClassName="h4"
                          disabled={disabled}
                        />
                      );
                    }
                    case 'radio': {
                      const formattedRadioField = formattedChoicesInField(field);

                      return (
                        <Radio
                          key={key}
                          // ref={c => (this[`field-${formattedRadioField.id}`] = c)}
                          id={`reply-${formattedRadioField.id}`}
                          field={formattedRadioField}
                          getGroupStyle={() => {}}
                          renderFormErrors={() => {}}
                          onChange={this.onChange}
                          label={label}
                          labelClassName="h4"
                          disabled={disabled}
                        />
                      );
                    }
                    case 'ranking': {
                      return (
                        <Ranking
                          key={key}
                          // ref={c => (this[`field-${field.id}`] = c)}
                          id={`reply-${field.id}`}
                          field={field}
                          getGroupStyle={() => {}}
                          renderFormErrors={() => {}}
                          onChange={this.onChange}
                          label={label}
                          labelClassName="h4"
                          disabled={disabled}
                        />
                      );
                    }
                    case 'select': {
                      return (
                        <Input
                          key={key}
                          // ref={c => (this[`field-${field.id}`] = c)}
                          id={`reply-${field.id}`}
                          type={inputType}
                          help={field.helpText}
                          groupClassName={() => {}}
                          // valueLink={this.linkState(`form.${field.id}`)}
                          errors={() => {}}
                          defaultValue=""
                          label={label}
                          labelClassName="h4"
                          disabled={disabled}>
                          <option value="" disabled>
                            {<FormattedMessage id="global.select" />}
                          </option>
                          {field.choices.map(choice => (
                            <option key={choice.id} value={choice.title}>
                              {choice.title}
                            </option>
                          ))}
                        </Input>
                      );
                    }
                    case 'button': {
                      return (
                        <div className="form-group" id={`reply-${field.id}`}>
                          <label htmlFor={`reply-${field.id}`} className="control-label h4">
                            {label}
                          </label>
                          {field.helpText && (
                            <span className="help-block" key="help">
                              {field.helpText}
                            </span>
                          )}
                          {field.description && (
                            <div style={{ paddingTop: 15, paddingBottom: 25 }}>
                              <ButtonBody body={field.description || ''} />
                            </div>
                          )}
                          <RadioGroup
                            key={key}
                            horizontal
                            // ref={c => (this[`field-${field.id}`] = c)}
                            id={`reply-${field.id}`}
                            onChange={value => {
                              this.onChange(field, value);
                            }}
                            value={field.choices[0].label}>
                            {field.choices.map(choice => (
                              <RadioButton
                                key={choice.id}
                                value={choice.title}
                                iconSize={20}
                                pointColor={choice.color}>
                                {choice.title}
                              </RadioButton>
                            ))}
                          </RadioGroup>
                        </div>
                      );
                    }
                    default: {
                      return (
                        <Input
                          // ref={c => (this[`field-${field.id}`] = c)}
                          key={key}
                          id={`reply-${field.id}`}
                          type={inputType}
                          help={field.helpText}
                          labelClassName="h4"
                          placeholder="reply.your_response"
                          label={label}
                        />
                      );
                    }
                  }
                })}

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
          id
          title
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
    }
  `,
);
