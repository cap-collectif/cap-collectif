// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { type FormProps, reduxForm, FieldArray, Field, SubmissionError, reset } from 'redux-form';
import { connect, type MapStateToProps } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button } from 'react-bootstrap';
import type { Dispatch, State } from '../../../types';
import type { ReplyForm_questionnaire } from './__generated__/ReplyForm_questionnaire.graphql';
import {
  formatInitialResponsesValues,
  renderResponses,
  formatSubmitResponses,
  type ResponsesInReduxForm,
} from '../../../utils/responsesHelper';
import renderComponent from '../../Form/Field';
import ReplyActions from '../../../actions/ReplyActions';
import AlertForm from '../../Alert/AlertForm';
import AddReplyMutation from '../../../mutations/AddReplyMutation';

type Props = FormProps & {
  +questionnaire: ReplyForm_questionnaire,
  +user: ?Object,
  +intl: IntlShape,
};

type FormValues = {|
  responses: ResponsesInReduxForm,
|};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { questionnaire, reset } = props;

  const data = {};

  data.questionnaireId = questionnaire.id;

  data.responses = formatSubmitResponses(values.responses, questionnaire.questions);

  if (questionnaire.anonymousAllowed) {
    data.private = values.private;
  }

  return AddReplyMutation.commit({ input: data })
    .then(() => {
      ReplyActions.loadUserReplies(questionnaire.id);
      if(questionnaire.multipleRepliesAllowed) {
        dispatch(reset('ReplyForm'));
        // reset();
      }
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

const validate = (values: FormValues, props: Props) => {
  const { questionnaire } = props;
  const { responses } = values;
  const errors = {};

  const responsesError = [];
  questionnaire.questions.map((question, index) => {
    responsesError[index] = {};
    const response = responses.filter(res => res && res.question === question.id)[0];

    if (question.required) {
      if (question.type === 'medias') {
        if (!response || (Array.isArray(response.value) && response.value.length === 0)) {
          responsesError[index] = { value: 'proposal.constraints.field_mandatory' };
        }
      } else if (!response || !response.value) {
        responsesError[index] = { value: 'proposal.constraints.field_mandatory' };
      }
    }

    if (
      question.validationRule &&
      question.type !== 'button' &&
      response.value &&
      typeof response.value === 'object' &&
      Array.isArray(response.value.labels)
    ) {
      const rule = question.validationRule;
      const labelsNumber = response.value.labels.length;
      const hasOtherValue = response.value.other ? 1 : 0;
      const responsesNumber = labelsNumber + hasOtherValue;

      if (rule.type === 'min' && (rule.number && responsesNumber < rule.number)) {
        responsesError[index] = {
          value: props.intl.formatMessage(
            { id: 'reply.constraints.choices_min' },
            { nb: rule.number },
          ),
        };
      }

      if (rule.type === 'max' && (rule.number && responsesNumber > rule.number)) {
        responsesError[index] = {
          value: props.intl.formatMessage(
            { id: 'reply.constraints.choices_max' },
            { nb: rule.number },
          ),
        };
      }

      if (rule.type === 'equal' && responsesNumber !== rule.number) {
        responsesError[index] = {
          value: props.intl.formatMessage(
            { id: 'reply.constraints.choices_equal' },
            { nb: rule.number },
          ),
        };
      }
    }
  });

  if (responsesError.length) {
    errors.responses = responsesError;
  }

  return errors;
};

export const formName = 'ReplyForm';

export class ReplyForm extends React.Component<Props> {
  formIsDisabled() {
    const { questionnaire, user } = this.props;
    return (
      !questionnaire.open ||
      !user ||
      (questionnaire.phoneConfirmationRequired && !user.isPhoneConfirmed) ||
      (questionnaire.viewerReplies.length > 0 && !questionnaire.multipleRepliesAllowed)
    );
  }

  render() {
    const {
      intl,
      questionnaire,
      submitting,
      pristine,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      handleSubmit,
    } = this.props;

    const disabled = this.formIsDisabled();

    // console.warn(submitSucceeded, submitFailed, invalid);

    return (
      <form id="reply-form" ref="form" onSubmit={handleSubmit}>
        {questionnaire.description && (
          <p dangerouslySetInnerHTML={{ __html: questionnaire.description }} />
        )}
        <FieldArray
          name="responses"
          component={renderResponses}
          questions={questionnaire.questions}
          intl={intl}
          disabled={disabled}
        />
        {questionnaire.anonymousAllowed && (
          <div>
            <hr style={{ marginBottom: '30px' }} />
            <Field
              type="checkbox"
              name="private"
              component={renderComponent}
              children={<FormattedMessage id="reply.form.private" />}
              disabled={disabled}
            />
          </div>
        )}
        <Button
          type="submit"
          id="proposal_admin_content_save"
          bsStyle="primary"
          disabled={pristine || invalid || submitting || disabled }>
          <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
        </Button>
        {!disabled &&
          <AlertForm
            valid={valid}
            invalid={invalid}
            submitSucceeded={submitSucceeded}
            submitFailed={submitFailed}
            submitting={submitting}
          />
        }

      </form>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: Props) => ({
  initialValues: {
    responses: formatInitialResponsesValues(props.questionnaire.questions, []),
  },
  user: state.user.user,
});

const form = reduxForm({
  validate,
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(ReplyForm);

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  questionnaire: graphql`
    fragment ReplyForm_questionnaire on Questionnaire {
      anonymousAllowed
      description
      multipleRepliesAllowed
      phoneConfirmationRequired
      open
      viewerReplies {
        id
      }
      title
      id
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
          image {
            url
          }
        }
      }
    }
  `,
});
