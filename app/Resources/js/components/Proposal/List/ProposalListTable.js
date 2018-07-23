import * as React from 'react';
import {createFragmentContainer} from "react-relay";
import { Label } from "react-bootstrap";
import {FormattedDate, FormattedMessage} from "react-intl";
import moment from "moment";
import * as graphql from "graphql";
import type { ProposalListTable_proposals } from './__generated__/ProposalListTable_proposals.graphql';
import type { ProposalListTable_step } from './__generated__/ProposalListTable_step.graphql';
import UserAvatar from "../../User/UserAvatar";
import ProgressList from "../../Ui/List/ProgressList";
import ReactBootstrapTable from "../../Ui/ReactBootstrapTable";
import InlineList from "../../Ui/List/InlineList";

type Props = {
  proposals: ProposalListTable_proposals,
  step: ProposalListTable_step,
};

export class ProposalListTable extends React.Component<Props> {

  // move method here

  render() {
    const { proposals } = this.props;

    // console.log(step);

    const statusFormatter = (cell) => (
      <Label bsStyle={cell && cell.color} className="badge-pill">{cell && cell.name}</Label>
    );

    const titleFormatter = (cell) => (
      <a href={cell && cell.url}>
        {cell && cell.value}
      </a>
    );

    const implementationPhaseFormatter = (cell) => {
      const list = cell && cell.map(e => {
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

      const getTitle = () => {
        const openPhase = cell.filter(e => moment().isBetween(e.startAt, e.endAt));
        const toComePhase = cell.filter(e => moment().isBefore(e.startAt));
        const endPhase = cell[cell.length - 1];

        if(openPhase.length > 0) {
          return openPhase[0].title;
        }

        if(toComePhase.length > 0) {
          return toComePhase[0].title;
        }

        return endPhase.title;
      };

      return (
        <div className="m-auto">
          {getTitle() &&
            <div className="mb-10" >
              <span>
                {getTitle()}
              </span>
            </div>
          }
          <ProgressList list={list} className="mt-10" />
        </div>
      )
    };

    const authorFormatter = (cell) => (
      <div>
        {cell &&
          <UserAvatar
            user={{username: cell.displayName, media: cell.media, _links: {} }}
            defaultAvatar={null}
          />
        }
        {cell && cell.displayName}
      </div>
    );

    const estimationFormatter = (cell) => (
       <React.Fragment>{cell && <span>{cell} €</span>}</React.Fragment>
    );

    const likersFormatter = (cell) => (
       <InlineList className="mb-0">
         {cell && cell.map((user, index) => <li key={index}>{user.displayName}</li>)}
       </InlineList>
    );

    const lastActivityFormatter = (cell) => (
      <React.Fragment>
        <FormattedDate
          value={moment(cell.date)}
          day="numeric"
          month="long"
          year="numeric"
          hour="numeric"
          minute="numeric"
        />
        <span>{cell.user}</span>
      </React.Fragment>
    );


    const publishedOnFormatter = (cell) => (
      <FormattedDate
        value={moment(cell)}
        day="numeric"
        month="long"
        year="numeric"
        hour="numeric"
        minute="numeric"
      />
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
          console.warn(node);

          return (
            {
              title: { value: node.title, url: node.url },
              implementationPhase: node.progressSteps,
              status: node.status,
              author: node.author,
              ref: node.reference,
              district: node.district.name, // condition
              category: node.category.name, // condition
              theme: node.theme.title,
              priceEstimation: node.estimation,
              likers: node.likers,
              lastActivity: {
                date: node.updatedAt,
                user: node.updatedBy.displayName
              },
              publishedOn: node.createdAt, // not include // formatter date
            }
          )
        });

    const isHidden = (element) => {
      return data && data.filter(e => e[element]).length === 0
    };

    const columns = [
      { style: { width: '250px' }, hidden: isHidden('title'), dataField: 'title', text: 'admin.fields.selection.proposal',headerFormatter: columnTitleFormatter, formatter: titleFormatter },
      { style: { width: '200px' }, hidden: isHidden('implementationPhase'), dataField: 'implementationPhase', text: 'implementation-phase', headerFormatter: columnTitleFormatter, formatter: implementationPhaseFormatter},
      { style: { width: '200px' }, hidden: isHidden('status'), dataField: 'status', text: 'admin.fields.theme.status', headerFormatter: columnTitleFormatter, formatter: statusFormatter },
      { style: { width: '200px' }, hidden: isHidden('author'), dataField: 'author', text: 'project_download.label.author', headerFormatter: columnTitleFormatter, formatter: authorFormatter },
      { style: { width: '200px' }, hidden: isHidden('ref'), dataField: 'ref', text: 'proposal.admin.reference', headerFormatter: columnTitleFormatter },
      { style: { width: '200px' }, hidden: isHidden('district'), dataField: 'district', text: 'proposal.district', headerFormatter: columnTitleFormatter },
      { style: { width: '200px' }, hidden: isHidden('category'), dataField: 'category', text: 'proposal.category', headerFormatter: columnTitleFormatter },
      { style: { width: '200px' }, hidden: isHidden('theme'), dataField: 'theme', text: 'proposal.theme', headerFormatter: columnTitleFormatter },
      { style: { width: '200px' }, hidden: isHidden('priceEstimation'), dataField: 'priceEstimation', text: 'proposal.estimation', headerFormatter: columnTitleFormatter, formatter: estimationFormatter },
      { style: { width: '200px' }, hidden: isHidden('likers'), dataField: 'likers', text: 'project_download.label.likers', headerFormatter: columnTitleFormatter, formatter: likersFormatter },
      { style: { width: '200px' }, hidden: isHidden('lastActivity'), dataField: 'lastActivity', text: 'last-activity', headerFormatter: columnTitleFormatter, formatter: lastActivityFormatter },
      { style: { width: '150px' }, hidden: isHidden('publishedOn'), dataField: 'publishedOn', text: 'published-on', headerFormatter: columnTitleFormatter, formatter: publishedOnFormatter },
    ];

    const tableWidth =
      columns
        .filter(column => column.hidden !== true)
        .reduce((accumulator, currentValue) => accumulator + parseInt(currentValue.style.width, 0), 0);

    return (
      <ReactBootstrapTable width={tableWidth} keyField="title" columns={columns} data={data} />
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
          updatedAt
          updatedBy {
            displayName
          }
          createdAt
        }
      }
    }
  `,
});
