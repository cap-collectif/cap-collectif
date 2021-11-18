// @flow
import React from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import moment from 'moment';
import { Link } from 'react-router-dom';
import type { ReplyLink_reply } from '~relay/ReplyLink_reply.graphql';
import ReplyDraftLabel from '../ReplyDraftLabel';
import UnpublishedLabel from '~/components/Publishable/UnpublishedLabel';
import DeleteReplyModal from '~/components/Reply/Delete/DeleteReplyModal';
import ReplyLinkContainer from './ReplyLink.style';
import { QuestionnaireStepPageContext } from '~/components/Page/QuestionnaireStepPage.context';
import type { ReplyLink_questionnaire } from '~relay/ReplyLink_questionnaire.graphql';

type Props = {|
  +reply: ReplyLink_reply,
  +questionnaire: ReplyLink_questionnaire,
|};

export const ReplyLink = ({ reply, questionnaire }: Props) => {
  const { preloadReply } = React.useContext(QuestionnaireStepPageContext);

  const isAnonymousReply = reply?.__typename === 'AnonymousReply';

  return (
    <ReplyLinkContainer
      onMouseEnter={() => {
        if (!isAnonymousReply) return preloadReply(reply.id);
      }}>
      <div>
        <Link to={`/replies/${reply.id}`}>
          <FormattedMessage
            id="reply.show.link"
            values={{
              date: (
                <FormattedDate
                  value={moment(reply.publishedAt || reply.createdAt)}
                  day="numeric"
                  month="long"
                  year="numeric"
                />
              ),
              time: (
                <FormattedDate
                  value={moment(reply.publishedAt || reply.createdAt)}
                  hour="numeric"
                  minute="numeric"
                />
              ),
            }}
          />
        </Link>
        {reply.private && <FormattedMessage id="reply.private" />}
        &nbsp;
        {reply.draft && <ReplyDraftLabel draft={reply.draft} />}
        &nbsp;
        {!reply.draft && !isAnonymousReply && <UnpublishedLabel publishable={reply} />}
      </div>

      {(reply.viewerCanDelete || isAnonymousReply) && (
        <DeleteReplyModal reply={reply} questionnaire={questionnaire} />
      )}
    </ReplyLinkContainer>
  );
};

export default createFragmentContainer(ReplyLink, {
  questionnaire: graphql`
    fragment ReplyLink_questionnaire on Questionnaire {
      ...DeleteReplyModal_questionnaire
    }
  `,
  reply: graphql`
    fragment ReplyLink_reply on Reply {
      __typename
      id
      createdAt
      publishedAt
      ... on UserReply {
        draft
        viewerCanDelete
        private
      }
      ...DeleteReplyModal_reply
      ...UnpublishedLabel_publishable
    }
  `,
});
