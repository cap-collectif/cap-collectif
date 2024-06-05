import React from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { useLocation } from 'react-router-dom'
import { insertCustomCode } from '~/utils/customCode'
import type { CustomStepPageQuery as CustomStepPageQueryType } from '~relay/CustomStepPageQuery.graphql'
import WYSIWYGRender from '../Form/WYSIWYGRender'
import DatesInterval from '../Utils/DatesInterval'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import StepEvents from '~/components/Steps/StepEvents'
import { dispatchNavBarEvent } from '@shared/navbar/NavBar.utils'
import { useIntl } from 'react-intl'
type Props = {
  readonly stepId: string
}
const QUERY = graphql`
  query CustomStepPageQuery($stepId: ID!) {
    customStep: node(id: $stepId) {
      ... on Step {
        id
        body
        title
        project {
          title
          url
        }
        timeRange {
          startAt
          endAt
        }
        customCode
        ...StepEvents_step
        eventCount: events(orderBy: { field: START_AT, direction: DESC }) {
          totalCount
        }
      }
    }
  }
`

/*  
The following is just a react encapsulation of the content that was previously
in the src/Capco/AppBundle/Resources/views/Step/show.html.twig file.
It is mandatory to allow frontend navigation within all steps of a project.
This is neither a rework nor a DS migration. It may come later if/when we decide to
refresh this page
*/
export const CustomStepPage = ({ stepId }: Props) => {
  const { state } = useLocation<{ stepId?: string }>()
  const hasFeatureFlagCalendar = useFeatureFlag('calendar')
  const intl = useIntl()
  const data = useLazyLoadQuery<CustomStepPageQueryType>(QUERY, {
    stepId: state?.stepId || stepId,
  })
  React.useEffect(() => {
    insertCustomCode(data?.customStep?.customCode) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.customStep?.id])

  React.useEffect(() => {
    dispatchNavBarEvent('set-breadcrumb', [
      { title: intl.formatMessage({ id: 'navbar.homepage' }), href: '/' },
      { title: intl.formatMessage({ id: 'global.project.label' }), href: '/projects', showOnMobile: true },
      { title: data?.customStep?.project?.title, href: data?.customStep?.project?.url || '' },
      { title: data?.customStep?.title, href: '' },
    ])
  }, [data, intl])

  if (!data) return null
  const { customStep } = data
  if (!customStep) return null
  const { title, body, timeRange } = customStep
  return (
    <section className="section--alt" id={`customStep-${customStep.id || ''}`}>
      <div className="container">
        {customStep.eventCount && customStep.eventCount.totalCount > 0 && hasFeatureFlagCalendar && (
          <StepEvents step={customStep} />
        )}

        <h2 className="h2">{title}</h2>
        {timeRange?.startAt && (
          <div className="mb-30 project__step-dates">
            <i className="cap cap-calendar-2-1 mr-10" />
            <DatesInterval startAt={timeRange.startAt} endAt={timeRange.endAt} fullDay />
          </div>
        )}

        <div className="block">
          <WYSIWYGRender value={body} />
        </div>
      </div>
    </section>
  )
}
export default CustomStepPage
