// @flow
import * as React from 'react';
import Truncate from 'react-truncate';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
// import { FormattedMessage } from 'react-intl';
import ProjectPreviewThemes from './ProjectPreviewThemes';
import ProjectPreviewProgressBar from './ProjectPreviewProgressBar';
import ProjectPreviewCounters from './ProjectPreviewCounters';

const ProjectPreviewBody = React.createClass({
  propTypes: {
    project: React.PropTypes.object.isRequired,
  },

  shouldRenderProgressBar() {
    const { project } = this.props;
    return (
      project.steps.filter(step => {
        return (
          !step.startAt &&
          !step.endAt &&
          step.type !== 'presentation' &&
          step.type !== 'ranking' &&
          step.type !== 'other' &&
          step.timeless
        );
      }).length === 0 && project.steps.length > 0
    );
  },

  render() {
    const { project } = this.props;

    // console.log(project);

    const externalLink = project._links.external;
    // let progress;
    // if (this.shouldRenderProgressBar()) {
    //   progress = (
    //     <div>
    //       <ProjectPreviewProgressBar project={project} />
    //     </div>
    //   );
    // }

    const link = externalLink || project._links.show;
    const tooltip = <Tooltip id={`project-${project.id}-tooltip`}>{project.title}</Tooltip>;

    return (
      <div className="box project__preview__body">
        <div className="project__preview__body__infos">
          <ProjectPreviewThemes project={project} />
          <h2
            className="h4 project__preview__title"
            style={{ height: 'auto', lineHeight: 'auto', margin: '5px 0' }}>
            <OverlayTrigger placement="top" overlay={tooltip}>
              <a href={link}>
                <div style={{ width: '98%' }}>
                  <Truncate lines={3}>{project.title}</Truncate>
                  {externalLink && (
                    <svg
                      style={{
                        marginLeft: 5,
                        display: 'inline-block',
                        height: 16,
                        width: 16,
                      }}
                      version="1.1"
                      id="Calque_1"
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      viewBox="0 0 89.7 90.1"
                      xmlSpace="preserve">
                      <g className="externalLinkSvg">
                        <path d="M85.5,0H56.9c-2.3,0-4.2,1.9-4.2,4.2s1.9,4.2,4.2,4.2h19.1L35.1,49.2c-1.6,1.6-1.6,4.3,0,5.9c0.8,0.8,1.9,1.2,2.9,1.2
                            s2.1-0.4,2.9-1.2l40.4-40.4v18.2c0,2.3,1.9,4.2,4.2,4.2s4.2-1.9,4.2-4.2V4.2C89.7,1.9,87.8,0,85.5,0z" />
                        <path d="M71.1,41.9c-2.3,0-4.2,1.9-4.2,4.2V79c0,1.5-1.3,2.8-2.8,2.8H11.1c-1.5,0-2.8-1.3-2.8-2.8V25.9c0-1.5,1.3-2.8,2.8-2.8h33
                            c2.3,0,4.2-1.9,4.2-4.2s-1.9-4.2-4.2-4.2h-33C5,14.8,0,19.7,0,25.9V79c0,6.1,5,11.1,11.1,11.1h53.1c6.1,0,11.1-5,11.1-11.1V46.1
                            C75.3,43.8,73.4,41.9,71.1,41.9z" />
                      </g>
                    </svg>
                  )}
                </div>
              </a>
            </OverlayTrigger>
          </h2>
          <Truncate lines={1} className="project__preview__author excerpt small">
            {project.author.displayName}
          </Truncate>
          {project.hasParticipativeStep && <ProjectPreviewCounters project={project} /> }
        </div>
        {this.shouldRenderProgressBar() &&<ProjectPreviewProgressBar project={project} />}
        <div className="project__preview__actions">

          {project.hasParticipativeStep && <span>-- jours restant</span>}
        </div>
      </div>
    );
  },
});

export default ProjectPreviewBody;
