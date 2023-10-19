import * as React from 'react'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import type { ProjectAdminAnalysisNoProposals_project } from '~relay/ProjectAdminAnalysisNoProposals_project.graphql'
import AnalysisNoProposal from '~/components/Analysis/AnalysisNoProposal/AnalysisNoProposal'
import { useProjectAdminProposalsContext } from '~/components/Admin/Project/ProjectAdminPage.context'
import { getDifferenceFilters } from '~/components/Admin/Project/ProjectAdminProposals.utils'
type Props = {
  readonly project: ProjectAdminAnalysisNoProposals_project
}
export const ProjectAdminAnalysisNoProposals = ({ project }: Props) => {
  const { parameters } = useProjectAdminProposalsContext()
  const hasSelectedFilters = getDifferenceFilters(parameters.filters)
  return (
    <AnalysisNoProposal state={hasSelectedFilters ? 'CONTRIBUTION' : 'ANALYSIS'}>
      <FormattedMessage id="empty.tab.help.text" tagName="p" />
      {!project.firstAnalysisStep?.id ? (
        <FormattedHTMLMessage
          id="empty.tab.help.link"
          values={{
            url: project.adminAlphaUrl,
          }}
          tagName="p"
        />
      ) : null}
    </AnalysisNoProposal>
  )
}
export default createFragmentContainer(ProjectAdminAnalysisNoProposals, {
  project: graphql`
    fragment ProjectAdminAnalysisNoProposals_project on Project {
      id
      adminAlphaUrl
      firstAnalysisStep {
        id
      }
    }
  `,
})
