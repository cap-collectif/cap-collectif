// @flow
import * as React from 'react';
import { ButtonToolbar, Button, Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import styled from 'styled-components';
import type { QuestionTypeValue } from '~relay/ProposalFormAdminConfigurationForm_proposalForm.graphql';

const ItemQuestionWrapper = styled.div`
  padding-right: 8px;
`;

const getIdFromQuestionType = (type: QuestionTypeValue): string => {
  const freeTypes = ['text', 'textarea', 'editor'];
  const mutipleUniqueTypes = ['button', 'radio', 'select'];
  const mutipleTypes = ['checkbox', 'ranking'];
  const mediaTypes = ['medias'];
  const sectionTypes = ['section'];
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
    return 'global.question.types.section';
  }

  return '';
};

type Props = {
  question: {
    type: QuestionTypeValue,
    title: string,
  },
  index: number,
  provided: {
    placeholder: string,
  },
  handleClickEdit: (index: number, type: QuestionTypeValue) => void,
  handleClickDelete: (index: number, type: QuestionTypeValue) => void,
};

export const QuestionAdmin = ({
  question,
  handleClickEdit,
  handleClickDelete,
  index,
  provided,
}: Props) => {
  const questionTypeId = getIdFromQuestionType(question.type);

  const iconClassType = classNames(
    'cap',
    { 'cap-bubble-ask-2': question.type !== 'section' },
    { 'cap-small-caps-1': question.type === 'section' },
  );

  return (
    <Row>
      <Col xs={8} className="d-flex align-items-center">
        <ItemQuestionWrapper>
          <i className="cap cap-android-menu" style={{ color: '#0388cc', fontSize: '20px' }} />
        </ItemQuestionWrapper>
        <ItemQuestionWrapper>
          <i className={iconClassType} style={{ color: '#707070', fontSize: '20px' }} />
        </ItemQuestionWrapper>
        <ItemQuestionWrapper>
          <strong>{question.title}</strong>
          <br />
          <span className="excerpt">
            {questionTypeId !== '' && <FormattedMessage id={questionTypeId} />}
          </span>
        </ItemQuestionWrapper>
      </Col>
      <Col xs={4}>
        <ButtonToolbar className="pull-right">
          <Button
            id={`js-btn-edit-${index}`}
            bsStyle="warning"
            className="btn-edit btn-outline-warning"
            onClick={handleClickEdit.bind(null, index, question.type)}>
            <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
          </Button>
          <Button
            id={`js-btn-delete-${index}`}
            bsStyle="danger"
            className="btn-outline-danger"
            onClick={handleClickDelete.bind(null, index, question.type)}>
            <i className="cap cap-times" /> <FormattedMessage id="global.delete" />
          </Button>
        </ButtonToolbar>
      </Col>
      {provided.placeholder}
    </Row>
  );
};
