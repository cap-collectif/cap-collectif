import React, { Component } from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import environment, { graphqlError } from '../../createRelayEnvironment'
import ProposalFormAdminPageTabs from './ProposalFormAdminPageTabs'
import Loader from '../Ui/FeedbacksIndicators/Loader'
import type { ProposalFormAdminPageQueryResponse } from '~relay/ProposalFormAdminPageQuery.graphql'
import type { Uuid } from '../../types'

export type Props = {
  proposalFormId: Uuid
}

const component = ({
  error,
  props,
  retry,
}: ReactRelayReadyState & {
  props: ProposalFormAdminPageQueryResponse | null | undefined
}) => {
  if (error) {
    console.log(error) // eslint-disable-line no-console

    return graphqlError
  }

  if (props) {
    if (props.proposalForm) {
      if (!props.proposalForm.isIndexationDone) {
        if (retry) {
          setTimeout(() => {
            retry()
          }, 5000)
        }

        return <Loader />
      }

      const { proposalForm } = props
      return <ProposalFormAdminPageTabs proposalForm={proposalForm} query={props} />
    }

    return graphqlError
  }

  return <Loader />
}

export class ProposalFormAdminPage extends Component<Props> {
  render() {
    const { proposalFormId } = this.props
    return (
      <div className="admin_proposal_form">
        <QueryRenderer
          environment={environment as any}
          query={graphql`
            query ProposalFormAdminPageQuery($id: ID!) {
              proposalForm: node(id: $id) {
                ...ProposalFormAdminPageTabs_proposalForm
                ... on ProposalForm {
                  isIndexationDone
                }
              }
              ...ProposalFormAdminPageTabs_query
            }
          `}
          variables={{
            id: proposalFormId,
          }}
          render={component}
        />
      </div>
    )
  }
}
export default ProposalFormAdminPage
