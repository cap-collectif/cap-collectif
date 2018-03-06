// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

export const calculPourcentage = (element: Object, parent: Object): number => {
  const percentage =
    Math.round(element.childrenElementsNb / parent.parentChildrenElementsNb * 1000) / 10;
  return percentage > 0 ? percentage : 0;
};

const SynthesisPourcentageTooltipLabel = React.createClass({
  propTypes: {
    element: PropTypes.object.isRequired,
    parent: PropTypes.object.isRequired
  },

  render() {
    const { element, parent } = this.props;
    return (
      <FormattedMessage
        id="synthesis.percentage.tooltip"
        values={{
          contributions: element.childrenCount,
          scoreSign: element.childrenScore < 0 ? '-' : '+',
          score: Math.abs(element.childrenScore),
          percentage: calculPourcentage(element, parent)
        }}
      />
    );
  }
});

export default SynthesisPourcentageTooltipLabel;
