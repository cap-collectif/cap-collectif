// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import DatesInterval from './../../Utils/DatesInterval';
import RemainingTime from '../../Utils/RemainingTime';

const ProjectPreviewPopoverContent = React.createClass({
  propTypes: {
    step: React.PropTypes.object.isRequired,
  },

  render() {
    const { step } = this.props;
    return (
      <div>
        <p className="h5">
          {step.title}
        </p>
        <p>
          <DatesInterval startAt={step.startAt} endAt={step.endAt} />
        </p>
        {step.status
          ? <p className="label label-default">
              <FormattedMessage id={`step.status.${step.status}`} />
            </p>
          : null}
        {step.open && step.counters
          ? <p style={{ marginTop: '10px' }}>
              <RemainingTime
                hours={step.counters.remainingHours}
                days={step.counters.remainingDays}
              />
            </p>
          : null}
      </div>
    );
  },
});

export default ProjectPreviewPopoverContent;
