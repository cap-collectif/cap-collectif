import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import ProposalsUserVotesStep from './ProposalsUserVotesStep'
import type { ProposalsUserVotesPage_project } from '~relay/ProposalsUserVotesPage_project.graphql'
import { getVotePageLabelByType } from '~/utils/interpellationLabelHelper'
import { TitleContainer } from './ProposalsUserVotes.style'

type Props = {
  project: ProposalsUserVotesPage_project
}

class ProposalsUserVotesPage extends React.Component<Props> {
  render() {
    const { project } = this.props
    return (
      <section id="ProposalsUserVotesPage">
        <TitleContainer>
          <h1 className="mb-0">
            <FormattedMessage
              id={
                project.type ? getVotePageLabelByType(project.type.title, 'project.votes.title') : 'project.votes.title'
              }
            />
          </h1>
        </TitleContainer>
        <div>
          <div className="container">
            {project.votableSteps.length > 0 ? (
              project.votableSteps
                .filter(step => !!step.id)
                .map((step, index) => <ProposalsUserVotesStep key={index} step={step} />)
            ) : (
              <p>
                <FormattedMessage
                  id={
                    project.type
                      ? getVotePageLabelByType(project.type.title, 'project.votes.no_active_step')
                      : 'project.supports.no_active_step'
                  }
                />
              </p>
            )}
          </div>
        </div>
      </section>
    )
  }
}

export default createFragmentContainer(ProposalsUserVotesPage, {
  project: graphql`
    fragment ProposalsUserVotesPage_project on Project {
      type {
        title
      }
      id
      votableSteps {
        id
        ...ProposalsUserVotesStep_step
      }
    }
  `,
})
