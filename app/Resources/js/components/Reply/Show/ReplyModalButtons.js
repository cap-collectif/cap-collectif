// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button } from 'react-bootstrap';
import { type ReplyModalButtons_reply } from './__generated__/ReplyModalButtons_reply.graphql';
import ReplyDeleteModal from '../Delete/ReplyDeleteModal';

type Props = {
  reply: ReplyModalButtons_reply,
  onChange: () => void,
};

type State = {
  showEditModal: boolean,
  showDeleteModal: boolean,
};

export class ReplyModalButtons extends React.Component<Props, State> {
  state = {
    showEditModal: false,
    showDeleteModal: false,
  };

  toggleDeleteModal(value: boolean) {
    this.setState({ showDeleteModal: value });
  }

  render() {
    const { reply, onChange } = this.props;
    return (
      <span className="pull-left reply__buttons">
        {reply.viewerCanDelete && (
          <div>
            <Button
              id={`reply-delete-button${reply.id}`}
              className="reply__delete-btn"
              onClick={() => {
                this.toggleDeleteModal(true);
              }}
              style={{ marginLeft: '15px' }}
            />
            {/* $FlowFixMe $refType */}
            <ReplyDeleteModal
              reply={reply}
              show={this.state.showDeleteModal}
              onToggleModal={this.toggleDeleteModal}
              onDelete={onChange}
            />
          </div>
        )}
      </span>
    );
  }
}

export default createFragmentContainer(ReplyModalButtons, {
  reply: graphql`
    fragment ReplyModalButtons_reply on Reply {
      id
      viewerCanDelete
      ...ReplyDeleteModal_reply
    }
  `,
});
