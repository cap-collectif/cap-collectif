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

    const render = ({ props }: { props: ?{ proposalForm: { commentable: boolean } } }) => {
      if (props && props.proposalForm.commentable) {
        return (
          <div className={classNames(classes)}>
            <CommentSection uri={`proposal_forms/${form.id}/proposals`} object={id} />
          </div>
        );
      }
    };
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProposalPageCommentsQuery($id: ID!) {
            proposalForm(id: $id) {
              commentable
            }
          }
        `}
        variables={{
          id: form.id,
        }}
        render={render}
      />
    );
  }
}

export default ProposalPageComments;
