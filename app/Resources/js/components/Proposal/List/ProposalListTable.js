import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import {createFragmentContainer} from "react-relay";
import { Label } from "react-bootstrap";
import * as graphql from "graphql";
import type { ProposalListTable_proposals } from './__generated__/ProposalListTable_proposals.graphql';
import UserAvatar from "../../User/UserAvatar";

type Props = {
  proposals: ProposalListTable_proposals,
};

export class ProposalListTable extends React.Component<Props> {
  render() {
    const { proposals } = this.props;

    const statusFormatter = (cell) => (
      <Label bsStyle={cell.color}>{cell.name}</Label>
    );

    const implementationPhaseFormatter = (cell) => (
      <div>
        {cell.map(e => (
          <li>{e.title}</li>
        ))}
      </div>
    );

    const authorFormatter = (cell) => (
      <div>
        <UserAvatar
          user={{username: cell.displayName, media: cell.media, _links: {} }}
          defaultAvatar={null}
        />
        {cell.displayName}
      </div>
    );

    const data =
      proposals.edges &&
      proposals.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map((node) => {
          return (
            {
              title: node.title,
              implementationPhase: node.progressSteps,
              status: node.status,
              author: node.author,
              ref: node.reference,
              // district: node.district.name, // condition
              // category: node.category.name, // condition
              theme: node.theme,
              priceEstimation: node.estimation,
              likers: node.likers.displayName,
              // state: node.state, // not include
              // lastActivity: node.news.node.updatedAt, // not sure/condition // formatter date
              // publishedOn: node.publishedOn, // not include // formatter date
              trashed: !!node.trashedAt,
              deletedAt: node.deletedAt // formatter date
            }
          )
        });

    const columns = [
      // Todo add translation
      { dataField: 'title', text: 'admin.fields.selection.proposal', sort: true },
      { dataField: 'implementationPhase', text: 'implementation-phase', formatter: implementationPhaseFormatter},
      { dataField: 'status', text: 'admin.fields.theme.status', formatter: statusFormatter },
      { dataField: 'author', text: 'project_download.label.author', formatter: authorFormatter },
      { dataField: 'ref', text: 'proposal.admin.reference' },
      { dataField: 'district', text: 'proposal.district' },
      { dataField: 'category', text: 'proposal.category' },
      { dataField: 'theme', text: 'proposal.theme' },
      { dataField: 'priceEstimation', text: 'proposal.estimation' },
      { dataField: 'likers', text: 'project_download.label.likers' },
      { dataField: 'state', text: 'proposal.admin.publication' },
      { dataField: 'lastActivity', text: 'last-activity' },
      { dataField: 'publishedOn', text: 'published-on' },
      { dataField: 'trashed', text: 'project_download.label.trashed' },
      { dataField: 'deletedAt', text: 'admin.fields.proposal.deleted_at' },
    ];

    return (
      <BootstrapTable keyField="title" columns={columns} data={data} />
    );
  }
}

export default createFragmentContainer(ProposalListTable, {
  proposals: graphql`
    fragment ProposalListTable_proposals on ProposalConnection
      @argumentDefinitions(
        stepId: { type: "ID", nonNull: false }
      ) {
      edges {
        node {
          id
          url
          title
          progressSteps {
            title
          }
          currentVotableStep {
            title
          }
          status(step: $stepId) {
            name
            color
          }
          author {
            displayName
            media {
              url
            }
          }
          reference
          district {
            name
          }
          category {
            name
          }
          theme {
            title
          }
          estimation
          likers {
            displayName
          }
          news {
            edges {
              node {
                updatedAt
              }
            }
          }
          trashedAt
          deletedAt
        }
      }
    }
  `,
});
