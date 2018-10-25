// @flow
import * as React from 'react';

type Props = {
  jumps: Array<Object>;
}

const ConditionalJumps = (props: Props) => {
  const { jumps } = props;

  const getConditionValue = (conditions: Array<Object>) => {
    if(conditions.length === 0) {
      return null;
    }

    return (
      conditions.map((condition, conditionKey) => (
        <span key={conditionKey}>
          {conditionKey > 0 && 'et '}
          {condition.value.title}
        </span>
      ))
    )

  };

  if(jumps.length === 0) {
    return null;
  }

  return (
    jumps.map((jump, jumpKey) => (
      <div key={jumpKey}>
        Si vous avez répondu {getConditionValue(jump.conditions)}, allez à la question {jump.destination.id}
      </div>
    ))
  )
};

export default ConditionalJumps;
