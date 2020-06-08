// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Panel } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import type { ProposalFusionList_proposal } from '~relay/ProposalFusionList_proposal.graphql';
import {translateContent} from "~/utils/ContentTranslator";

type Props = {|
  +proposal: ProposalFusionList_proposal,
|};

export class ProposalFusionList extends React.Component<Props> {
  render() {
    const { proposal } = this.props;
    return (
      <div>
        {proposal.mergedFrom.length > 0 && (
          <Panel>
            <Panel.Heading>
              <FormattedMessage
                id="proposal.fusionnedFrom"
                values={{ num: proposal.mergedFrom.length }}
              />
            </Panel.Heading>
            <Panel.Body>
              {proposal.mergedFrom.map(child => (
                <div key={child.id}>
                  <a href={child.url}>{translateContent(child.title)}</a>
                </div>
              ))}
            </Panel.Body>
          </Panel>
        )}
        {proposal.mergedIn.length > 0 && (
          <Panel>
            <Panel.Heading>
              <FormattedMessage
                id="proposal.fusionnedInto"
                values={{ num: proposal.mergedIn.length }}
              />
            </Panel.Heading>
            <Panel.Body>
              {proposal.mergedIn.map(parent => (
                <div key={parent.id}>
                  <a href={parent.url}>{translateContent(parent.title)}</a>
                </div>
              ))}
            </Panel.Body>
          </Panel>
        )}
      </div>
    );
  }
}

export default createFragmentContainer(ProposalFusionList, {
  proposal: graphql`
    fragment ProposalFusionList_proposal on Proposal {
      id
      mergedFrom {
        id
        url
        title
      }
      mergedIn {
        id
        url
        title
      }
    }
  `,
});
