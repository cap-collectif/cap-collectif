// @flow
import React, { useState } from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl';
import type { History } from 'react-router-dom';
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
import { type QuestionnaireReplyPage_reply } from '~relay/QuestionnaireReplyPage_reply.graphql';
import type { Dispatch } from '~/types';

type Props = {|
  questionnaire: ?QuestionnaireReplyPage_questionnaire,
  reply: QuestionnaireReplyPage_reply,
  history: History,
  submitReplyForm: (replyId: string) => void,
  resetReplyForm: (replyId: string) => void,
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
  reply,
  history,
  submitReplyForm,
  resetReplyForm,
}: Props) => {
  const [isModalShow, setIsModalShow] = useState<boolean>(false);
  const [isEditingReplyForm, setIsEditingReplyForm] = useState<boolean>(false);

  const leave = () => {
    resetReplyForm(reply.id);
    history.replace('/');
  };

  return questionnaire ? (
    <QuestionnaireReplyPageContainer>
      {questionnaire.step && <StepPageHeader step={questionnaire.step} />}

      <button
        type="button"
        onClick={() => (isEditingReplyForm ? setIsModalShow(true) : history.replace('/'))}
        className="btn-goBack">
        <Icon name={ICON_NAME.chevronLeft} size={10} />
        <FormattedMessage
          id="reply.show.title"
          values={{
            num: questionnaire.viewerReplies ? questionnaire.viewerReplies.length : 0,
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
        isShow={isModalShow}
        title="user-quit-page-message"
        content="informations-will-not-be-registered"
        btnConfirmMessage="global-exit"
        btnCloseAndConfirmlMessage="save-quit"
        onCloseAndConfirm={() => submitReplyForm(reply.id)}
        onConfirm={() => leave()}
        onClose={() => setIsModalShow(false)}
      />
    </QuestionnaireReplyPageContainer>
  ) : null;
};

const container = injectIntl(QuestionnaireReplyPage);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  submitReplyForm: (replyId: string) => dispatch(submit(getFormNameUpdate(replyId))),
  resetReplyForm: (replyId: string) => dispatch(reset(getFormNameUpdate(replyId))),
});

const containerConnect = connect(null, mapDispatchToProps)(container);

export default createFragmentContainer(containerConnect, {
  questionnaire: graphql`
    fragment QuestionnaireReplyPage_questionnaire on Questionnaire
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      step {
        ...StepPageFooter_step
        ...StepPageHeader_step
      }
      viewerReplies @include(if: $isAuthenticated) {
        id
      }
    }
  `,
  reply: graphql`
    fragment QuestionnaireReplyPage_reply on Reply
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      createdAt
      publishedAt
      questionnaire {
        ...ReplyForm_questionnaire
      }
      ...UnpublishedLabel_publishable
      ...ReplyForm_reply @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
