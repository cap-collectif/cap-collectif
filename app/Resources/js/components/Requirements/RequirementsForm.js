// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { reduxForm, Field, type FormProps } from 'redux-form';
import component from '../Form/Field';
import type { RequirementsForm_step } from './__generated__/RequirementsForm_step.graphql';
// import CreateProposalFormMutation from '../../mutations/CreateProposalFormMutation';

const validate = () => {
  return {};
};

const onSubmit = () => {
  // return CreateProposalFormMutation.commit({ input: values }).then(() => {
  //   window.location.reload();
  // });
};

type Props = FormProps & {
  step: RequirementsForm_step,
};

export class RequirementsForm extends React.Component<Props> {
  render() {
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Field
          name="title"
          label={<FormattedMessage id="proposal_form.title" />}
          component={component}
          type="text"
          id="proposal_form_title"
        />
      </form>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  form: 'requirements-form',
})(RequirementsForm);

export default createFragmentContainer(form, {
  step: graphql`
    fragment RequirementsForm_step on ProposalStep {
      requirements {
        edges {
          node {
            viewerMeetsTheRequirement
          }
        }
      }
    }
  `,
});
