// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

type Props = {
  question: Object,
};

export const QuestionItem = ({ question }: Props) => {
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
    <React.Fragment>
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
    </React.Fragment>
  );
};
