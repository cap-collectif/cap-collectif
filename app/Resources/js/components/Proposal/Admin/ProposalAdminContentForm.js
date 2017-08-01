// @flow
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import ChangeProposalContentMutation from '../../../mutations/ChangeProposalContentMutation';
// import Field from '../../Form/Field';
// import component from '../../Form/Input';
import type { ProposalAdminContentForm_proposal } from './__generated__/ProposalAdminContentForm_proposal.graphql';

type DefaultProps = void;
type Props = { proposal: ProposalAdminContentForm_proposal };
type State = void;

export class ProposalAdminContentForm extends Component<
  DefaultProps,
  Props,
  State,
> {
  _handleCompleteChange = () => {
    const variables = {
      input: { title: '', body: '', id: this.props.proposal.id },
    };
    ChangeProposalContentMutation.commit(variables);
  };

  render() {
    const { proposal /* , handleSubmit */ } = this.props;
    return (
      <div>
        <form>
          <h4 className="box-title">Aperçu</h4>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/115-section-avancement">
            <i className="fa fa-info-circle" /> Aide
          </a>
          <div>
            <label>First Name</label>
            <div>
              {proposal.title}
              {/* <Field
                    name="firstName"
                    component={component}
                    type="text"
                    placeholder="First Name"
                  /> */}
            </div>
          </div>
          <div>
            <label>Last Name</label>
            <div>
              {/* <Field
                    name="lastName"
                    component={component}
                    type="text"
                    placeholder="Last Name"
                  /> */}
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default createFragmentContainer(
  ProposalAdminContentForm,
  graphql`
    fragment ProposalAdminContentForm_proposal on Proposal {
      id
      title
      # author {
      #   id
      # }
      # theme {
      #   id
      # }
      # category {
      #   id
      # }
      # address
      # district {
      #   id
      # }
      # description
      # phone
    }
  `,
);
