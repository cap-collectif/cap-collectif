// @flow
import React from 'react';
import { useIntl } from 'react-intl';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useLocation } from 'react-router-dom';
import { insertCustomCode } from '~/utils/customCode';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import type { PresentationStepPageQuery as PresentationStepPageQueryType } from '~relay/PresentationStepPageQuery.graphql';
import WYSIWYGRender from '../Form/WYSIWYGRender';
import BlockPost from '../PresentationStep/BlockPost';
import PresentationStepEvents from '../PresentationStep/PresentationStepEvents';

type Props = {| +stepId: string, +projectId: string |};

const QUERY = graphql`
  query PresentationStepPageQuery($stepId: ID!, $projectId: ID!) {
    presentationStep: node(id: $stepId) {
      ... on PresentationStep {
        id
        body
        title
        customCode
        project {
          url
          slug
          posts {
            totalCount
            edges {
              node {
                id
                ...BlockPost_post
              }
            }
          }
          consultationStepOpen {
            url
          }
          contributors {
            totalCount
            anonymousCount
          }
        }
      }
    }
    events(orderBy: { field: START_AT, direction: DESC }, project: $projectId, isFuture: null) {
      totalCount
    }
  }
`;

/*  
The following is just a react encapsulation of the content that was previously
in the src/Capco/AppBundle/Resources/views/Step/presentation.html.twig file.
It is mandatory to allow frontend navigation within all steps of a project.
This is neither a rework nor a DS migration. It may come later if/when we decide to
refresh this page
*/
export const PresentationStepPage = ({ stepId, projectId }: Props) => {
  const { state } = useLocation();
  const data = useLazyLoadQuery<PresentationStepPageQueryType>(
    QUERY,
    {
      stepId: state?.stepId || stepId,
      projectId,
    },
    { fetchPolicy: 'store-and-network' },
  );
  const calendar = useFeatureFlag('calendar');
  const blog = useFeatureFlag('blog');
  const share_buttons = useFeatureFlag('share_buttons');
  const intl = useIntl();

  React.useEffect(() => {
    insertCustomCode(data?.presentationStep?.customCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.presentationStep?.id]);

  if (!data) return null;
  const { presentationStep, events } = data;
  if (!presentationStep) return null;

  const { title, body, project } = presentationStep;

  if (!project) return null;

  const { contributors, url, posts, consultationStepOpen, slug } = project;

  return (
    <section className="section--alt">
      <div className="container" style={{ paddingTop: 48 }}>
        <h2 className="h2">{title}</h2>
        <div className="block ">
          <WYSIWYGRender value={body} />
        </div>
        <div className="block">
          {consultationStepOpen ? (
            <p>
              <a className="btn btn-primary" href={consultationStepOpen.url}>
                {intl.formatMessage({ id: 'step.presentation.participe' })}
              </a>
            </p>
          ) : null}
        </div>

        {blog && posts?.totalCount > 0 ? (
          <div className="block">
            <h2 className="h2">
              {intl.formatMessage({ id: 'menu.news' })}{' '}
              <span className="small excerpt">{posts.totalCount}</span>
            </h2>
            <ul className="media-list">
              {posts.edges
                ?.filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map(post => (
                  <BlockPost post={post} />
                ))}
            </ul>
            {posts.totalCount > 2 ? (
              <a
                href={`/projects/${slug}/posts`}
                className="btn btn-primary btn--outline"
                id="project-posts">
                {intl.formatMessage({ id: 'view_all_posts' })}
              </a>
            ) : null}
          </div>
        ) : null}

        {events?.totalCount && calendar ? <PresentationStepEvents projectId={projectId} /> : null}
        <div className="block">
          <h2 className="h2">
            {intl.formatMessage({ id: 'capco.section.metrics.participants' })}{' '}
            <span className="small excerpt">
              {contributors.totalCount + contributors.anonymousCount}
              {contributors.anonymousCount > 0
                ? intl.formatMessage(
                    { id: 'contributors-anonymous-count' },
                    { count: contributors.anonymousCount },
                  )
                : null}
            </span>
            {share_buttons ? (
              <a
                className="btn btn-primary pull-right"
                href={`mailto:?body=${url}`}
                title={intl.formatMessage({ id: 'share_button.share_on.email' })}>
                <i className="cap cap-user-add-2" />
                {intl.formatMessage({ id: 'project.share_button' })}
              </a>
            ) : null}
          </h2>
        </div>
      </div>
    </section>
  );
};

export default PresentationStepPage;
