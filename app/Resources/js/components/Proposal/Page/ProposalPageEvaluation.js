// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { type FormProps, reduxForm, formValueSelector, FieldArray } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import AlertForm from '../../Alert/AlertForm';
import ChangeProposalEvaluationMutation from '../../../mutations/ChangeProposalEvaluationMutation';
import {
  validate,
  formatInitialResponses,
  type ResponsesValues,
} from '../Admin/ProposalAdminNotationForm';
import { renderResponses, formatSubmitResponses } from '../../../utils/responsesHelper';
import type { ProposalPageEvaluation_proposal } from '~relay/ProposalPageEvaluation_proposal.graphql';
import type { Dispatch, State } from '../../../types';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

type FormValues = {| responses: ResponsesValues |};
type RelayProps = {|
  proposal: ProposalPageEvaluation_proposal,
|};
type Props = {|
  ...FormProps,
  ...FormValues,
  ...RelayProps,
  intl: IntlShape,
|};

const formName = 'proposal-evaluation';

const onUnload = e => {
  // $FlowFixMe voir https://github.com/facebook/flow/issues/3690
  e.returnValue = true;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  if (props.proposal.form.evaluationForm) {
    return ChangeProposalEvaluationMutation.commit({
      input: {
        proposalId: props.proposal.id,
        version: props.proposal.evaluation ? props.proposal.evaluation.version : 1,
        responses: formatSubmitResponses(
          values.responses,
          props.proposal.form.evaluationForm.questions,
        ),
      },
    });
  }
};

export class ProposalPageEvaluation extends React.Component<Props> {
  componentDidUpdate(prevProps: Props) {
    if (prevProps.dirty === false && this.props.dirty === true) {
      window.addEventListener('beforeunload', onUnload);
    }

    if (this.props.dirty === false) {
      window.removeEventListener('beforeunload', onUnload);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', onUnload);
  }

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
      responses,
      change,
      intl,
    } = this.props;
    const { evaluationForm } = proposal.form;
    if (!evaluationForm) {
      return null;
    }
    return (
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div>
            {evaluationForm.description && (
              <WYSIWYGRender className="mb-30" value={evaluationForm.description} />
            )}
            <FieldArray
              name="responses"
              component={renderResponses}
              questions={evaluationForm.questions}
              responses={responses}
              change={change}
              intl={intl}
              disabled={!proposal.viewerIsAnEvaluer}
            />
            {proposal.viewerIsAnEvaluer && (
              <ButtonToolbar style={{ marginBottom: 10 }} className="box-content__toolbar">
                <Button
                  disabled={invalid || pristine || submitting}
                  type="submit"
                  bsStyle="primary">
                  <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
                </Button>{' '}
                <AlertForm
                  valid={valid}
                  invalid={invalid}
                  submitSucceeded={submitSucceeded}
                  submitFailed={submitFailed}
                  submitting={submitting}
                  errorMessage={error}
                />
              </ButtonToolbar>
            )}
          </div>
        </form>
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
  })(ProposalPageEvaluation),
);

const mapStateToProps = (state: State, props: RelayProps) => ({
  responses: formValueSelector(formName)(state, 'responses'),
  initialValues: {
    version: props.proposal.evaluation ? props.proposal.evaluation.version : 1,
    responses: formatInitialResponses(props),
  },
});

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalPageEvaluation_proposal on Proposal {
      id
      viewerIsAnEvaluer
      form {
        evaluationForm {
          description
          questions {
            ...responsesHelper_question @relay(mask: false)
          }
        }
      }
      evaluation {
        version
        responses {
          ...responsesHelper_response @relay(mask: false)
        }
      }
    }
  `,
});
