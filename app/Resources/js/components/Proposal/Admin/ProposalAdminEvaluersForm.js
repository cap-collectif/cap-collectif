// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { type FormProps, reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { fetchQuery } from 'relay-runtime';
import { ButtonToolbar, Button } from 'react-bootstrap';
import AlertForm from '../../Alert/AlertForm';
import ChangeProposalEvaluersMutation from '../../../mutations/ChangeProposalEvaluersMutation';
import select from '../../Form/Select';
import environment from '../../../createRelayEnvironment';
import type { ProposalAdminEvaluersForm_proposal } from './__generated__/ProposalAdminEvaluersForm_proposal.graphql';
import type { Dispatch, GlobalState } from '../../../types';

type FormValues = {| evaluers: Array<{ value: string }> |};

type State = { evaluersOptions: Array<Object> };

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

const evaluersQuery = graphql`
  query ProposalAdminEvaluersFormQuery {
    groups {
      id
      title
    }
  }
`;

export class ProposalAdminEvaluersForm extends React.Component<Props, State> {
  state = {
    evaluersOptions: [],
  };

  componentDidMount() {
    fetchQuery(environment, evaluersQuery)
      .then(response =>
        response.groups.map(group => ({
          value: group.id,
          label: group.title,
        })),
      )
      .then(evaluersOptions => {
        this.setState({ evaluersOptions });
      });
  }

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
    const { evaluersOptions } = this.state;

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
              multi
              placeholder={intl.formatMessage({ id: 'proposal.analysts.form.placeholder' })}
              component={select}
              clearable={false}
              options={evaluersOptions}
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

const mapStateToProps = (state: GlobalState, props: RelayProps) => ({
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
