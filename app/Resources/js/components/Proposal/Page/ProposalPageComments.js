// @flow
import * as React from 'react';
import classNames from 'classnames';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '../../../createRelayEnvironment';
import CommentSection from '../../Comment/CommentSection';

type Props = {
  id: string,
  form: Object,
  className: string,
};

class ProposalPageComments extends React.Component<Props> {
  static defaultProps = {
    className: '',
  };

  render() {
    const { className, form, id } = this.props;
    const classes = {
      proposal__comments: true,
      [className]: true,
    };

    const component = ({ props }: { props: ?{ proposalForm: { commentable: boolean } } }) => {
      if (props && props.proposalForm.commentable) {
        return <CommentSection uri={`proposal_forms/${form.id}/proposals`} object={id} />;
      }
      return null;
    };
    return (
      <div className={classNames(classes)}>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProposalPageCommentsQuery($id: ID!) {
              proposalForm: node(id: $id) {
                ... on ProposalForm {
                  commentable
                }
              }
            }
          `}
          variables={{
            id: form.id,
          }}
          render={component}
        />
      </div>
    );
  }
}

export default ProposalPageComments;
