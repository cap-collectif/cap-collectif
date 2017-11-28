// @flow
import * as React from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { type FormProps, reduxForm, formValueSelector, FieldArray } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import AlertAdminForm from '../../Alert/AlertAdminForm';
import ChangeProposalEvaluationMutation from '../../../mutations/ChangeProposalEvaluationMutation';
import {
  validate,
  renderResponses,
  formatInitialResponses,
  formatResponsesToSubmit,
} from '../Admin/ProposalAdminNotationForm';
import type { ProposalPageEvaluation_proposal } from './__generated__/ProposalPageEvaluation_proposal.graphql';
import type { Dispatch, State } from '../../../types';
import type { ResponsesValues } from '../Admin/ProposalAdminNotationForm';

type FormValues = { responses: ResponsesValues } & Object;
type RelayProps = {
  proposal: ProposalPageEvaluation_proposal,
};
type Props = FormProps & FormValues & RelayProps & { intl: intlShape };

const formName = 'proposal-evaluation';

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  return ChangeProposalEvaluationMutation.commit({
    input: {
      proposalId: props.proposal.id,
      responses: formatResponsesToSubmit(values, props),
    },
  });
};

export class ProposalPageEvaluation extends React.Component<Props> {
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
      responses,
      change,
      intl,
    } = this.props;
    const evaluationForm = proposal.form.evaluationForm;
    return (
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div>
            <FieldArray
              name="responses"
              component={renderResponses}
              evaluationForm={evaluationForm}
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
                </Button>
                <AlertAdminForm
                  valid={valid}
                  invalid={invalid}
                  submitSucceeded={submitSucceeded}
                  submitFailed={submitFailed}
                  submitting={submitting}
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
    responses: formatInitialResponses(props),
  },
});

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalPageEvaluation_proposal on Proposal {
      id
      viewerIsAnEvaluer
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
