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
import type { FeatureToggles } from '../../../types';

type DefaultProps = void;
type Props = {
  proposal: ProposalAdminNotationForm_proposal,
  themes: Array<Object>,
  districts: Array<Object>,
  features: FeatureToggles,
  handleSubmit: () => void,
  intl: Object,
};
type State = void;

const formName = 'proposal-admin-edit';

const onSubmit = (values, dispatch, props) => {
  console.log('onSubmit', values);
  const variables = {
    input: { ...values, id: props.proposal.id },
  };
  ChangeProposalNotationMutation.commit(variables);
};

export class ProposalAdminNotationForm extends Component<
  DefaultProps,
  Props,
  State,
> {
  render() {
    const { handleSubmit, proposal } = this.props;
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
              // isLoading={users.length === 0}
              component={select}
              clearable={false}
              // onChange={() => onProjectChange(formName, 'childConnections', [])}
              options={proposal.likers.map(u => ({
                value: u.id,
                label: u.displayName,
              }))}
            />
            <ButtonToolbar style={{ marginBottom: 10 }}>
              <Button type="submit" bsStyle="primary">
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
  // validate,
  form: formName,
})(ProposalAdminNotationForm);

const mapStateToProps = (state, props) => ({
  initialValues: {
    estimation: props.proposal.estimation,
    likers: props.proposal.likers.map(u => u.id),
    // title: props.proposal.title,
    // body: props.proposal.body,
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
