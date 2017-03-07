// @flow
import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import { Tooltip } from 'react-bootstrap';

export const calculPourcentage = (element: Object, parent: Object): number => {
  let percentage = Math.round(
    (element.childrenElementsNb / parent.parentChildrenElementsNb) * 1000,
  ) / 10;
  percentage = percentage > 0 ? percentage : 0;
  return percentage;
};

const SynthesisPourcentageTooltip = React.createClass({
  propTypes: {
    element: PropTypes.object.isRequired,
    parent: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { element, parent } = this.props;
    return (
      <Tooltip>
        <FormattedMessage
          message={this.getIntlMessage('synthesis.percentage.tooltip')}
          contributions={element.publishedChildrenCount}
          scoreSign={element.childrenScore < 0 ? '-' : '+'}
          score={Math.abs(element.childrenScore)}
          percentage={calculPourcentage(element, parent)}
        />
      </Tooltip>
    );
  },
});

export default SynthesisPourcentageTooltip;
