// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

type Rule = {
  type: string,
  number: number,
};

type Props = {
  validationRule: ?Rule,
  questionType: ?string,
  choices?: Array<Object>,
  helpPrint?: boolean,
};

export const QuestionPrintHelpText = (props: Props) => {
  const { choices, helpPrint, validationRule, questionType } = props;

  let rule;
  let message;

  if (!validationRule && questionType === 'checkbox' && helpPrint) {
    rule = <FormattedMessage id="several-possible-answers" />;
  }

  if (validationRule) {
    const { type, number } = validationRule;

    if (type === 'MIN') {
      rule = <FormattedMessage id="reply.constraints.choices_min" values={{ nb: number }} />;
    }

    if (type === 'MAX') {
      rule = <FormattedMessage id="reply.constraints.choices_max" values={{ nb: number }} />;
    }

    if (type === 'EQUAL') {
      rule = <FormattedMessage id="reply.constraints.choices_equal" values={{ nb: number }} />;
    }
  }

  if (questionType === 'ranking' && choices) {
    message = (
      <FormattedMessage
        id="sort-the-answers-by-numbering-them-from-one-to-n"
        values={{ questionsNumber: choices.length }}
      />
    );
  }

  if (questionType === 'select' || questionType === 'button') {
    message = <FormattedMessage id="one-possible-answer" />;
  }

  if (questionType === 'image' || questionType === 'medias') {
    message = <FormattedMessage id="document-to-be-attached-to-this-form" />;
  }

  if (questionType === 'number') {
    message = <FormattedMessage id="please-indicate-a-number" />;
  }

  if (message || rule) {
    return (
      <span className="visible-print-block help-block">
        {message}
        {rule}
      </span>
    );
  }

  return null;
};

export default QuestionPrintHelpText;
