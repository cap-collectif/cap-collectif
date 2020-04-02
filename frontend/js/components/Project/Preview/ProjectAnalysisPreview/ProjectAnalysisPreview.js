// @flow
import * as React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import Card from '~ui/Card/Card';
import InlineList from '~ui/List/InlineList';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import type { ProjectAnalysisPreview_project } from '~relay/ProjectAnalysisPreview_project.graphql';
import ProjectAnalysisPreviewContainer, {
  DefaultCoverPreview,
} from '~/components/Project/Preview/ProjectAnalysisPreview/ProjectAnalysisPreview.style';

type Props = {
  project: ProjectAnalysisPreview_project,
  url: string,
};

const ProjectAnalysisPreview = ({ project, url }: Props) => {
  const { title, cover, steps } = project;

  return (
    <ProjectAnalysisPreviewContainer>
      <Card isHorizontal>
        <Card.Cover height="100%" width="120px">
          {cover?.url ? (
            <img src={cover.url} alt="" aria-hidden />
          ) : (
            <DefaultCoverPreview>
              <Icon name={ICON_NAME.doubleMessageBubble} size={55} />
            </DefaultCoverPreview>
          )}
        </Card.Cover>
        <Card.Body isHorizontal>
          <div>
            <Card.Title tagName="h3">
              <Link
                to={{
                  pathname: url,
                }}>
                {title}
              </Link>
            </Card.Title>
            <p>
              <FormattedMessage id="count-proposal" values={{ num: steps?.length }} />
            </p>
          </div>
          <InlineList>
            <li>
              <Icon name={ICON_NAME.taskList} size={16} color="#6c757d" />
              <span>
                <FormattedMessage id="count.status.to.do" values={{ num: 5 }} />
              </span>
            </li>
            <li>
              <Icon name={ICON_NAME.done} size={16} color="#6c757d" />
              <span>
                <FormattedMessage id="count.status.done" values={{ num: 0 }} />
              </span>
            </li>
          </InlineList>
        </Card.Body>
      </Card>
    </ProjectAnalysisPreviewContainer>
  );
};

export default createFragmentContainer(ProjectAnalysisPreview, {
  project: graphql`
    fragment ProjectAnalysisPreview_project on Project {
      title
      cover {
        url
      }
      steps {
        ... on ProposalStep {
          id
        }
      }
    }
  `,
});
