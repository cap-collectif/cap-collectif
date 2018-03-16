// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { ListGroup } from 'react-bootstrap';
import ReplyModalLink from './Show/ReplyModalLink';
import { type UserReplies_questionnaire } from './__generated__/UserReplies_questionnaire.graphql';

type Props = {
  questionnaire: UserReplies_questionnaire,
};

export class UserReplies extends React.Component<Props> {
  render() {
    const { questionnaire } = this.props;

    if (!questionnaire.viewerReplies || questionnaire.viewerReplies.length === 0) {
      return null;
    }

    return (
      <div id="user-replies" className="block">
        <h3 className="h4">
          <FormattedMessage
            id="reply.show.title"
            values={{
              num: questionnaire.viewerReplies.length,
            }}
          />
        </h3>
        <ListGroup>
          {questionnaire.viewerReplies.map((reply, index) => {
            // $FlowFixMe $refType
            return <ReplyModalLink key={index} reply={reply} questionnaire={questionnaire} />;
          })}
        </ListGroup>
        <hr />
      </div>
    );
  }
}

export default createFragmentContainer(UserReplies, {
  questionnaire: graphql`
    fragment UserReplies_questionnaire on Questionnaire {
      viewerReplies @include(if: $isAuthenticated) {
        id
        ...ReplyModalLink_reply
      }
    }
  `,
});
