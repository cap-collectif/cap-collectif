import * as React from 'react'
import type { RelayFragmentContainer } from 'react-relay'
import { createFragmentContainer, graphql } from 'react-relay'
import { Flex } from '@cap-collectif/ui'
import type { DebateStepPageLogic_query$data } from '~relay/DebateStepPageLogic_query.graphql'
import DebateStepPageMainActions from './MainActions/DebateStepPageMainActions'
import DebateStepPageFaceToFace from './FaceToFace/DebateStepPageFaceToFace'
import DebateStepPageLinkedArticles from './LinkedArticles/DebateStepPageLinkedArticles'
import DebateStepPageArguments from './Arguments/DebateStepPageArguments'
import DebateStepPageNotYetStarted from './NotYetStarted/DebateStepPageNotYetStarted'
import useIsMobile from '~/utils/hooks/useIsMobile'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context'
import { insertCustomCode } from '~/utils/customCode'
import { dispatchNavBarEvent } from '@shared/navbar/NavBar.utils'
import { useIntl } from 'react-intl'

export type Props = {
  readonly query: DebateStepPageLogic_query$data | null | undefined
}
export const DebateStepPageLogic = ({ query }: Props): JSX.Element => {
  const isMobile = useIsMobile()
  const intl = useIntl()
  const { widget } = useDebateStepPage()
  const step = query?.step || null
  const viewer = query?.viewer || null
  const showContent = query?.step?.debateType === 'WYSIWYG' && query?.step?.debateContent !== ''
  const showFaceToFace = query?.step?.debateType === 'FACE_TO_FACE'
  const hasStarted = query?.step?.timeRange?.hasStarted

  React.useEffect(() => {
    insertCustomCode(step?.customCode) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step?.id])

  React.useEffect(() => {
    dispatchNavBarEvent('set-breadcrumb', [
      { title: intl.formatMessage({ id: 'navbar.homepage' }), href: '/' },
      { title: intl.formatMessage({ id: 'global.project.label' }), href: '/projects', showOnMobile: true },
      { title: step?.project?.title, href: step?.project?.url || '' },
      { title: step?.label, href: '' },
    ])
  }, [step, intl])

  if (!hasStarted && step) return <DebateStepPageNotYetStarted step={step} />

  return (
    <Flex direction="column" spacing={8} id={`debateStep-${step?.id || ''}`}>
      <DebateStepPageMainActions isMobile={isMobile} step={step} />
      {showContent && <WYSIWYGRender value={step?.debateContent || ''} />}
      {(showFaceToFace || !step) && (
        <>
          <DebateStepPageFaceToFace isMobile={isMobile} step={step} />
          {!widget.isSource && <DebateStepPageLinkedArticles isMobile={isMobile} step={step} />}
        </>
      )}
      <DebateStepPageArguments isMobile={isMobile} step={step} viewer={viewer} />
    </Flex>
  )
}
export default createFragmentContainer(DebateStepPageLogic, {
  query: graphql`
    fragment DebateStepPageLogic_query on Query
    @argumentDefinitions(
      stepId: { type: "ID!" }
      isAuthenticated: { type: "Boolean!" }
      isMobile: { type: "Boolean!" }
    ) {
      viewer @include(if: $isAuthenticated) {
        ...DebateStepPageArguments_viewer
      }
      step: node(id: $stepId) {
        ... on Step {
          customCode
          id
          timeRange {
            hasStarted
          }
          title
          label
          project {
            title
            url
          }
        }
        ... on DebateStep {
          debateType
          debateContent
        }
        ...DebateStepPageNotYetStarted_step
        ...DebateStepPageArguments_step @arguments(isMobile: $isMobile)
        ...DebateStepPageMainActions_step @arguments(isAuthenticated: $isAuthenticated, isMobile: $isMobile)
        ...DebateStepPageFaceToFace_step @arguments(isMobile: $isMobile)

        ...DebateStepPageLinkedArticles_step @arguments(isMobile: $isMobile)
      }
    }
  `,
}) as RelayFragmentContainer<typeof DebateStepPageLogic>
