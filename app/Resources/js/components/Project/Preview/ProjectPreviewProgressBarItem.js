// @flow
import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import ProjectPreviewPopoverContent from './ProjectPreviewPopoverContent';

const ProjectPreviewProgressBarItem = React.createClass({
  propTypes: {
    step: PropTypes.object.isRequired,
    style: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      style: {},
    };
  },

  render() {
    const { step, style } = this.props;
    const position = step.position;
    const classes = classNames({
      'thumbnail__steps-bar__item': true,
      'thumbnail__steps-bar__item--closed': step.status === 'closed',
      'thumbnail__steps-bar__item--open': step.status === 'open',
      'thumbnail__steps-bar__item--future': step.status === 'future',
    });
    const popover = (
      <Popover
        id={`step-popover-${step.id}`}
        title={
          <FormattedMessage
            message={this.getIntlMessage('project.preview.popover.title')}
            num={position}
          />
        }>
        <ProjectPreviewPopoverContent step={step} />
      </Popover>
    );
    return (
      <OverlayTrigger rootClose placement="top" overlay={popover}>
        <span className={classes} style={style} />
      </OverlayTrigger>
    );
  },
});

export default ProjectPreviewProgressBarItem;
