// @flow
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import ChangeProposalNotationMutation from '../../../mutations/ChangeProposalNotationMutation';
import component from '../../Form/Field';
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
    const { handleSubmit } = this.props;
    return (
      <div className="box box-primary container">
        <form onSubmit={handleSubmit}>
          <h4 className="h4">Général</h4>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/86-editer-une-proposition-dune-etape-de-depot#contenu">
            <i className="fa fa-info-circle" /> Aide
          </a>
          <div>
            <Field
              name="title"
              component={component}
              type="text"
              id="proposal_title"
              label={<FormattedMessage id="proposal.title" />}
            />
            <ButtonToolbar>
              <Button type="submit">
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

const mapStateToProps = () => ({
  initialValues: {
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
    }
  `,
);
