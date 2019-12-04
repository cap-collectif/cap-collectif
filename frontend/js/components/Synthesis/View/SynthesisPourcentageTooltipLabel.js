// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';

export const calculPourcentage = (element: Object, parent: Object): number => {
  const percentage =
    Math.round((element.childrenElementsNb / parent.parentChildrenElementsNb) * 1000) / 10;
  return percentage > 0 ? percentage : 0;
};

type Props = {
  element: Object,
  parent: Object,
};

class SynthesisPourcentageTooltipLabel extends React.Component<Props> {
  render() {
    const { element, parent } = this.props;
    return (
      <FormattedMessage
        id="synthesis.percentage.tooltip"
        values={{
          contributions: element.childrenCount,
          scoreSign: element.childrenScore < 0 ? '-' : '+',
          score: Math.abs(element.childrenScore),
          percentage: calculPourcentage(element, parent),
        }}
      />
    );
  }
}

export default SynthesisPourcentageTooltipLabel;
