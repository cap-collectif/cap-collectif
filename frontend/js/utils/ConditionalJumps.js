// @flow
import * as React from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';

type LogicJumpConditionOperator = 'IS' | 'IS_NOT';
type Conditions = ?$ReadOnlyArray<?{|
  +id: ?string,
  +operator: LogicJumpConditionOperator,
  +question: {|
    +id: string,
    +title: string,
  |},
  +value?: ?{|
    +id: string,
    +title: string,
  |},
|}>;

type Props = {
  jumps: ?$ReadOnlyArray<?{|
    +id: ?string,
    +always: boolean,
    +origin: {|
      +id: string,
    |},
    +destination: {|
      +id: string,
      +title: string,
      +number: number,
    |},
    +conditions: Conditions,
  |}>,
};

export const ConditionalJumps = (props: Props) => {
  const { jumps } = props;

  const getConditionsValues = (conditions: Conditions) => {
    if (!conditions || conditions.length === 0) {
      return null;
    }
    const conditionsLength = conditions.length;

    return conditions
      .filter(Boolean)
      .map(condition => condition.value)
      .filter(Boolean)
      .map((conditionValue, conditionKey) => (
        <span key={conditionKey}>
          {conditionKey === 0 && (
            <FormattedMessage
              id="if-you-have-answered"
              values={{ responseTitle: conditionValue.title }}
            />
          )}
          {conditionKey > 0 && conditionKey + 1 !== conditionsLength && (
            <React.Fragment>, {`"${conditionValue.title}"`}</React.Fragment>
          )}
          {conditionKey > 0 && conditionKey + 1 === conditionsLength && (
            <React.Fragment>
              {' '}
              <FormattedMessage id="event.and" /> {`"${conditionValue.title}"`}
            </React.Fragment>
          )}
        </span>
      ));
  };

  if (!jumps || jumps.length === 0) {
    return null;
  }

  return (
    <div className="visible-print-block conditional-jumps">
      {jumps.filter(Boolean).map((jump, jumpKey) => (
        <div key={jumpKey}>
          {getConditionsValues(jump.conditions)},{' '}
          {jump.destination && jump.destination.number && (
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
