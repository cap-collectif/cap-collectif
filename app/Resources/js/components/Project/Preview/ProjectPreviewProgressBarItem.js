import React from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import DatesInterval from './../../Utils/DatesInterval';

const ProjectPreviewProgressBarItem = React.createClass({
  propTypes: {
    projectStep: React.PropTypes.object.isRequired,
    style: React.PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      style: {},
    };
  },

  render() {
    const { projectStep } = this.props;
    const step = projectStep.step;
    const position = projectStep.position;
    const classes = classNames({
      'thumbnail__steps-bar__item': true,
      'thumbnail__steps-bar__item--closed': step.openingStatus === 'closed',
      'thumbnail__steps-bar__item--open': step.openingStatus === 'open',
      'thumbnail__steps-bar__item--future': step.openingStatus === 'future',
    });
    const popover = (
      <Popover
        id={'step-popover-' + step.id}
        title={
          <FormattedMessage
            message={this.getIntlMessage('project.preview.popover.title')}
            num={position}
          />
        }
      >
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
        </div>
      </Popover>
    );
    return (
    <OverlayTrigger
      rootClose
      placement="top"
      overlay={popover}
    >
      <span className={classes} style={this.props.style} />
    </OverlayTrigger>
    );
  },

});

export default ProjectPreviewProgressBarItem;
