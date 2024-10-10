import * as React from 'react'
import { graphql, QueryRenderer } from 'react-relay'
import environment, { graphqlError } from '../../createRelayEnvironment'
import Loader from '../Ui/FeedbacksIndicators/Loader'
import type { RelayGlobalId } from '../../types'
import type { ConsultationListBoxQuery$data } from '~relay/ConsultationListBoxQuery.graphql'
import ConsultationListView from './ConsultationListView'
import ConsultationStepHeader from './ConsultationStepHeader'
import { useIntl } from 'react-intl'
import { dispatchNavBarEvent } from '@shared/navbar/NavBar.utils'

export type Props = {
  readonly id: RelayGlobalId
}
const CONSULTATION_STEP_QUERY = graphql`
  query ConsultationListBoxQuery($consultationStepId: ID!) {
    step: node(id: $consultationStepId) {
      ... on ConsultationStep {
        title
        url
        project {
          title
          url
        }
        ...ConsultationStepHeader_step @arguments(exceptStepId: $consultationStepId)
        consultations {
          ...ConsultationListView_consultations
        }
      }
    }
  }
`

const ConsultationStepWithBreadCrumb = ({ step }: { step: ConsultationListBoxQuery$data['step'] }) => {
  const intl = useIntl()

  React.useEffect(() => {
    dispatchNavBarEvent('set-breadcrumb', [
      { title: intl.formatMessage({ id: 'navbar.homepage' }), href: '/' },
      { title: intl.formatMessage({ id: 'global.project.label' }), href: '/projects', showOnMobile: true },
      { title: step?.project?.title, href: step?.project?.url || '' },
      { title: step?.title, href: '' },
    ])
  }, [intl, step])

  return (
    <React.Fragment>
      <ConsultationStepHeader step={step} />
      <ConsultationListView consultations={step.consultations} />
    </React.Fragment>
  )
}

const ConsultationStep = ({
  error,
  props,
}: ReactRelayReadyState & {
  props: ConsultationListBoxQuery$data | null | undefined
}) => {
  if (error) {
    console.log(error) // eslint-disable-line no-console

    return graphqlError
  }

  if (props) {
    if (props.step && props.step.consultations) {
      return <ConsultationStepWithBreadCrumb step={props.step} />
    }

    return graphqlError
  }

  return <Loader />
}

export const ConsultationListBox = (props: Props) => {
  const { id: consultationStepId } = props
  return (
    <QueryRenderer
      environment={environment}
      query={CONSULTATION_STEP_QUERY}
      render={ConsultationStep}
      variables={{
        consultationStepId,
      }}
    />
  )
}
export default ConsultationListBox
