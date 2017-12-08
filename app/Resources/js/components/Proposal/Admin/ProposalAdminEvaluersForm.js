// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { type FormProps, reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import AlertAdminForm from '../../Alert/AlertAdminForm';
import ChangeProposalNotationMutation from '../../../mutations/ChangeProposalNotationMutation';
import select from '../../Form/Select';
import Fetcher from '../../../services/Fetcher';
import type { ProposalAdminEvaluersForm_proposal } from './__generated__/ProposalAdminEvaluersForm_proposal.graphql';
import type { Dispatch, State } from '../../../types';

type FormValues = { evaluers: Array<{ value: string }> };
type RelayProps = { proposal: ProposalAdminEvaluersForm_proposal };
type Props = RelayProps & FormProps & FormValues;

const formName = 'proposal-admin-evaluers';

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  return ChangeProposalNotationMutation.commit({
    input: {
      proposalId: props.proposal.id,
      evaluers: values.evaluers.map(u => u.value),
    },
  });
};

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
              placeholder="Aucun analyste"
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
                }).then(response => ({
                  options: response.data.groups.map(group => ({
                    value: group.id,
                    label: group.title,
                  })),
                }))}
            />
            <ButtonToolbar style={{ marginBottom: 10 }} className="box-content__toolbar">
              <Button disabled={invalid || pristine || submitting} type="submit" bsStyle="primary">
                <i className="cap cap-download-1"> </i>{' '}
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

const container = connect(mapStateToProps)(form);

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
