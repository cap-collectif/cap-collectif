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
import type { ProposalAdminNotationForm_proposal } from './__generated__/ProposalAdminNotationForm_proposal.graphql';
import type { State, Dispatch } from '../../../types';

type DefaultProps = void;
type FormValues = Object;
type RelayProps = { proposal: ProposalAdminNotationForm_proposal };
type Props = RelayProps & {
  handleSubmit: () => void,
  invalid: boolean,
  pristine: boolean,
};

const formName = 'proposal-admin-notation';
const validate = () => {
  const errors = {};
  return errors;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const variables = {
    input: { ...values, id: props.proposal.id },
  };
  ChangeProposalNotationMutation.commit(variables).then(location.reload());
};

export class ProposalAdminNotationForm extends Component<
  DefaultProps,
  Props,
  void,
> {
  render() {
    const { invalid, pristine, handleSubmit, proposal } = this.props;
    return (
      <div className="box box-primary container">
        <div className="box-header">
          <h4 className="box-title">Général</h4>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/86-editer-une-proposition-dune-etape-de-depot#contenu">
            <i className="fa fa-info-circle" /> Aide
          </a>
        </div>
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
              label="likers"
              labelClassName="control-label"
              inputClassName="qdnsqdnqsldnqsldn"
              multi
              placeholder="Sélectionnez un coup de coeur"
              component={select}
              clearable={false}
              options={proposal.likers.map(u => ({
                value: u.id,
                label: u.displayName,
              }))}
            />
            <ButtonToolbar style={{ marginBottom: 10 }}>
              <Button
                disabled={invalid || pristine}
                type="submit"
                bsStyle="primary">
                <FormattedMessage id="global.save" />
              </Button>
            </ButtonToolbar>
          </div>
        </form>
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
    likers: props.proposal.likers.map(u => u.id),
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
