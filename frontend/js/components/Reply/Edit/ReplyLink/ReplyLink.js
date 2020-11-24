// @flow
import React, { useState } from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import moment from 'moment';
import { Link } from 'react-router-dom';
import type { ReplyLink_reply } from '~relay/ReplyLink_reply.graphql';
import ReplyDraftLabel from '../ReplyDraftLabel';
import UnpublishedLabel from '~/components/Publishable/UnpublishedLabel';
import Icon from '~/components/Ui/Icons/Icon';
import DeleteReplyModal from '~/components/Reply/Delete/DeleteReplyModal';
import ReplyLinkContainer from './ReplyLink.style';
import { QuestionnaireStepPageContext } from '~/components/Page/QuestionnaireStepPage.context';

type Props = {|
  reply: ReplyLink_reply,
|};

const TYPE_MODAL: {
  EDIT: 'EDIT',
  DELETE: 'DELETE',
} = {
  EDIT: 'EDIT',
  DELETE: 'DELETE',
};

export const ReplyLink = ({ reply }: Props) => {
  const [currentOpenModal, setCurrentOpenModal] = useState<$Values<typeof TYPE_MODAL> | null>(null);
  const { preloadReply } = React.useContext(QuestionnaireStepPageContext);

  return (
    <ReplyLinkContainer onMouseEnter={() => preloadReply(reply.id)}>
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
        {!reply.draft && <UnpublishedLabel publishable={reply} />}
      </div>

      {reply.viewerCanDelete && (
        <button
          type="button"
          className="btn-delete"
          onClick={() => setCurrentOpenModal(TYPE_MODAL.DELETE)}>
          <Icon name="trash" size={16} viewBox="0 0 16 16" />
        </button>
      )}

      {reply.viewerCanDelete && (
        <DeleteReplyModal
          reply={reply}
          show={currentOpenModal === TYPE_MODAL.DELETE}
          onClose={() => setCurrentOpenModal(null)}
        />
      )}
    </ReplyLinkContainer>
  );
};

export default createFragmentContainer(ReplyLink, {
  reply: graphql`
    fragment ReplyLink_reply on Reply {
      id
      createdAt
      publishedAt
      private
      draft
      viewerCanDelete
      ...DeleteReplyModal_reply
      ...UnpublishedLabel_publishable
    }
  `,
});
