// @flow
import React, { useEffect, useState } from 'react';
import { Button, ButtonToolbar, Col, Row } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { type DroppableProvided } from 'react-beautiful-dnd';
import styled, { type StyledComponent } from 'styled-components';
import { change } from 'redux-form';
import { useDeletePopoverMessage } from './useDeletePopoverMessage';
import type { Dispatch } from '~/types';
import type { QuestionTypeValue } from '~relay/ProposalFormAdminConfigurationForm_proposalForm.graphql';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import { ICON_NAME as DS_ICON_NAME } from '~ds/Icon/Icon';
import Popover from '~ds/Popover';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import Text from '~ui/Primitives/Text';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import DsButton from '~ds/Button/Button';
import type { Question, Questions } from '~/components/Form/Form.type';

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
  const majorityType = ['majority'];

  if (numberTypes.includes(type)) {
    return 'admin.fields.validation_rule.number';
  }

  if (majorityType.includes(type)) {
    return 'majority-decision';
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
  +index: number,
  +provided: DroppableProvided,
  +handleClickEdit: (index: number, type: QuestionTypeValue, level: ?number) => void,
  +handleClickDelete: (index: number, type: QuestionTypeValue, level: ?number) => void,
  +handleDeleteQuestionRow: (index: number) => void,
  +questions: Questions,
  +dispatch: Dispatch,
  +formName: string,
|};

export const handleConfirmDelete = (
  question: Question,
  questions: Questions,
  dispatch: Dispatch,
  formName: string,
  handleDeleteQuestionRow: (index: number) => void,
  index: number,
) => {
  /* eslint-disable no-shadow */

  if (question.jumps.length > 0) {
    const jumpIds = question.jumps.map(jump => jump.id);

    questions.forEach(question => {
      const index = questions.findIndex(q => q.id === question.id);
      const { destinationJumps } = question;
      const updatedDestinationJumps = destinationJumps.filter(dj => !jumpIds.includes(dj.id));
      if (destinationJumps.length !== updatedDestinationJumps.length) {
        dispatch(change(formName, `questions.${index}.destinationJumps`, updatedDestinationJumps));
      }
    });
  }

  if (question.destinationJumps.length > 0) {
    question.destinationJumps.forEach(destinationJump => {
      const originIndex = questions.findIndex(q => q.id === destinationJump.origin.id);
      let jumpsCount = questions[originIndex].jumps.length;
      const remainingJumps = questions[originIndex].jumps.filter(
        j => j.destination.id !== question.id,
      );
      jumpsCount -= jumpsCount - remainingJumps.length;
      dispatch(change(formName, `questions.${originIndex}.jumps`, remainingJumps));
      if (jumpsCount === 0) {
        dispatch(change(formName, `questions.${originIndex}.alwaysJumpDestinationQuestion`, null));
      }
    });
  }
  handleDeleteQuestionRow(index);
};

export const QuestionAdmin = ({
  handleClickEdit,
  handleClickDelete,
  index,
  provided,
  dispatch,
  formName,
  questions,
  handleDeleteQuestionRow,
}: Props) => {
  const question = questions[index];
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

  const {
    jumpsText,
    jumpsTextParams,
    destinationJumpsText,
    destinationJumpsTextParams,
  } = useDeletePopoverMessage(question);
  const [popoverHeaderKey, setPopoverHeaderKey] = useState(
    'admin.question.delete.confirmation.jump.header',
  );

  useEffect(() => {
    const relatedToBoth = jumpsText.length > 0 && destinationJumpsText.length > 0;
    if (jumpsText.length > 1 || destinationJumpsText.length > 1 || relatedToBoth) {
      setPopoverHeaderKey('admin.question.delete.confirmation.jump.header.plural');
    }
  }, [jumpsText, destinationJumpsText]);

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
            {jumpsText.length > 0 || destinationJumpsText.length > 0 ? (
              <Popover placement="left" trigger={['click']} useArrow>
                <Popover.Trigger>
                  <ButtonQuickAction
                    id={`js-btn-trash-${index}`}
                    icon={DS_ICON_NAME.TRASH}
                    label={<FormattedMessage id="global.delete" />}
                    variantColor="danger"
                  />
                </Popover.Trigger>
                <Popover.Content>
                  {({ closePopover }) => (
                    <React.Fragment>
                      <Popover.Header>
                        <FormattedMessage id={popoverHeaderKey}>
                          {(text: string) => <p css={{ fontWeight: 600 }}>{text}</p>}
                        </FormattedMessage>
                      </Popover.Header>
                      <Popover.Body>
                        <Text>
                          {jumpsText.length > 0 &&
                            destinationJumpsText.length > 0 &&
                            jumpsTextParams &&
                            destinationJumpsTextParams && (
                              <>
                                <FormattedMessage id="admin.question.delete.confirmation.jump.body.subtitle" />
                                <br />
                                <FormattedMessage {...jumpsTextParams} />
                                <br />
                                <FormattedMessage {...destinationJumpsTextParams} />
                              </>
                            )}
                          {jumpsText.length > 0 &&
                            destinationJumpsText.length === 0 &&
                            jumpsTextParams && <FormattedMessage {...jumpsTextParams} />}
                          {destinationJumpsText.length > 0 &&
                            jumpsText.length === 0 &&
                            destinationJumpsTextParams && (
                              <FormattedMessage {...destinationJumpsTextParams} />
                            )}
                        </Text>
                      </Popover.Body>
                      <Popover.Footer>
                        <ButtonGroup>
                          <DsButton uppercase onClick={closePopover} color="gray.500" fontSize={1}>
                            <FormattedMessage id="cancel" />
                          </DsButton>
                          <DsButton
                            alternative
                            variant="tertiary"
                            variantColor="danger"
                            onClick={() =>
                              handleConfirmDelete(
                                question,
                                questions,
                                dispatch,
                                formName,
                                handleDeleteQuestionRow,
                                index,
                              )
                            }>
                            <FormattedMessage id="global.removeDefinitively" />
                          </DsButton>
                        </ButtonGroup>
                      </Popover.Footer>
                    </React.Fragment>
                  )}
                </Popover.Content>
              </Popover>
            ) : (
              <ButtonQuickAction
                id={`js-btn-trash-${index}`}
                icon={DS_ICON_NAME.TRASH}
                label={<FormattedMessage id="global.delete" />}
                variantColor="danger"
                onClick={handleClickDelete.bind(null, index, question.type, question.level)}
              />
            )}
          </ButtonToolbar>
        </ActionIconWrapper>
      </Col>
      {provided.placeholder}
    </Row>
  );
};
