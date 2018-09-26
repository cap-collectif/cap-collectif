// @flow
import * as React from 'react';
import { ButtonToolbar, Button, Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import styled from 'styled-components';

const ItemQuestionWrapper = styled.div`
  padding-right: 8px;
`;

type Props = {
  question: {
    type: string,
    title: string,
  },
  index: number,
  provided: {
    placeholder: string,
  },
  handleClickEdit: (index: number, type: string) => void,
  handleClickDelete: (index: number, type: string) => void,
};

export const ProposalFormAdminQuestion = ({
  question,
  handleClickEdit,
  handleClickDelete,
  index,
  provided,
}: Props) => {
  let questionTypeId = '';

  const freeTypes = ['text', 'textarea', 'editor'];
  const mutipleUniqueTypes = ['button', 'radio', 'select'];
  const mutipleTypes = ['checkbox', 'ranking'];
  const mediaTypes = ['medias'];
  const sectionTypes = ['section'];

  if (freeTypes.includes(question.type)) {
    questionTypeId = 'global.question.types.free';
  }

  if (mutipleUniqueTypes.includes(question.type)) {
    questionTypeId = 'global.question.types.multiple_unique';
  }

  if (mutipleTypes.includes(question.type)) {
    questionTypeId = 'global.question.types.multiple_multiple';
  }

  if (mediaTypes.includes(question.type)) {
    questionTypeId = 'global.question.types.other';
  }

  if (sectionTypes.includes(question.type)) {
    questionTypeId = 'global.question.types.section';
  }

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
            bsStyle="warning"
            className="btn-outline-warning"
            onClick={handleClickEdit.bind(this, index, question.type)}>
            <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
          </Button>
          <Button
            bsStyle="danger"
            className="btn-outline-danger"
            onClick={handleClickDelete.bind(this, index, question.type)}>
            <i className="cap cap-times" /> <FormattedMessage id="global.delete" />
          </Button>
        </ButtonToolbar>
      </Col>
      {provided.placeholder}
    </Row>
  );
};
