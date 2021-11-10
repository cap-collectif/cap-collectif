// @flow
import React, { useState } from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl';
import { useDisclosure } from '@liinkiing/react-hooks';
import { usePreloadedQuery, useQuery } from 'relay-hooks';
import { useHistory, type Match } from 'react-router-dom';
import moment from 'moment';
import { connect } from 'react-redux';
import { submit, reset } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import StepPageHeader from '~/components/Steps/Page/StepPageHeader/StepPageHeader';
import StepPageFooter from '~/components/Steps/Page/StepPageFooter';
import ReplyForm, { getFormNameUpdate } from '~/components/Reply/Form/ReplyForm';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import LeavePageModal from '~/components/Modal/LeavePageModal/LeavePageModal';
import colors from '~/utils/colors';
import { type QuestionnaireReplyPage_questionnaire } from '~relay/QuestionnaireReplyPage_questionnaire.graphql';
import type { Dispatch, GlobalState, ResultPreloadQuery } from '~/types';
import Loader from '~ui/FeedbacksIndicators/Loader';
import { QuestionnaireStepPageContext } from '~/components/Page/QuestionnaireStepPage.context';

export const queryReply = graphql`
  query QuestionnaireReplyPageQuery($isAuthenticated: Boolean!, $replyId: ID!) {
    reply: node(id: $replyId) {
      id
      ... on Reply {
        createdAt
        ...on UserReply {
            publishedAt
        }
        questionnaire {
          ...ReplyForm_questionnaire
        }
        ...ReplyForm_reply @arguments(isAuthenticated: $isAuthenticated)
      }
    }
  }
`;

type Props = {|
  questionnaire: ?QuestionnaireReplyPage_questionnaire,
  dataPrefetch: ?ResultPreloadQuery,
  submitReplyForm: (replyId: string) => void,
  resetReplyForm: (replyId: string) => void,
  match: Match,
  isAuthenticated: boolean,
|};

const QuestionnaireReplyPageContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  .btn-goBack {
    padding: 0;
    background: none;
    border: none;
    color: ${colors.primaryColor};

    span {
      vertical-align: middle;
    }

    svg,
    path {
      margin-right: 10px;
      fill: ${colors.primaryColor};
    }
  }

  .date-reply {
    font-size: 18px;
    color: ${colors.darkText};
    margin: 15px 0;
  }
`;

export const QuestionnaireReplyPage = ({
  questionnaire,
  dataPrefetch,
  submitReplyForm,
  resetReplyForm,
  match,
  isAuthenticated,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const [isEditingReplyForm, setIsEditingReplyForm] = useState<boolean>(false);
  const { preloadReply } = React.useContext(QuestionnaireStepPageContext);
  const history = useHistory();

  // Skip query when data preloaded is used
  // (data is preloaded when hovering a reply)
  const { props: propsQuery } = useQuery(
    queryReply,
    { isAuthenticated, replyId: match.params.id },
    {
      skip: !!dataPrefetch,
    },
  );

  // usePreloadedQuery must wait a queryPreload,
  // then we give him one which is skipped
  const queryPreload = preloadReply(match.params.id || '', true);
  const { props: propsPrefetch } = usePreloadedQuery(dataPrefetch || queryPreload);
  const reply = propsPrefetch ? propsPrefetch?.reply : propsQuery?.reply;

  if (!reply || !questionnaire) return <Loader />;

  return (
    <QuestionnaireReplyPageContainer>
      {questionnaire.step && <StepPageHeader step={questionnaire.step} />}

      <button
        type="button"
        onClick={() => (isEditingReplyForm ? onOpen : history.replace('/'))}
        className="btn-goBack">
        <Icon name={ICON_NAME.chevronLeft} size={10} />
        <FormattedMessage
          id="reply.show.title"
          values={{
            num: questionnaire.viewerReplies ? questionnaire.viewerReplies.totalCount : 0,
          }}
        />
      </button>

      <p className="date-reply">
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
      </p>

      <ReplyForm
        questionnaire={reply.questionnaire}
        reply={reply}
        setIsEditingReplyForm={setIsEditingReplyForm}
      />
      {questionnaire.step && <StepPageFooter step={questionnaire.step} />}
      <LeavePageModal
        isShow={isOpen}
        title="user-quit-page-message"
        content="informations-will-not-be-registered"
        btnConfirmMessage="global-exit"
        btnCloseAndConfirmlMessage="save-quit"
        onCloseAndConfirm={() => submitReplyForm(reply.id)}
        onConfirm={() => {
          resetReplyForm(reply.id);
          history.replace('/');
        }}
        onClose={onClose}
      />
    </QuestionnaireReplyPageContainer>
  );
};

const container = injectIntl(QuestionnaireReplyPage);

const mapStateToProps = (state: GlobalState) => ({
  isAuthenticated: state.user.user !== null,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  submitReplyForm: (replyId: string) => dispatch(submit(getFormNameUpdate(replyId))),
  resetReplyForm: (replyId: string) => dispatch(reset(getFormNameUpdate(replyId))),
});

const containerConnect = connect<any, any, _, _, _, _>(
  mapStateToProps,
  mapDispatchToProps,
)(container);

export default createFragmentContainer(containerConnect, {
  questionnaire: graphql`
    fragment QuestionnaireReplyPage_questionnaire on Questionnaire
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      step {
        ...StepPageFooter_step
        ...StepPageHeader_step
      }
      viewerReplies @include(if: $isAuthenticated) {
        totalCount
        edges {
          node {
            id
          }
        }
      }
    }
  `,
});
