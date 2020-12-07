// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import ReplyLink from '../Edit/ReplyLink/ReplyLink';
import { type UserReplies_questionnaire } from '~relay/UserReplies_questionnaire.graphql';
import ListGroup from '~/components/Ui/List/ListGroup';
import UserRepliesContainer from './UserReplies.style';

type Props = {
  questionnaire: UserReplies_questionnaire,
};

const UserReplies = ({ questionnaire }: Props) =>
  !questionnaire.viewerReplies || questionnaire.viewerReplies.totalCount === 0 ? null : (
    <UserRepliesContainer>
      <h3 className="h4">
        <FormattedMessage
          id="reply.show.title"
          values={{
            num: questionnaire.viewerReplies.totalCount,
          }}
        />
      </h3>
      <ListGroup>
        {questionnaire.viewerReplies.edges?.map((edge, i) => {
          return edge?.node ? <ReplyLink reply={edge.node} key={i} /> : null;
        })}
      </ListGroup>
    </UserRepliesContainer>
  );

export default createFragmentContainer(UserReplies, {
  questionnaire: graphql`
    fragment UserReplies_questionnaire on Questionnaire
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      viewerReplies @include(if: $isAuthenticated) {
        totalCount
        edges {
          node {
            ...ReplyLink_reply
          }
        }
      }
    }
  `,
});
