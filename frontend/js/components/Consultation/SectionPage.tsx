import * as React from 'react'
import { connect } from 'react-redux'
import { QueryRenderer, graphql } from 'react-relay'
import environment, { graphqlError } from '../../createRelayEnvironment'
import Section from './Section'
import Loader from '../Ui/FeedbacksIndicators/Loader'
import type { SectionPageQuery$data } from '~relay/SectionPageQuery.graphql'
import type { GlobalState } from '../../types'
import { dispatchNavBarEvent } from '@shared/navbar/NavBar.utils'
import { useIntl } from 'react-intl'
export type Props = {
  readonly sectionId: string
  readonly isAuthenticated: boolean
}

const SectionWithBreadCrumb = ({ section }: { section: SectionPageQuery$data['section'] }) => {
  const intl = useIntl()

  React.useEffect(() => {
    dispatchNavBarEvent('set-breadcrumb', [
      { title: intl.formatMessage({ id: 'navbar.homepage' }), href: '/' },
      { title: intl.formatMessage({ id: 'global.project.label' }), href: '/projects', showOnMobile: true },
      { title: section?.consultation?.step?.project?.title, href: section?.consultation?.step?.project?.url || '' },
      { title: section?.consultation?.title, href: section?.consultation?.url || '' },
      { title: section?.title, href: '' },
    ])
  }, [intl, section])

  return <Section enablePagination level={0} section={section} consultation={section.consultation} />
}

const render = ({
  error,
  props,
}: ReactRelayReadyState & {
  props: SectionPageQuery$data | null | undefined
}) => {
  if (error) {
    return graphqlError
  }

  if (props) {
    const { section } = props

    if (section && section.consultation) {
      return <SectionWithBreadCrumb section={section} />
    }

    return graphqlError
  }

  return <Loader />
}

export const SectionPage = ({ sectionId, isAuthenticated }: Props) => {
  return (
    <div className="row">
      <QueryRenderer
        environment={environment}
        query={graphql`
          query SectionPageQuery($sectionId: ID!, $isAuthenticated: Boolean!) {
            section: node(id: $sectionId) {
              id
              ... on Section {
                title
                consultation {
                  title
                  url
                  step {
                    project {
                      title
                      url
                    }
                  }
                  ...Section_consultation @arguments(isAuthenticated: $isAuthenticated)
                }
              }
              ...Section_section
            }
          }
        `}
        variables={{
          sectionId,
          isAuthenticated,
        }}
        render={render}
      />
    </div>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  isAuthenticated: !!state.user.user,
})

export default connect(mapStateToProps)(SectionPage)
