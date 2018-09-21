// @flow
import * as React from 'react';
import { ButtonToolbar, Button, Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

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
  handleClickDelete: (index: number) => void,
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
      <Col xs={8} style={{ display: 'flex' }}>
        <div>
          <i className="cap cap-android-menu icon--blue" />
        </div>
        <div>
          <i className={iconClassType} />
        </div>
        <div>
          <strong>{question.title}</strong>
          <br />
          <span className="excerpt">
            {questionTypeId !== '' && <FormattedMessage id={questionTypeId} />}
          </span>
        </div>
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
            onClick={handleClickDelete.bind(this, index)}>
            <i className="cap cap-times" /> <FormattedMessage id="global.delete" />
          </Button>
        </ButtonToolbar>
      </Col>
      {provided.placeholder}
    </Row>
  );
};
