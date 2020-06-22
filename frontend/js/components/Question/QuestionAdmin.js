// @flow
import * as React from 'react';
import { ButtonToolbar, Button, Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { type DroppableProvided } from 'react-beautiful-dnd';
import styled, { type StyledComponent } from 'styled-components';
import type { QuestionTypeValue } from '~relay/ProposalFormAdminConfigurationForm_proposalForm.graphql';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

const ItemQuestionWrapper: StyledComponent<{ ellipsis?: boolean }, {}, HTMLDivElement> = styled.div`
  padding-right: 8px;
  white-space: ${props => props.ellipsis && 'nowrap'};
  overflow: ${props => props.ellipsis && 'hidden'};
  text-overflow: ${props => props.ellipsis && 'ellipsis'};
  svg {
    fill: #999;
  }
`;

const ActionIconWrapper: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  .action-icons {
    display: flex;
  }
  .btn-edit-item,
  .btn-del-item {
    display: flex;
    justify-content: center;
    border-radius: 50%;
    width: 30px;
    height: 30px;
  }

  .btn-edit-item {
    background: rgba(3, 136, 204, 0.15);
  }

  .btn-del-item {
    background: rgba(220, 53, 69, 0.2);
  }
`;

const getIdFromQuestionType = (type: QuestionTypeValue, level: ?number): string => {
  const freeTypes = ['text', 'textarea', 'editor'];
  const mutipleUniqueTypes = ['button', 'radio', 'select'];
  const mutipleTypes = ['checkbox', 'ranking'];
  const mediaTypes = ['medias'];
  const sectionTypes = ['section', 'sub-section'];
  const numberTypes = ['number'];

  if (numberTypes.includes(type)) {
    return 'admin.fields.validation_rule.number';
  }

  if (freeTypes.includes(type)) {
    return 'global.question.types.free';
  }

  if (mutipleUniqueTypes.includes(type)) {
    return 'global.question.types.multiple_unique';
  }

  if (mutipleTypes.includes(type)) {
    return 'global.question.types.multiple_multiple';
  }

  if (mediaTypes.includes(type)) {
    return 'gender.other';
  }

  if (sectionTypes.includes(type)) {
    if (level && level === 1) {
      return 'global.question.types.sub-section';
    }
    return 'global.question.types.section';
  }

  return '';
};

type Props = {|
  +question: {
    +type: QuestionTypeValue,
    +title: string,
    +level?: number,
  },
  +index: number,
  +provided: DroppableProvided,
  +handleClickEdit: (index: number, type: QuestionTypeValue, level: ?number) => void,
  +handleClickDelete: (index: number, type: QuestionTypeValue, level: ?number) => void,
|};

export const QuestionAdmin = ({
  question,
  handleClickEdit,
  handleClickDelete,
  index,
  provided,
}: Props) => {
  const questionTypeId = getIdFromQuestionType(question.type, question.level);

  const iconName = (() => {
    if (question.type === 'section') {
      if (question.level === 1) {
        return ICON_NAME.smallCaps;
      }
      return ICON_NAME.textStyle;
    }
    return ICON_NAME.askBubble;
  })();

  return (
    <Row>
      <Col xs={8} className="d-flex align-items-center">
        <ItemQuestionWrapper>
          <i className="cap cap-android-menu" style={{ color: '#aaaaaa', fontSize: '20px' }} />
        </ItemQuestionWrapper>
        <ItemQuestionWrapper>
          <Icon name={iconName} size={20} />
        </ItemQuestionWrapper>
        <ItemQuestionWrapper ellipsis>
          <strong>{question.title}</strong>
          <br />
          <span className="excerpt">
            {questionTypeId !== '' && <FormattedMessage id={questionTypeId} />}
          </span>
        </ItemQuestionWrapper>
      </Col>
      <Col xs={4}>
        <ActionIconWrapper>
          <ButtonToolbar className="action-icons pull-right">
            <Button
              id={`js-btn-edit-${index}`}
              className="btn-edit-item"
              onClick={handleClickEdit.bind(null, index, question.type, question.level)}>
              <Icon name={ICON_NAME.pen} size={16} color="rgb(3, 136, 204)" />
            </Button>
            <Button
              id={`js-btn-delete-${index}`}
              className="btn-del-item"
              onClick={handleClickDelete.bind(null, index, question.type, question.level)}>
              <Icon name={ICON_NAME.trash} size={16} color="rgb(220, 53, 69)" />
            </Button>
          </ButtonToolbar>
        </ActionIconWrapper>
      </Col>
      {provided.placeholder}
    </Row>
  );
};
