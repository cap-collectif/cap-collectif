import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import {createFragmentContainer} from "react-relay";
import { Label } from "react-bootstrap";
import {FormattedMessage} from "react-intl";
import moment from "moment";
import * as graphql from "graphql";
import type { ProposalListTable_proposals } from './__generated__/ProposalListTable_proposals.graphql';
import type { ProposalListTable_step } from './__generated__/ProposalListTable_step.graphql';
import UserAvatar from "../../User/UserAvatar";
import ProgressList from "../../Ui/List/ProgressList";

type Props = {
  proposals: ProposalListTable_proposals,
  step: ProposalListTable_step,
};

export class ProposalListTable extends React.Component<Props> {
  render() {
    const { proposals } = this.props;

    const statusFormatter = (cell) => (
      <Label bsStyle={cell.color} className="badge-pill">{cell.name}</Label>
    );

    const titleFormatter = (cell) => (
      <a href={cell.url}>
        {cell.value}
      </a>
    );

    const implementationPhaseFormatter = (cell) => {
      const list = cell.map(e => {
        let isActive = false;

        if(moment().isSameOrAfter(e.startAt)) {
          isActive = true;
        }

        return (
          {
            title: e.title,
            isActive,
          }
        )
      });

      const getTitle = cell.filter(e => moment().isBetween(e.startAt, e.endAt));

      return (
        <div className="m-auto">
          {getTitle &&
            <div className="mb-10" >
              <span>
                {getTitle[0].title}
              </span>
            </div>
          }
          <ProgressList list={list} className="mt-10" />
        </div>
      )
    };

    const authorFormatter = (cell) => (
      <div>
        <UserAvatar
          user={{username: cell.displayName, media: cell.media, _links: {} }}
          defaultAvatar={null}
        />
        {cell.displayName}
      </div>
    );

    const columnTitleFormatter = (column) => (
      <FormattedMessage id={column.text} />
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
              title: { value: node.title, url: node.url },
              implementationPhase: node.progressSteps,
              status: node.status,
              author: node.author,
              ref: node.reference,
              district: node.district.name, // condition
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
      { dataField: 'title', text: 'admin.fields.selection.proposal', headerStyle: { width: 'auto'},headerFormatter: columnTitleFormatter, formatter: titleFormatter },
      { dataField: 'implementationPhase', text: 'implementation-phase', headerFormatter: columnTitleFormatter, formatter: implementationPhaseFormatter},
      { dataField: 'status', text: 'admin.fields.theme.status', headerFormatter: columnTitleFormatter, formatter: statusFormatter },
      { dataField: 'author', text: 'project_download.label.author', headerFormatter: columnTitleFormatter, formatter: authorFormatter },
      { dataField: 'ref', text: 'proposal.admin.reference', headerFormatter: columnTitleFormatter },
      { dataField: 'district', text: 'proposal.district', headerFormatter: columnTitleFormatter },
      { dataField: 'category', text: 'proposal.category', headerFormatter: columnTitleFormatter },
      { dataField: 'theme', text: 'proposal.theme', headerFormatter: columnTitleFormatter },
      { dataField: 'priceEstimation', text: 'proposal.estimation', headerFormatter: columnTitleFormatter },
      { dataField: 'likers', text: 'project_download.label.likers', headerFormatter: columnTitleFormatter },
      { dataField: 'state', text: 'proposal.admin.publication', headerFormatter: columnTitleFormatter },
      { dataField: 'lastActivity', text: 'last-activity', headerFormatter: columnTitleFormatter },
      { dataField: 'publishedOn', text: 'published-on', headerFormatter: columnTitleFormatter },
      { dataField: 'trashed', text: 'project_download.label.trashed', headerFormatter: columnTitleFormatter },
      { dataField: 'deletedAt', text: 'admin.fields.proposal.deleted_at', headerFormatter: columnTitleFormatter },
    ];

    return (
      <BootstrapTable keyField="title" columns={columns} data={data} />
    );
  }
}

export default createFragmentContainer(ProposalListTable, {
  step: graphql`
  fragment ProposalListTable_step on ProposalStep
    {
      form {
        usingThemes
        usingDistrict
        usingCategories
      }
    }
  `,
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
            startAt
            endAt
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
