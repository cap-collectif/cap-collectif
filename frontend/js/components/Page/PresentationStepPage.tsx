import React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { useLocation } from 'react-router-dom'
import { insertCustomCode } from '~/utils/customCode'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import type { PresentationStepPageQuery as PresentationStepPageQueryType } from '~relay/PresentationStepPageQuery.graphql'
import WYSIWYGRender from '../Form/WYSIWYGRender'
import BlockPost from '../PresentationStep/BlockPost'
import StepEvents from '~/components/Steps/StepEvents'
import { dispatchNavBarEvent } from '@shared/navbar/NavBar.utils'
type Props = {
  readonly stepId: string
}
const QUERY = graphql`
  query PresentationStepPageQuery($stepId: ID!) {
    presentationStep: node(id: $stepId) {
      ... on PresentationStep {
        id
        body
        title
        customCode
        project {
          title
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
        }
        eventCount: events(orderBy: { field: START_AT, direction: DESC }) {
          totalCount
        }
        ...StepEvents_step
      }
    }
  }
`

/*  
The following is just a react encapsulation of the content that was previously
in the src/Capco/AppBundle/Resources/views/Step/presentation.html.twig file.
It is mandatory to allow frontend navigation within all steps of a project.
This is neither a rework nor a DS migration. It may come later if/when we decide to
refresh this page
*/
export const PresentationStepPage = ({ stepId }: Props) => {
  const { state } = useLocation<{ stepId?: string }>()
  const data = useLazyLoadQuery<PresentationStepPageQueryType>(
    QUERY,
    {
      stepId: state?.stepId || stepId,
    },
    {
      fetchPolicy: 'store-and-network',
    },
  )
  const calendar = useFeatureFlag('calendar')
  const blog = useFeatureFlag('blog')
  const intl = useIntl()

  React.useEffect(() => {
    insertCustomCode(data?.presentationStep?.customCode) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.presentationStep?.id])

  React.useEffect(() => {
    dispatchNavBarEvent('set-breadcrumb', [
      { title: intl.formatMessage({ id: 'navbar.homepage' }), href: '/' },
      { title: intl.formatMessage({ id: 'global.project.label' }), href: '/projects', showOnMobile: true },
      { title: data?.presentationStep?.project?.title, href: data?.presentationStep?.project?.url || '' },
      { title: data?.presentationStep?.title, href: '' },
    ])
  }, [data, intl])

  if (!data) return null
  const { presentationStep } = data
  if (!presentationStep) return null
  const { title, body, project, eventCount } = presentationStep
  if (!project) return null
  const { posts, consultationStepOpen, slug } = project
  return (
    <section className="section--alt" id={`presentationStep-${presentationStep.id || ''}`}>
      <div
        className="container"
        style={{
          paddingTop: 48,
        }}
      >
        <h2 className="h2">{title}</h2>
        <div className="block ">
          <WYSIWYGRender value={body} />
        </div>
        <div className="block">
          {consultationStepOpen ? (
            <p>
              <a className="btn btn-primary" href={consultationStepOpen.url}>
                {intl.formatMessage({
                  id: 'step.presentation.participe',
                })}
              </a>
            </p>
          ) : null}
        </div>

        {blog && posts?.totalCount > 0 ? (
          <div className="block">
            <h2 className="h2">
              {intl.formatMessage({
                id: 'menu.news',
              })}{' '}
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
              <a href={`/projects/${slug}/posts`} className="btn btn-primary btn--outline" id="project-posts">
                {intl.formatMessage({
                  id: 'view_all_posts',
                })}
              </a>
            ) : null}
          </div>
        ) : null}

        {(eventCount?.totalCount ?? 0) > 0 && calendar ? <StepEvents step={presentationStep} /> : null}
      </div>
    </section>
  )
}
export default PresentationStepPage
