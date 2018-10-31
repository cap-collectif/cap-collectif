// @flow
import * as React from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';

type Props = {
  jumps: Array<Object>,
};

export const ConditionalJumps = (props: Props) => {
  const { jumps } = props;

  const getConditionsValues = (conditions: Array<Object>) => {
    const conditionsLength = conditions.length;

    if (conditionsLength === 0) {
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
        {conditionKey > 0 &&
          conditionKey + 1 !== conditionsLength && (
            <React.Fragment>, {`"${condition.value.title}"`}</React.Fragment>
          )}
        {conditionKey > 0 &&
          conditionKey + 1 === conditionsLength && (
            <React.Fragment>
              {' '}
              <FormattedMessage id="event.and" /> {`"${condition.value.title}"`}
            </React.Fragment>
          )}
      </span>
    ));
  };

  if (jumps.length === 0) {
    return null;
  }

  return (
    <div className="visible-print-block conditional-jumps">
      {jumps.map((jump, jumpKey) => (
        <div key={jumpKey}>
          {getConditionsValues(jump.conditions)},{' '}
          {jump.destination &&
            jump.destination.number && (
              <FormattedHTMLMessage
                id="go-to-question-number"
                values={{ questionNumber: jump.destination.number }}
              />
            )}
        </div>
      ))}
    </div>
  );
};

export default ConditionalJumps;
