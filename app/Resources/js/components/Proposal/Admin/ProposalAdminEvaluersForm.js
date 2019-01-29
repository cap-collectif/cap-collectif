// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { type FormProps, reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import AlertForm from '../../Alert/AlertForm';
import ChangeProposalEvaluersMutation from '../../../mutations/ChangeProposalEvaluersMutation';
import select from '../../Form/Select';
import Fetcher from '../../../services/Fetcher';
import type { ProposalAdminEvaluersForm_proposal } from './__generated__/ProposalAdminEvaluersForm_proposal.graphql';
import type { Dispatch, State } from '../../../types';

type FormValues = {| evaluers: Array<{ value: string }> |};
type RelayProps = {| proposal: ProposalAdminEvaluersForm_proposal |};
type Props = {|
  ...RelayProps,
  ...FormProps,
  ...FormValues,
  intl: IntlShape,
|};

const formName = 'proposal-admin-evaluers';

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) =>
  ChangeProposalEvaluersMutation.commit({
    input: {
      proposalId: props.proposal.id,
      evaluers: values.evaluers.map(u => u.value),
    },
  });

export class ProposalAdminEvaluersForm extends React.Component<Props> {
  render() {
    const {
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      pristine,
      handleSubmit,
      submitting,
      intl,
    } = this.props;
    return (
      <div>
        <div>
          <div className="box-header">
            <h3 className="box-title">
              <FormattedMessage id="Analystes" />
            </h3>
            <a
              className="pull-right link"
              target="_blank"
              rel="noopener noreferrer"
              href="https://aide.cap-collectif.com/article/86-editer-une-proposition-dune-etape-de-depot#contenu">
              <i className="fa fa-info-circle" /> Aide
            </a>
          </div>
          <form onSubmit={handleSubmit}>
            <Field
              name="evaluers"
              id="evaluers"
              label="Groupes"
              labelClassName="control-label"
              inputClassName="fake-inputClassName"
              multi
              placeholder={intl.formatMessage({ id: 'proposal.analysts.form.placeholder' })}
              component={select}
              clearable={false}
              loadOptions={() =>
                Fetcher.graphql({
                  query: `
                        query {
                          groups {
                            id
                            title
                          }
                        }
                      `,
                }).then(response =>
                  response.data.groups.map(group => ({
                    value: group.id,
                    label: group.title,
                  })),
                )
              }
            />
            <ButtonToolbar className="box-content__toolbar">
              <Button
                disabled={invalid || pristine || submitting}
                id="proposal-evaluation-analysts-groupes-save"
                type="submit"
                bsStyle="primary">
                <i className="cap cap-download-1" />{' '}
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
  enableReinitialize: true,
  form: formName,
})(ProposalAdminEvaluersForm);

const mapStateToProps = (state: State, props: RelayProps) => ({
  initialValues: {
    evaluers: props.proposal.evaluers.map(u => ({
      value: u.id,
      label: u.title,
    })),
  },
});

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalAdminEvaluersForm_proposal on Proposal {
      id
      evaluers {
        id
        title
      }
    }
  `,
);
