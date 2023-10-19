import * as React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import { connect } from 'react-redux'
import environment, { graphqlError } from '../../../createRelayEnvironment'
import Loader from '../../Ui/FeedbacksIndicators/Loader'
import ProposalAdminContentCreateForm from '~/components/Proposal/Admin/ProposalAdminContentCreateForm'

export type Props = {
  stepId: number
}

const createComponent = ({ error, props }: { error: Error | null | undefined; props: any }) => {
  if (error) {
    console.log(error) // eslint-disable-line no-console

    return graphqlError
  }

  if (props) {
    if (props.step !== null) {
      return <ProposalAdminContentCreateForm proposalForm={props.step.form} />
    }

    return graphqlError
  }

  return <Loader />
}

export const ProposalAdminCreatePage = ({ stepId }: Props) => {
  return (
    <div className="admin_proposal_form">
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProposalAdminCreatePageQuery($stepId: ID!) {
            step: node(id: $stepId) {
              id
              ... on ProposalStep {
                form {
                  ...ProposalAdminContentCreateForm_proposalForm
                }
              }
            }
          }
        `}
        variables={{
          stepId,
        }}
        render={createComponent}
      />
    </div>
  )
}
export default connect<any, any>()(ProposalAdminCreatePage)
