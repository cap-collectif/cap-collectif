// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import ReplyModalLink from './Edit/ReplyModalLink';
import { type UserReplies_questionnaire } from '~relay/UserReplies_questionnaire.graphql';
import ListGroup from '../Ui/List/ListGroup';

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
      <div id="user-replies" className="block hidden-print">
        <h3 className="h4">
          <FormattedMessage
            id="reply.show.title"
            values={{
              num: questionnaire.viewerReplies.length,
            }}
          />
        </h3>
        <ListGroup>
          {questionnaire.viewerReplies.map((reply, index) => (
            // $FlowFixMe $refType
            <ReplyModalLink key={index} reply={reply} />
          ))}
        </ListGroup>
        <hr />
      </div>
    );
  }
}

export default createFragmentContainer(UserReplies, {
  questionnaire: graphql`
    fragment UserReplies_questionnaire on Questionnaire
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      viewerReplies @include(if: $isAuthenticated) {
        id
        ...ReplyModalLink_reply
      }
    }
  `,
});
