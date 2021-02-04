// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger } from 'react-bootstrap';
import Tooltip from '~/components/Utils/Tooltip';
import Text from '~ui/Primitives/Text';

export type Props = {
  contributionsCount: number,
  project: {
    opinionsCount: number,
    versionsCount: number,
    argumentsCount: number,
    sourcesCount: number,
    repliesCount: number
  }
};

export const ProjectHeaderCounter = ({ project, contributionsCount }: Props) => {
  const { opinionsCount, versionsCount, argumentsCount, sourcesCount, repliesCount } = project;
  
  return <OverlayTrigger
    key="project-contribution-count-overlay"
    placement="top"
    overlay={
      <Tooltip id = "project-contribution-count">
        {opinionsCount > 0 && <Text><FormattedMessage id="proposal-count" values={{ count: opinionsCount }} /></Text> }
        {versionsCount > 0 && <Text><FormattedMessage id="amendment-count" values={{ count: versionsCount }} /></Text> }
        {argumentsCount > 0 && <Text><FormattedMessage id="argument-count" values={{ count: argumentsCount }} /></Text> }
        {sourcesCount > 0 && <Text><FormattedMessage id="source-count" values={{ count: sourcesCount }} /></Text> }
        {repliesCount > 0 && <Text><FormattedMessage id="answer-count" values={{ count: repliesCount }} /></Text> }
      </Tooltip >
    }>
    <span>
      <i className="cap cap-file-edit-1" />
      <span className="excerpt category">
        <span className="value ml-5 mr-5">{contributionsCount}</span>
        <FormattedMessage id="contribution-plural" values={{ num: contributionsCount }} />
      </span>
    </span>
  </OverlayTrigger >
};

export default ProjectHeaderCounter;
