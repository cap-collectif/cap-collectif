import React from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import ProjectPreviewPopoverContent from './ProjectPreviewPopoverContent';

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
      'thumbnail__steps-bar__item--closed': !step.isOpen,
      'thumbnail__steps-bar__item--open': step.isOpen,
      // 'thumbnail__steps-bar__item--future': step.openingStatus === 'future',
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
        <ProjectPreviewPopoverContent
          step={step}
        />
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
