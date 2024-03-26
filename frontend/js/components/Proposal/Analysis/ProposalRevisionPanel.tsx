import * as React from 'react'
import { Panel, PanelGroup } from 'react-bootstrap'
import { useFragment } from 'relay-hooks'
import { graphql } from 'react-relay'

import styled from 'styled-components'
import moment from 'moment'
import { useIntl } from 'react-intl'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import { styleGuideColors } from '~/utils/colors'
import type { ProposalRevision_proposal$key } from '~relay/ProposalRevision_proposal.graphql'
import { pxToRem } from '~/utils/styles/mixins'
const FRAGMENT = graphql`
  fragment ProposalRevisionPanel_proposal on Proposal {
    revisions(state: PENDING) {
      totalCount
      edges {
        node {
          id
          reason
          createdAt
          author {
            username
          }
        }
      }
    }
  }
`
type RelayProps = {
  readonly proposal: ProposalRevision_proposal$key
}
type Props = RelayProps
const ProposalRevisionsPanelContainer = styled(PanelGroup)`
  margin-bottom: 0;
  & .collapsable-icon {
    transition: all 0.3s;
    transform: rotate(0);
  }
  & a[aria-expanded='true'] .collapsable-icon {
    transform: rotate(180deg);
  }
  & .panel-default {
    border: none;
    box-shadow: none;
    color: ${styleGuideColors.blue800};
  }
  & .panel-default > .panel-heading + .panel-collapse > .panel-body {
    border: none;
    padding: ${pxToRem(20)} ${pxToRem(20)} 0;
    color: ${styleGuideColors.darkBlue};
  }
  & a {
    display: flex;
    align-items: center;
    &:hover,
    &:active,
    &:focus {
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }
  }
  & .panel-heading {
    border: none;
    padding: ${pxToRem(15)} ${pxToRem(20)};
    border-radius: 0;
    background: ${styleGuideColors.blue150};
  }
  & .panel-body {
    background: ${styleGuideColors.blue100};
  }
`

const ProposalRevisionPanel = ({ proposal: proposalFragment }: Props) => {
  const proposal = useFragment(FRAGMENT, proposalFragment)
  const intl = useIntl()
  if (proposal.revisions.totalCount === 0) return null
  return (
    <ProposalRevisionsPanelContainer accordion id="proposal-revisions">
      <Panel eventKey="1">
        <Panel.Heading>
          <Panel.Title toggle>
            <Icon className="mr-10" color={styleGuideColors.blue500} name={ICON_NAME.information} size="1.5rem" />
            {intl.formatMessage(
              {
                id: 'revision.request.awaiting',
              },
              {
                count: proposal.revisions.totalCount,
              },
            )}

            <Icon
              className="ml-10 collapsable-icon"
              color={styleGuideColors.blue800}
              name={ICON_NAME.thinArrowDown}
              size="1.5rem"
            />
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body collapsible>
          <ul className="list-style-none p-0">
            {proposal.revisions.edges
              ?.filter(Boolean)
              .map(edge => edge.node)
              .map(revision => (
                <li key={revision.id}>
                  <p className="font-weight-bold m-0">
                    {intl.formatMessage(
                      {
                        id: 'proposal-revision-user-date-motif',
                      },
                      {
                        username: revision.author.username,
                        date: moment(revision.createdAt).format('L'),
                      },
                    )}
                  </p>
                  <p className="m-0 mt-5">{revision.reason}</p>
                </li>
              ))}
          </ul>
        </Panel.Body>
      </Panel>
    </ProposalRevisionsPanelContainer>
  )
}

export default ProposalRevisionPanel
