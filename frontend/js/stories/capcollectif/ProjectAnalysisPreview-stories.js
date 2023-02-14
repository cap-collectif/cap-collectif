// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { FormattedMessage } from 'react-intl';
import ProjectAnalysisPreviewContainer, {
  DefaultCoverPreview,
} from '~/components/Project/Preview/ProjectAnalysisPreview/ProjectAnalysisPreview.style';
import Card from '~ui/Card/Card';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import InlineList from '~ui/List/InlineList';
import Image from '~ui/Primitives/Image';

type Props = {
  project: {
    title: string,
    url: string,
    cover: {
      url: string,
    },
    steps: Array<Object>,
  },
};

const dataProject = {
  title: 'Ceci est un titre de projet',
  url: '#go',
  cover: {
    url: 'https://i.picsum.photos/id/74/1000/1000.jpg',
  },
  steps: [
    {
      id: '123',
    },
    {
      id: '456',
    },
  ],
};

const ProjectAnalysisPreview = ({ project }: Props) => {
  const { title, cover, steps } = project;

  return (
    <ProjectAnalysisPreviewContainer>
      <Card isHorizontal>
        <Card.Cover height="100%" width="120px">
          {cover?.url ? (
            <Image src={cover.url} alt="" aria-hidden />
          ) : (
            <DefaultCoverPreview>
              <Icon name={ICON_NAME.doubleMessageBubble} size={55} />
            </DefaultCoverPreview>
          )}
        </Card.Cover>
        <Card.Body isHorizontal>
          <div>
            <Card.Title tagName="h3">
              <a href="#go">{title}</a>
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

storiesOf('Cap Collectif/ProjectAnalysisPreview', module).add('default', () => {
  return <ProjectAnalysisPreview project={dataProject} />;
});
