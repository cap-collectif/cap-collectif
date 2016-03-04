import React from 'react';
import { IntlMixin } from 'react-intl';
import DatesInterval from './../../Utils/DatesInterval';
import StepRemainingTime from '../../Steps/StepRemainingTime';

const ProjectPreviewPopoverContent = React.createClass({
  propTypes: {
    step: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { step } = this.props;
    return (
      <div>
        <p className="h5">{step.title}</p>
        <p><DatesInterval startAt={step.startAt} endAt={step.endAt} /></p>
        {
          step.openingStatus
            ? <p className="label label-default">
              {this.getIntlMessage('step.status.' + step.openingStatus)}
            </p>
            : null
        }
        {
          step.isOpen
          ? <p style={{ marginTop: '10px' }}>
              <StepRemainingTime step={step} />
            </p>
          : null
        }
      </div>
    );
  },

});

export default ProjectPreviewPopoverContent;
