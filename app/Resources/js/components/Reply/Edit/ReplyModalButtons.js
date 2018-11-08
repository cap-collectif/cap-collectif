// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { type ReplyModalButtons_reply } from './__generated__/ReplyModalButtons_reply.graphql';

type Props = {
  reply: ReplyModalButtons_reply,
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

  toggleDeleteModal = (value: boolean) => {
    this.setState({ showDeleteModal: value });
  };

  render() {
    const { reply } = this.props;
    console.log('********* REPLY');
    console.log(reply);
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
              style={{ marginLeft: '15px' }}>
              <i className="cap cap-bin-2" />
              <FormattedMessage id="global.remove" />
            </Button>
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
      ...DeleteReplyModal_reply
    }
  `,
});
