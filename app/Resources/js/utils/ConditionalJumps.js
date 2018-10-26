// @flow
import * as React from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';

type Props = {
  jumps: Array<Object>,
};

const ConditionalJumps = (props: Props) => {
  const { jumps } = props;

  const getConditionsValues = (conditions: Array<Object>) => {
    if (conditions.length === 0) {
      return null;
    }

    return conditions.map((condition, conditionKey) => (
      <span key={conditionKey}>
        {conditionKey === 0 && (
          <FormattedMessage
            id="if-you-have-answered"
            values={{ responseTitle: condition.value.title }}
          />
        )}
        {conditionKey > 0 && (
          <React.Fragment>
            <FormattedMessage id="event.and" /> {condition.value.title}
          </React.Fragment>
        )}
      </span>
    ));
  };

  if (jumps.length === 0) {
    return null;
  }

  return (
    <div className="visible-print-block">
      {jumps.map((jump, jumpKey) => (
        <div key={jumpKey}>
          {getConditionsValues(jump.conditions)},{' '}
          <FormattedHTMLMessage
            id="go-to-question-number"
            values={{ questionNumber: jump.destination.title }}
          />
        </div>
      ))}
    </div>
  );
};

export default ConditionalJumps;
