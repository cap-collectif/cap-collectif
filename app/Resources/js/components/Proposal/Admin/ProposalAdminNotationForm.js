// @flow
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { Glyphicon, ButtonToolbar, Button } from 'react-bootstrap';
import ChangeProposalNotationMutation from '../../../mutations/ChangeProposalNotationMutation';
import component from '../../Form/Field';
import select from '../../Form/Select';
import Fetcher from '../../../services/Fetcher';
import type { ProposalAdminNotationForm_proposal } from './__generated__/ProposalAdminNotationForm_proposal.graphql';
import type { State, Dispatch } from '../../../types';

type FormValues = Object;
type RelayProps = { proposal: ProposalAdminNotationForm_proposal };
type Props = RelayProps & {
  handleSubmit: () => void,
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
};

const formName = 'proposal-admin-notation';
const validate = () => {
  const errors = {};
  return errors;
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

export class ProposalAdminNotationForm extends Component<Props> {
  render() {
    const { invalid, pristine, handleSubmit, submitting, proposal } = this.props;
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
    }
  `,
);
