import React from 'react';
import { IntlMixin } from 'react-intl';
import CountersNav from './CountersNav';
import StepText from './StepText';

const StepInfos = React.createClass({
  propTypes: {
    step: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { step } = this.props;
    const counters = step.counters;
    const body = step.body;
    if (!body) {
      return null;
    }

    return (
      <div>
        <div className="step__infos block block--bordered">
          <CountersNav counters={counters} bordered={!!body} />
          <StepText text={body} />
        </div>
      </div>
    );
  },
});

export default StepInfos;
